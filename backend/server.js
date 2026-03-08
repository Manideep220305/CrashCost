// ============================================================
// SERVER.JS — Application Entry Point (Clean Bootstrap)
// ============================================================
// This file ONLY handles:
//   1. Loading environment variables
//   2. Setting up Express middleware
//   3. Connecting to MongoDB
//   4. Mounting routes
//   5. Starting the server
//
// All business logic lives in /controllers
// All route definitions live in /routes
// All config (Gemini keys etc.) lives in /config
// All data models live in /models
//
// MVC ARCHITECTURE:
//   Model      →  /models/Claim.js
//   View       →  React frontend (separate folder)
//   Controller →  /controllers/claimController.js
//   Routes     →  /routes/claimRoutes.js
//   Config     →  /config/gemini.js
// ============================================================

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const claimRoutes = require('./routes/claimRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;


// ─── 1. TRUST PROXY (Required for Render deployment) ───
// Without this, Render's load balancer is seen as the only IP,
// and rate limiting would block ALL users after 15 requests.
app.set('trust proxy', 1);


// ─── 2. MIDDLEWARE ───
// In production, FRONTEND_URL will be your Vercel domain. In dev, it falls back to localhost.
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());                            // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));     // Parse form data


// ─── 3. RATE LIMITING ───
// Prevents API spam. Limits each IP to 15 requests per minute.
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,   // 1 minute window
    max: 15,                    // 15 requests per window per IP
    message: { error: "System cooling down. Please wait 60 seconds before trying again." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to AI-heavy routes only
app.use('/api/segment-car', aiLimiter);
app.use('/api/explain', aiLimiter);


// ─── 4. ENSURE UPLOADS FOLDER EXISTS ───
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}


// ─── 5. DATABASE CONNECTION ───
// STUDENT PROJECT MODE: Continue even if MongoDB fails
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/insurevision')
    .then(() => console.log('🔥 MongoDB Atlas Connected Successfully'))
    .catch((err) => {
        console.warn('⚠️ MongoDB Connection Failed (continuing in test mode):', err.message);
        console.log('📝 Using test credentials: test@test.com / password');
    });


// ─── 6. MOUNT ROUTES ───
// All /api/* routes are handled by claimRoutes
app.use('/api', claimRoutes);
// Authentication routes
app.use('/api/auth', authRoutes);

// Health check for Render (keeps the server alive)
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});


// ─── 7. START SERVER ───
app.listen(PORT, () => {
    console.log(`🚀 InsureVision Live: http://localhost:${PORT}`);
    console.log(`📁 Architecture: MVC (Model-View-Controller)`);
    console.log(`🤖 AI Engine: HuggingFace FastAPI`);
    console.log(`🔑 Gemini: Multi-Key Rotator Active`);
    console.log('\n📋 STUDENT PROJECT MODE - Quick Login:');
    console.log('   Email: test@test.com');
    console.log('   Password: password');
    console.log('\n✅ Backend ready for frontend connections on port', PORT);
});