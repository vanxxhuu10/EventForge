const mongoose = require('mongoose');
const { Schema, model } = mongoose; 
const connectDB = require('./db'); 


const purchaseListSchema = new Schema({
  clubName: { type: String, required: true },
  event_date: { type: String, required: true },
  event_name: { type: String, required: true },
  item_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  source: { type: String, required: true },
  amount: { type: Number, required: true },
  upload_time: { type: String, required: true }
});
const Purchase = model('purchaselist', purchaseListSchema);

const createCollection = async () => {
  try {
    console.log('✅ purchaselist collection created in MongoDB');
  } catch (err) {
    console.error('❌ Error creating purchaselist collection:', err.message);
  }
};

createCollection();

module.exports = Purchase;
