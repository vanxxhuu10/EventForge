const mongoose = require('mongoose');

const uri = 'mongodb+srv://vanxxhuu10:VSYS$123@eventforge.fxmzrzj.mongodb.net/?retryWrites=true&w=majority&appName=EventForge';

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      
      serverSelectionTimeoutMS: 1000,
      socketTimeoutMS: 30000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1); // Optionally exit the app if DB connection fails
  }
};

module.exports = connectDB;
