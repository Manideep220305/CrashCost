// ============================================================
// CLAIM CONTROLLER — All business logic for claim operations
// ============================================================
// This is the "C" in MVC. It handles:
//   1. analyzeClaim   → Sends image to HF, saves result in MongoDB
//   2. explainClaim   → Uses Gemini to explain a saved claim
//   3. getAllClaims    → Fetches all claims for a specific user
//   4. getClaimById   → Fetches a single claim by its ID
//
// WHY separate from routes?
//   Routes define WHAT URL does WHAT.
//   Controllers define HOW it's actually done.
//   This makes testing and debugging much easier.
//
// AUTHENTICATION:
//   Routes that modify or read user data use authMiddleware.
//   The middleware decodes the JWT and attaches `req.user = { id }`
//   so the controller knows WHO is making the request.
// ============================================================

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Claim = require('../models/Claim');
const { getNextGeminiModel } = require('../config/gemini');

// ─────────────────────────────────────────────
// The URL of your CrashCost AI Engine on HF
// This is the FastAPI endpoint that runs YOLO + CLIP + CatBoost
// ─────────────────────────────────────────────
const HF_API_URL = "https://saimanideep-crashcostv2.hf.space/api/v1/audit";


// ============================================================
// 1. ANALYZE CLAIM — The main AI pipeline
// ============================================================
// Flow: Frontend → Express → Hugging Face → MongoDB → Frontend
//
// What happens step by step:
//   a) Read the uploaded image file from disk
//   b) Build a FormData payload with image + vehicle params
//   c) Send it to the HF FastAPI (which runs YOLO+CLIP+CatBoost)
//   d) Receive detections with prices, summaries, narratives
//   e) Save everything in MongoDB as a new Claim (with userId!)
//   f) Return the result to the frontend
//
// AUTHENTICATION:
//   This route is protected by authMiddleware.
//   req.user.id contains the MongoDB ObjectId of the logged-in user.
//   We save this on the claim so we can filter by user later.
// ============================================================
const analyzeClaim = async (req, res) => {
    console.log("\n--- [CONTROLLER] New Analysis Request ---");

    try {
        // VALIDATION: Make sure an image was uploaded
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded. Please attach a photo." });
        }

        // ─── A. Parse vehicle details from the frontend form ───
        const vehicleDetails = JSON.parse(req.body.vehicleDetails || "{}");
        const incidentDetails = JSON.parse(req.body.incidentDetails || "{}");

        // ─── B. Build the multipart form for HF API ───
        // We need to send: image + brand + tier + segment + location + age
        const imageBuffer = fs.readFileSync(req.file.path);
        const form = new FormData();

        form.append('image', imageBuffer, {
            filename: req.file.originalname || 'upload.jpg',
            contentType: req.file.mimetype || 'image/jpeg'
        });

        // Map frontend vehicle fields → HF API fields
        form.append('brand', vehicleDetails.brand || vehicleDetails.make || 'unknown');
        form.append('tier', vehicleDetails.tier || 'mid');
        form.append('segment', vehicleDetails.segment || 'sedan');
        form.append('location', vehicleDetails.damageLocation || 'front');
        form.append('age', String(vehicleDetails.car_age || 5));

        console.log("[CONTROLLER] Sending to HF:", {
            brand: vehicleDetails.brand,
            tier: vehicleDetails.tier,
            segment: vehicleDetails.segment,
            location: vehicleDetails.damageLocation,
            age: vehicleDetails.car_age,
            userId: req.user?.id  // Log who's submitting
        });

        // ─── C. Call the Hugging Face CrashCost Engine ───
        const hfResponse = await axios.post(HF_API_URL, form, {
            headers: form.getHeaders(),
            timeout: 120000,  // 2 minute timeout (models can be slow on free tier)
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        let aiReport = hfResponse.data;
        console.log(`[CONTROLLER] HF Raw Response: ${aiReport.detections?.length || 0} detections, ₹${aiReport.total_estimate}`);

        // ─── C.5 DEDUPLICATION FILTER ───
        // YOLO sometimes outputs nested/overlapping boxes for the same damage (e.g. 3 "DENT" boxes inside each other).
        // This causes the price to multiply. We filter them out here before saving.
        if (aiReport.detections && aiReport.detections.length > 0) {
            const uniqueDetections = [];

            const computeOverlap = (current, kept) => {
                const xa = Math.max(current.bbox.x1, kept.bbox.x1);
                const ya = Math.max(current.bbox.y1, kept.bbox.y1);
                const xb = Math.min(current.bbox.x2, kept.bbox.x2);
                const yb = Math.min(current.bbox.y2, kept.bbox.y2);
                const interArea = Math.max(0, xb - xa) * Math.max(0, yb - ya);

                const currentArea = (current.bbox.x2 - current.bbox.x1) * (current.bbox.y2 - current.bbox.y1);
                const keptArea = (kept.bbox.x2 - kept.bbox.x1) * (kept.bbox.y2 - kept.bbox.y1);
                const unionArea = currentArea + keptArea - interArea;

                const iou = unionArea > 0 ? interArea / unionArea : 0;
                // Check if current is completely swallowed by kept
                const containment = currentArea > 0 ? interArea / currentArea : 0;

                return { iou, containment };
            };

            for (const current of aiReport.detections) {
                let isDuplicate = false;
                for (const kept of uniqueDetections) {
                    if (current.label === kept.label) {
                        const { iou, containment } = computeOverlap(current, kept);
                        // If 30% IoU OR >50% of the box is inside another box of the same label, drop it
                        if (iou > 0.30 || containment > 0.50) {
                            isDuplicate = true;
                            break;
                        }
                    }
                }
                if (!isDuplicate) {
                    uniqueDetections.push(current);
                }
            }

            // Recalculate totals based ONLY on unique detections
            if (uniqueDetections.length !== aiReport.detections.length) {
                console.log(`[CONTROLLER] Deduplicated ${aiReport.detections.length} boxes down to ${uniqueDetections.length} unique boxes.`);

                let newTotal = 0;
                uniqueDetections.forEach(d => { newTotal += d.price; });

                aiReport.detections = uniqueDetections;
                aiReport.total_estimate = newTotal;

                // Recalculate actuarial range on the new total
                if (newTotal < 50000) {
                    aiReport.estimate_range = [Math.max(800, Math.floor(newTotal * 0.85)), Math.floor(newTotal * 1.15)];
                } else {
                    aiReport.estimate_range = [Math.floor(newTotal * 0.92), Math.floor(newTotal * 1.08)];
                }
                console.log(`[CONTROLLER] Recalculated new Total Estimate: ₹${newTotal}`);
            }
        }

        // ─── D. Clean up the uploaded temp file ───
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // ─── E. Save to MongoDB (now with userId!) ───
        // The userId comes from the JWT decoded by authMiddleware.
        // This is how we know which user submitted this claim.
        const newClaim = new Claim({
            userId: req.user?.id,   // ← NEW: Bind claim to logged-in user
            vehicleDetails: {
                ...vehicleDetails,
                brand: vehicleDetails.brand || vehicleDetails.make,
                damageLocation: vehicleDetails.damageLocation
            },
            incidentDetails,
            aiReport: {
                total_estimate: aiReport.total_estimate,
                estimate_range: aiReport.estimate_range,
                context: aiReport.context,
                detections: aiReport.detections
            }
        });

        const savedClaim = await newClaim.save();
        console.log(`[CONTROLLER] ✅ Claim saved: ${savedClaim._id} for user: ${req.user?.id}`);

        // ─── F. Return success to frontend ───
        res.json({
            success: true,
            message: "AI analysis complete",
            claimId: savedClaim._id,
            report: aiReport    // Full HF response for frontend to display
        });

    } catch (error) {
        console.error("[CONTROLLER] Pipeline Error:", error.message);

        // Clean up temp file even if something went wrong
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Give a helpful error message based on what went wrong
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return res.status(504).json({
                error: "AI Engine timeout",
                details: "The Hugging Face model is still warming up. Please try again in 2-3 minutes."
            });
        }

        res.status(500).json({
            error: "Analysis failed",
            details: error.message
        });
    }
};


// ============================================================
// 2. EXPLAIN CLAIM — XAI Lab (Gemini explains the AI's decision)
// ============================================================
// Flow: Frontend sends claimId + question → We load the claim from
//       MongoDB → Build a context prompt → Ask Gemini → Return answer
//
// This is our "Ask AI" feature. Users can ask questions like:
//   "Why is the bumper repair so expensive?"
//   "What does MINOR severity mean?"
//   "Can you break down the cost estimate?"
//
// Gemini gets the FULL claim context (vehicle, detections, prices)
// and generates a clear, technical explanation.
// ============================================================
const explainClaim = async (req, res) => {
    console.log("\n--- [CONTROLLER] XAI Explanation Request ---");

    try {
        const { claimId, message } = req.body;

        // Load the saved claim from MongoDB
        const claim = await Claim.findById(claimId);
        if (!claim) {
            return res.status(404).json({ error: "Claim not found in database." });
        }

        // Get the next Gemini model (round-robin key rotation)
        const model = getNextGeminiModel();

        // Build a rich context prompt so Gemini knows what to explain
        const detectionSummary = (claim.aiReport?.detections || [])
            .map(d => `- ${d.label}: ${d.severity}, ₹${d.price} (${d.summary})`)
            .join('\n');

        const prompt = `
            You are the XAI (Explainable AI) module for InsureVision CrashCost.
            
            CLAIM CONTEXT (ID: ${claimId}):
            - Vehicle: ${claim.vehicleDetails?.year || ''} ${claim.vehicleDetails?.make || claim.vehicleDetails?.brand || ''} ${claim.vehicleDetails?.model || ''}
            - Tier: ${claim.vehicleDetails?.tier || 'unknown'}, Segment: ${claim.vehicleDetails?.segment || 'unknown'}
            - Damage Location: ${claim.vehicleDetails?.damageLocation || 'unknown'}
            - Vehicle Age: ${claim.vehicleDetails?.car_age || 'unknown'} years
            - Incident: ${claim.incidentDetails?.description || 'No description provided'}
            
            AI ASSESSMENT:
            - Total Estimate: ₹${claim.aiReport?.total_estimate || 0}
            - Estimate Range: ₹${claim.aiReport?.estimate_range?.[0] || 0} – ₹${claim.aiReport?.estimate_range?.[1] || 0}
            - Detections:
            ${detectionSummary || 'No detections found'}
            
            USER QUESTION: "${message}"
            
            Provide a clear, technical but understandable explanation. Use bullet points for clarity.
            Focus on the specific question asked. Reference the actual data above in your answer.
        `;

        const result = await model.generateContent(prompt);
        const text = await result.response.text();

        res.json({ answer: text });

    } catch (error) {
        console.error("[CONTROLLER] XAI Error:", error.message);
        res.status(500).json({ error: error.message || "XAI logic failed." });
    }
};


// ============================================================
// 3. GET ALL CLAIMS — Fetch claim history for logged-in user
// ============================================================
// If a `userId` query param is provided, only return that user's claims.
// Otherwise return all claims (for admin/debug purposes).
//
// The frontend passes ?userId=xxx to get only the logged-in user's claims.
// Results are sorted newest-first by createdAt.
//
// Each claim includes: vehicleDetails, incidentDetails, aiReport,
// status, timestamps — everything needed for the analytics page.
// ============================================================
const getAllClaims = async (req, res) => {
    try {
        const { userId } = req.query;

        // Build query: filter by userId if provided
        const query = userId ? { userId } : {};

        const claims = await Claim.find(query).sort({ createdAt: -1 }); // Newest first
        res.json(claims);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch claims." });
    }
};


// ============================================================
// 4. GET CLAIM BY ID — Fetch a single claim for detail view
// ============================================================
// Used by the analytics page when a user clicks "View Report"
// on a specific claim. Returns the full claim document including
// the complete aiReport with all detections and narratives.
//
// URL: GET /api/claims/:id
// Params: id — MongoDB ObjectId of the claim
// ============================================================
const getClaimById = async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({ error: "Claim not found." });
        }

        res.json(claim);
    } catch (error) {
        console.error("[CONTROLLER] Get Claim Error:", error.message);
        res.status(500).json({ error: "Failed to fetch claim." });
    }
};


// Export all controller functions
module.exports = {
    analyzeClaim,
    explainClaim,
    getAllClaims,
    getClaimById
};
