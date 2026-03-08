import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000';

// The images the user just uploaded
const TEST_IMAGES = [
    {
        filepath: 'C:\\Users\\katta\\.gemini\\antigravity\\brain\\973c1630-39b2-4717-a248-a6286d72dd8a\\media__1772879685337.jpg',
        vehicleDetails: {
            brand: 'Hyundai',
            model: 'Sonata',
            tier: 'mid-range',
            segment: 'sedan',
            damageLocation: 'front'
        },
        incidentDetails: {
            date: '2023-10-12',
            description: 'Front-end collision at an intersection.'
        }
    },
    {
        filepath: 'C:\\Users\\katta\\.gemini\\antigravity\\brain\\973c1630-39b2-4717-a248-a6286d72dd8a\\media__1772879686616.jpg',
        vehicleDetails: {
            brand: 'Honda',
            model: 'Civic',
            tier: 'mid-range',
            segment: 'sedan',
            damageLocation: 'side'
        },
        incidentDetails: {
            date: '2023-11-05',
            description: 'T-boned by another vehicle running a red light.'
        }
    },
    {
        filepath: 'C:\\Users\\katta\\.gemini\\antigravity\\brain\\973c1630-39b2-4717-a248-a6286d72dd8a\\media__1772879687948.jpg',
        vehicleDetails: {
            brand: 'Toyota',
            model: 'Corolla',
            tier: 'economy',
            segment: 'sedan',
            damageLocation: 'front'
        },
        incidentDetails: {
            date: '2023-12-01',
            description: 'Sideswiped a barrier on the highway.'
        }
    }
];

const run = async () => {
    try {
        console.log('--- Submitting Test Claims ---');

        console.log('Logging in as manideep...');
        // Log in as the main user "manideep" to match the frontend demo
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'manideep@test.com',
            password: 'test123'
        });
        const token = loginRes.data.token;
        console.log('Login successful! Token acquired.');

        // 2. Submit claims
        for (let i = 0; i < TEST_IMAGES.length; i++) {
            const claim = TEST_IMAGES[i];

            console.log(`\nProcessing Claim ${i + 1}/${TEST_IMAGES.length}...`);
            console.log(`Submitting claim for ${claim.vehicleDetails.brand} ${claim.vehicleDetails.model}...`);

            const formData = new FormData();
            formData.append('vehicleDetails', JSON.stringify(claim.vehicleDetails));
            formData.append('incidentDetails', JSON.stringify(claim.incidentDetails));

            // Ensure file exists before appending
            if (!fs.existsSync(claim.filepath)) {
                console.error(`File not found: ${claim.filepath}`);
                continue;
            }
            formData.append('image', fs.createReadStream(claim.filepath));

            const submitRes = await axios.post(`${BASE_URL}/api/segment-car`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${token}`
                },
                timeout: 240000 // Give the HF API time to respond (up to 4 mins)
            });

            console.log('Claim submitted successfully! Response:');
            console.log(`  Estimate: ₹${submitRes.data.report.total_estimate}`);
            console.log(`  Detections: ${submitRes.data.report.detections.length}`);
        }

        console.log('\n--- All claims processed successfully! ---');

    } catch (error) {
        console.error('Error occurred:', error.response ? error.response.data : error.message);
    }
};

run();
