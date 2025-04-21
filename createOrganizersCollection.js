const mongoose = require('mongoose');
const connectDB = require('./db');
const { Schema, model } = mongoose;

const organizerSchema = new Schema({
  identity: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Organizer = model('organizers', organizerSchema);

const createCollection = async () => {
  try {
    console.log('✅ organizers collection created in MongoDB');
  } catch (error) {
    console.error('❌ Error creating collection:', error.message);
  } 
};

createCollection();

module.exports = Organizer;
