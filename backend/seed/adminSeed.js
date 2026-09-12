// This script creates or updates the default administrator account.
// Run it with: npm run seed:admin

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const DEFAULT_ADMIN = {
  name: 'Admin',
  email: 'admin@blog.com',
  password: 'Admin@123',
  role: 'admin',
  adminId: 'admin001'
};

/**
 * Creates the default administrator when it does not exist.
 * If it already exists, this function restores the documented default details.
 * @returns {Promise<void>} Resolves after the administrator has been saved
 */
const seedDefaultAdmin = async () => {
  const existingAdmin = await User.findOne({ adminId: DEFAULT_ADMIN.adminId }).select('+password');

  if (existingAdmin) {
    existingAdmin.name = DEFAULT_ADMIN.name;
    existingAdmin.email = DEFAULT_ADMIN.email;
    existingAdmin.password = DEFAULT_ADMIN.password;
    existingAdmin.role = DEFAULT_ADMIN.role;
    await existingAdmin.save();

    console.log('✅ Default administrator already existed and was updated.');
    return;
  }

  await User.create(DEFAULT_ADMIN);
  console.log('✅ Default administrator created successfully.');
};

/**
 * Connects to the database, seeds the administrator, and closes the connection.
 * @returns {Promise<void>} Resolves when the script has finished cleanly
 */
const runSeed = async () => {
  try {
    console.log('Connecting to MongoDB to seed the default administrator...');
    await connectDB();

    await seedDefaultAdmin();
    console.log(`Admin ID: ${DEFAULT_ADMIN.adminId}`);
    console.log(`Password: ${DEFAULT_ADMIN.password}`);
  } catch (err) {
    console.error('❌ Default administrator seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

runSeed();
