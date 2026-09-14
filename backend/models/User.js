// This file defines the User model - represents users (and admins) in the database
// Handles password hashing automatically before saving to keep passwords secure

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // No two users can have the same email
    lowercase: true, // Store emails in lowercase
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6 // Will be hashed, so length will be much longer in DB
  },
  avatar: {
    type: String,
    default: null // Optional profile picture
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Only 'user' or 'admin' allowed
    default: 'user'
  },
  adminId: {
    type: String,
    unique: true,
    sparse: true // Only admins have this field (allows multiple null values)
  }
}, {
  timestamps: true
});

/**
 * Middleware that runs before saving a user
 * Hashes the password if it was modified (on signup or password change)
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it's new or has been changed
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt (random string) and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compares a plain text password with the hashed password in the database
 * @param {String} candidatePassword - The password to check
 * @returns {Boolean} True if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Removes the password field when converting user to JSON
 * This prevents accidentally sending passwords in API responses
 */
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password; // Remove password before sending to client
  return userObject;
};

export default mongoose.model('User', userSchema);