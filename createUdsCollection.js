const mongoose = require('mongoose');
const connectDB = require('./db'); 
const { Schema, model, connection } = mongoose; 

const udsSchema = new Schema({
  clubName: { type: String, required: true },
  event_date: { type: String, required: true },
  event_name: { type: String, required: true },
  requirement_name: { type: String, required: true },
  quantity: { type: String, required: true }
});


const UDS = model('uds', udsSchema);

const createCollection = async () => {
  try {
    console.log('✅ uds collection created in MongoDB');
  } catch (err) {
    console.error('❌ Error creating uds collection:', err.message);
  }
};
createCollection();
module.exports = UDS;
