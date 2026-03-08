// ============================================================
// CLAIM ROUTES — Defines what URL does what
// ============================================================
// This is the "R" in a typical MVC+Routes layout.
// Routes are THIN — they only define the path and method.
// All actual logic lives in the controller.
//
// URL MAP:
//   POST /api/segment-car    →  Upload image, run AI, save claim (AUTH REQUIRED)
//   POST /api/explain        →  Ask Gemini to explain a claim
//   GET  /api/claims         →  Fetch all claims (optionally filtered by userId)
//   GET  /api/claims/:id     →  Fetch a single claim by ID
//
// AUTHENTICATION:
//   The segment-car route uses authMiddleware to identify who's submitting.
//   This adds req.user = { id: <userId> } from the decoded JWT.
//   The claim is then saved with that userId in the controller.
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const claimController = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

// ─── File Upload Config ───
// multer saves uploaded files temporarily to the 'uploads/' folder
// The controller reads the file, sends it to HF, then deletes it
const upload = multer({ dest: 'uploads/' });

// ─── Route Definitions ───

// POST /api/segment-car — Main AI analysis pipeline (AUTH REQUIRED)
// authMiddleware decodes JWT → req.user.id is set → controller saves userId on claim
// Accepts: multipart form with 'image' file + vehicleDetails + incidentDetails
router.post('/segment-car', protect, upload.single('image'), claimController.analyzeClaim);

// POST /api/explain — XAI Lab (Gemini explains the AI's reasoning)
// Accepts: JSON body with { claimId, message }
router.post('/explain', claimController.explainClaim);

// GET /api/claims — Fetch claims from database
// Optional query: ?userId=<id> to filter by user
router.get('/claims', claimController.getAllClaims);

// GET /api/claims/:id — Fetch a single claim by its MongoDB ObjectId
// Used by analytics page "View Report" feature
router.get('/claims/:id', claimController.getClaimById);

module.exports = router;
