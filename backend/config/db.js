// =============================================================================
// db.js — Connects to the MongoDB database
// =============================================================================
// This file exports a function that connects to MongoDB using the connection
// string from the .env file. It's called once when the server starts.
// =============================================================================

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from the .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log which database host we connected to
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and stop the application
    console.error(` MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
