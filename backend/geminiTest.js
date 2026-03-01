app.post('/api/segment-car', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image payload." });

        const imageBuffer = fs.readFileSync(req.file.path);
        const imageBlob = new Blob([imageBuffer], { type: req.file.mimetype });

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

            // --- NEW: GEMINI COST CALCULATION ---
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // Using the model we verified in your terminal
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const costPrompt = `
                You are an expert Insurance Adjuster in India.
                CAR: ${vehicleDetails.year} ${vehicleDetails.model} (Value: ₹${vehicleDetails.car_model_val})
                YOLO DETECTION: ${JSON.stringify(reportData.part_name)} damaged with ratio ${JSON.stringify(reportData.damage_ratio)}.
                
                Based on Indian market repair costs, estimate the total repair cost in INR.
                Return ONLY a JSON object: {"total_cost": number, "reasoning": "string"}
            `;

            const geminiResult = await model.generateContent(costPrompt);
            const costJson = JSON.parse(geminiResult.response.text().replace(/```json|```/g, ""));

            // Inject Gemini's math into the report
            reportData.total_cost = costJson.total_cost;
            reportData.gemini_reasoning = costJson.reasoning;

            // --- SAVE TO MONGODB ---
            const newClaim = new Claim({
                vehicleDetails,
                incidentDetails,
                aiReport: reportData,
                hfFileUrl: jsonUrl
            });

            const savedClaim = await newClaim.save();

            res.json({
                success: true,
                claimId: savedClaim._id,
                report: reportData 
            });
        }
    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: "Pipeline failed." });
    }
});