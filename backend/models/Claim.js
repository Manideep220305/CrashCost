const mongoose = require('mongoose');

// ============================================================
// CLAIM SCHEMA — Stores everything about a single damage claim
// ============================================================
// This schema matches the EXACT structure returned by our 
// CrashCost AI Engine (FastAPI on Hugging Face).
//
// Flow: User uploads image → Express sends to HF → HF returns
// detections array → We store it here in MongoDB.
// ============================================================

const claimSchema = new mongoose.Schema({

  // ─── Owner: Which user submitted this claim ───
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',        // References the User model
    required: false      // false so old claims without userId still work
  },

  // ─── STEP 1: Vehicle Details (from frontend form) ───
  vehicleDetails: {
    vin: { type: String },                // 17-digit Vehicle ID
    model: { type: String },                // e.g. "Swift", "i20"
    year: { type: String },                // e.g. "2020"
    make: { type: String },                // e.g. "Maruti", "Hyundai"
    brand: { type: String },                // Same as make (used by HF API)
    tier: { type: String },                // "budget", "mid", "premium", "luxury"
    segment: { type: String },                // "hatchback", "sedan", "suv"
    damageLocation: { type: String },                // "front", "side", "rear"
    car_model_val: { type: Number },                // Market value in ₹
    car_age: { type: Number },                // Age in years
  },

  // ─── STEP 2: Incident Details (from frontend form) ───
  incidentDetails: {
    date: { type: Date },
    description: { type: String }
  },

  // ─── STEP 3: AI Report (from HF CrashCost Engine) ───
  // This is the FULL response from our FastAPI endpoint.
  aiReport: {
    total_estimate: { type: Number },               // Sum of all detection prices
    estimate_range: [Number],                       // [min, max] confidence range
    context: {                                      // Echo of what we sent
      brand: String,
      tier: String,
      segment: String,
      location: String
    },
    detections: [{                                  // Array of detected damages
      id: { type: Number },           // 1, 2, 3...
      label: { type: String },           // "DENT", "GLASS_DAMAGE", etc.
      confidence: { type: Number },           // 0.0 to 1.0
      surface_detected: { type: String },           // "metal", "glass", "plastic"
      severity: { type: String },           // "MINOR", "MODERATE", "SEVERE"
      ratio: { type: Number },           // Damage area percentage (0.0 to 0.4)
      bbox: { type: mongoose.Schema.Types.Mixed }, // {x1, y1, x2, y2}
      price: { type: Number },           // Estimated repair cost in ₹
      drivers: [String],                   // Top 2 SHAP cost drivers
      summary: { type: String },           // 1-2 sentence summary
      narrative: { type: String },           // Full actuarial report
    }]
  },

  // ─── META ───
  status: { type: String, default: 'Auto-Assessed' },

}, { timestamps: true });
// timestamps: true → automatically adds createdAt and updatedAt

module.exports = mongoose.model('Claim', claimSchema);