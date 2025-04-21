const mongoose = require('mongoose');
const connectDB = require('./db');
const { Schema, model } = mongoose; // Destructure Schema and model from mongoose
// Define schema to match Final_Events.db
const finalEventSchema = new mongoose.Schema({
  present_date: { type: String, required: true },
  event_name: { type: String, required: true },
  club_name: { type: String, required: true },
  date_allotted: { type: String, required: true },
  venue_allotted: { type: String, required: true },
  time_from: { type: String, required: true },
  time_to: { type: String, required: true },
  student_coord1: { type: String, required: true },
  phone1: { type: String, required: true },
  student_coord2: { type: String, required: true },
  phone2: { type: String, required: true },
  club_mail: { type: String, required: true },
  reg_fee: { type: Number, required: true },
  approved_by: { type: String, required: true },
  date_of_approval: { type: String, required: true },
  comments: { type: String }
});

// Create model
const FinalEvent = mongoose.model('final_events', finalEventSchema);

const createCollection = async () => {
  try {
    console.log('✅ final_events collection created successfully.');
  } catch (error) {
    console.error('❌ Error creating final_events collection:', error.message);
  }
};

createCollection();
module.exports = FinalEvent;
