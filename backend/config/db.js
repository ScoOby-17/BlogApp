// This file sets up and manages the connection to MongoDB database
// It connects to the database when the server starts up

import mongoose from 'mongoose';

/**
 * Connects to MongoDB database using the connection string from environment variables
 * Logs success message when connected, exits the app if connection fails
 */
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from .env file
    console.log("mongoDB URI" , process.env.MONGO_URI)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log success message showing which database host we connected to
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and stop the application
    console.error(` MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};
// connectDB()
export default connectDB;