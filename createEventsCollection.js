const mongoose = require('mongoose');
const connectDB = require('./db');
const { Schema, model } = mongoose; // Destructure Schema and model from mongoose
// Define schema
const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  clubName: { type: String, required: true },
  date1: { type: String, required: true },
  date2: { type: String, required: true },
  venue1: { type: String, required: true },
  venue2: { type: String, required: true },
  venue3: { type: String, required: true },
  timeFrom: { type: String, required: true },
  timeTo: { type: String, required: true },
  eventDescription: { type: String, required: true },
  studentCoord1: { type: String, required: true },
  phone1: { type: String, required: true },
  studentCoord2: { type: String },
  phone2: { type: String },
  facultyCoord: { type: String, required: true },
  clubEmail: { type: String, required: true },
  fee: { type: Number, required: true }
});

const Event = mongoose.model('events', eventSchema);

// Ensure collection is created
const createCollection = async () => {
  try {
    console.log('✅ events collection created successfully');
  } catch (error) {
    console.error('❌ Error creating events collection:', error.message);
  } 
};

createCollection();

module.exports = Event;
