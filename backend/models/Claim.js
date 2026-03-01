const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  // Data from your Frontend Step 1
  vehicleDetails: {
    vin: { type: String },
    model: { type: String },
    // ADDED: These match the exact 'name' attributes in your React form
    year: { type: String },          
    make: { type: String },          
    car_model_val: { type: Number }, 
    car_age: { type: Number },       
    // Kept your originals just in case
    marketValue: { type: Number },
    age: { type: Number }
  },
  
  // Data from your Frontend Step 2
  incidentDetails: {
    date: { type: Date },
    description: { type: String }
  },
  
  // Data from Hugging Face / XGBoost
  aiReport: {
    total_cost: { type: Number },
    confidence: { type: mongoose.Schema.Types.Mixed }, 
    damaged_parts: { type: Array }, 
    // ADDED: These are the actual keys Hugging Face sends back in the JSON
    part_name: { type: Array },      
    damage_type: { type: Array },    
    damage_ratio: { type: Array }    
  },
  
  // Meta data
  status: { type: String, default: 'Auto-Assessed' },
  hfFileUrl: { type: String } // Storing the raw JSON link just in case
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates

module.exports = mongoose.model('Claim', claimSchema);