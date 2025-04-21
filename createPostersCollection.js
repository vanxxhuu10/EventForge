const mongoose = require('mongoose');
const connectDB = require('./db');
const { Schema, model } = mongoose; 
const posterSchema = new Schema({
  clubName: { type: String, required: true },
  event_date: { type: String, default: null },
  event_name: { type: String, default: null },
  drive_link: { type: String, default: null },
  upload_on: { type: Date, default: Date.now }
});

const Poster = model('posters', posterSchema);

const createCollection = async () => {
  try {
    console.log('✅ posters collection created in MongoDB');
  } catch (err) {
    console.error('❌ Error creating posters collection:', err.message);
  } 
};

createCollection();
module.exports = Poster;
