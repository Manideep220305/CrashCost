// ============================================================
// GEMINI CONFIG — Multi-Key Rotator for Google Gemini API
// ============================================================
// WHY: Google's free tier limits you to 1,500 requests/day per key.
// HOW: We load 3 keys and rotate through them round-robin style.
//      This gives us 4,500 requests/day for free.
// ============================================================

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Pull all available keys from your .env file
const ALL_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2
].filter(k => k); // Remove any undefined/empty keys

// FAIL FAST: If no keys found, crash immediately so you know it's broken
if (ALL_KEYS.length === 0) {
    console.error("❌ CRITICAL: No Gemini API keys found. Add them to your .env file.");
    process.exit(1);
}

console.log(`🔑 Gemini Rotator: ${ALL_KEYS.length} key(s) loaded`);

// Round-robin index
let keyIndex = 0;

/**
 * Returns the next Gemini model instance using round-robin key rotation.
 * Each call uses a different API key to spread the load.
 * 
 * @returns {GenerativeModel} A configured Gemini model instance
 */
const getNextGeminiModel = () => {
    const key = ALL_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % ALL_KEYS.length; // Cycle: 0 → 1 → 2 → 0 → ...

    const genAI = new GoogleGenerativeAI(key);
    return genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        safetySettings: [
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }
        ]
    });
};

module.exports = { getNextGeminiModel };
