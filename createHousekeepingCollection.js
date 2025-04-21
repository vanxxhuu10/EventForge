const mongoose = require('mongoose');
const connectDB = require('./db');
const { Schema, model } = mongoose; // Destructure Schema and model from mongoose
// Define schema
const housekeepingSchema = new mongoose.Schema({
  clubName: { type: String, required: true },
  event_date: { type: String, required: true },
  event_name: { type: String, required: true },
  requirement_name: { type: String, required: true },
  quantity: { type: String, required: true }
});

// Create model
const Housekeeping = mongoose.model('housekeeping', housekeepingSchema);

const createCollection = async () => {
  try { 
    console.log('✅ housekeeping collection created in MongoDB');
  } catch (err) {
    console.error('❌ Error creating housekeeping collection:', err.message);
  } 
};

createCollection();
module.exports = Housekeeping;
