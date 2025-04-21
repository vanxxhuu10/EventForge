const mongoose = require('mongoose');
const connectDB = require('./db'); 
const { Schema, model, connection } = mongoose; 


const sponsorSchema = new Schema({
  clubName: { type: String, required: true },
  event_date: { type: String },
  event_name: { type: String },
  sponsor_name: { type: String },
  amount: { type: Number },
  status: { type: String },
  upload_on: { type: String, default: () => new Date().toISOString() } 
});

// Create model
const Sponsor = model('sponsors', sponsorSchema);

// Create collection function
const createCollection = async () => {
  try {
    console.log('✅ sponsors collection created in MongoDB');
  } catch (err) {
    console.error('❌ Error creating sponsors collection:', err.message);
  } 
};

createCollection();

module.exports = Sponsor;
