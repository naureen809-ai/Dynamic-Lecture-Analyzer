const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is missing');
    }

    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.warn('Starting server without an active MongoDB connection. API requests that persist data may fail until the database is available.');
  }
};

module.exports = connectDB;
