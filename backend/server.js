const express = require('express');
const cors = require('cors');
const { Client } = require("@gradio/client");
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const Claim = require('./models/Claim'); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. MULTI-KEY ROTATOR LOGIC ---
// This pulls all 3 keys from your .env file to bypass the 1,500 limit
const ALL_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2
].filter(k => k); 

let keyIndex = 0;

/**
 * Gets the next Gemini model instance using the round-robin rotator.
 */
const getNextGeminiModel = () => {
    const key = ALL_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % ALL_KEYS.length; // Rotate for the next call
    
    const genAI = new GoogleGenerativeAI(key);
    return genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        safetySettings: [
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }
        ]
    });
};

// --- 2. MIDDLEWARE & RATE LIMITING ---
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 15, // Total 15 requests per minute allowed across all teammates
  message: { error: "System cooling down. Gemini needs 60 seconds to reset!" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Shields the AI routes from spam
app.use('/api/segment-car', aiLimiter);
app.use('/api/explain', aiLimiter);

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}
const upload = multer({ dest: 'uploads/' });

// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔥 MongoDB Atlas Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- 4. CORE AI ROUTE (YOLOv11 + ROTATING GEMINI) ---
app.post('/api/segment-car', upload.single('image'), async (req, res) => {
    console.log(`\n--- [DEBUG] Analysis Request (Key Index: ${keyIndex}) ---`);
    try {
        if (!req.file) return res.status(400).json({ error: "No image payload." });

        const imageBuffer = fs.readFileSync(req.file.path);
        const imageBlob = new Blob([imageBuffer], { type: req.file.mimetype });

        // A. STEP 1: YOLOv11 Segmentation via Hugging Face
        console.log("[DEBUG] Connecting to Hugging Face...");
        const client = await Client.connect("Userabc/segmenter");
        const result = await client.predict("/predict", { img: imageBlob });

        fs.unlinkSync(req.file.path);

        if (result.data && result.data[0]) {
            const fileInfo = result.data[0];
            const jsonUrl = typeof fileInfo === 'string' ? fileInfo : fileInfo.url;
            const hfResponse = await axios.get(jsonUrl);
            const reportData = hfResponse.data;

            const vehicleDetails = JSON.parse(req.body.vehicleDetails || "{}");
            const incidentDetails = JSON.parse(req.body.incidentDetails || "{}");

            // B. STEP 2: Use Rotated Gemini for Cost Calculation
            console.log("[DEBUG] Requesting Gemini Cost Adjuster...");
            const model = getNextGeminiModel();
            const costPrompt = `
                You are an expert Insurance Adjuster in India.
                CAR: ${vehicleDetails.year} ${vehicleDetails.model} (Value: ₹${vehicleDetails.car_model_val})
                YOLO DETECTION: ${JSON.stringify(reportData.part_name)} damaged, ratio ${JSON.stringify(reportData.damage_ratio)}.
                Return ONLY a JSON object: {"total_cost": number, "reasoning": "string"}
            `;

            const geminiResult = await model.generateContent(costPrompt);
            const responseText = await geminiResult.response.text();
            
            // Fix: Strip markdown backticks before parsing
            const cleanJson = responseText.replace(/```json|```/g, "").trim();
            
            try {
                const costJson = JSON.parse(cleanJson);
                reportData.total_cost = costJson.total_cost;
                reportData.gemini_reasoning = costJson.reasoning;
            } catch (e) {
                console.error("[ERROR] Gemini JSON Parse Failed:", responseText);
                reportData.total_cost = 0; // Fallback
            }

            // C. STEP 3: Save final Claim to MongoDB
            const newClaim = new Claim({
                vehicleDetails,
                incidentDetails,
                aiReport: reportData,
                hfFileUrl: jsonUrl
            });

            const savedClaim = await newClaim.save();
            console.log(`💰 Real-time Cost Calculated: ₹${reportData.total_cost}`);

            res.json({ success: true, claimId: savedClaim._id, report: reportData });
        }
    } catch (error) {
        console.error("Pipeline Error:", error.message);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "Analysis failed", details: error.message });
    }
});

// --- 5. XAI REASONING ROUTE ---
app.post('/api/explain', async (req, res) => {
    console.log(`\n--- [DEBUG] XAI Lab Query Received ---`);
    try {
        const { claimId, message } = req.body;
        const claim = await Claim.findById(claimId);
        if (!claim) return res.status(404).json({ error: "Claim not found." });

        const model = getNextGeminiModel();
        const prompt = `
            You are the XAI (Explainable AI) module for InsureVision.
            CONTEXT (Claim ID: ${claimId}):
            - Vehicle: ${claim.vehicleDetails?.year} ${claim.vehicleDetails?.model}
            - Incident: ${claim.incidentDetails?.description}
            - AI Assessment: ₹${claim.aiReport?.total_cost}
            - Parts Detected: ${JSON.stringify(claim.aiReport?.part_name)}
            
            USER QUESTION: "${message}"
            Provide a technical but understandable explanation of how the AI arrived at its conclusions.
        `;

        const result = await model.generateContent(prompt);
        const text = await result.response.text();
        res.json({ answer: text });
    } catch (error) {
        console.error("XAI Error:", error.message);
        res.status(500).json({ error: "XAI logic failed." });
    }
});

// --- 6. DATA FETCHING & START ---
app.get('/api/claims', async (req, res) => {
    try {
        const claims = await Claim.find().sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch claims." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 InsureVision Live (3-Key Rotator): http://localhost:${PORT}`);
});