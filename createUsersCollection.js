const mongoose = require('mongoose');
const connectDB = require('./db'); 
const { Schema, model, models, connection } = mongoose;


const userSchema = new Schema({
  club_name: { type: String, unique: true, required: true },
  club_email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});


const User = models.User || model('User', userSchema);

const createCollection = async () => {
  try {
    console.log('✅ users collection created in MongoDB');
  } catch (err) {
    console.error('❌ Error creating users collection:', err.message);
  } 
};

createCollection();

module.exports = User;
