// src/utils/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We attempt to connect using the URI from our .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // If the DB connection fails, the app cannot run, so we exit the process
    process.exit(1);
  }
};

module.exports = connectDB;