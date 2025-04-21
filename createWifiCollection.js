const mongoose = require('mongoose');
const connectDB = require('./db');
const { Schema, model, connection } = mongoose;

const wifiSchema = new Schema({
  clubName: { type: String, required: true },
  event_date: { type: String, required: true },
  event_name: { type: String, required: true },
  requirement_name: { type: String, required: true },
  quantity: { type: String, required: true }
});


const Wifi = model('wifi', wifiSchema); 

const createCollection = async () => {
  try {
    console.log('✅ wifi collection created in MongoDB');
  } catch (err) {
    console.error('❌ Error creating wifi collection:', err.message);
  } 
};

createCollection();
module.exports = Wifi;
