const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// These names match your .env screenshot exactly
const keysToTest = [
    { name: "Original Key", val: process.env.GEMINI_API_KEY },
    { name: "Key 1", val: process.env.GEMINI_API_KEY_1 },
    { name: "Key 2", val: process.env.GEMINI_API_KEY_2 }
];

async function verify() {
    console.log("--- Starting Triple-Key Handshake ---");
    for (const key of keysToTest) {
        if (!key.val) {
            console.log(`❌ ${key.name}: Missing in .env`);
            continue;
        }
        try {
            const genAI = new GoogleGenerativeAI(key.val);
            // Testing with gemini-2.5-flash since we know it works for you
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent("test");
            console.log(`✅ ${key.name}: VALID and Online`);
        } catch (err) {
            console.log(`❌ ${key.name}: FAILED - ${err.message.substring(0, 50)}`);
        }
    }
}
verify();