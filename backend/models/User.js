// =============================================================================
// User.js — Defines the shape of a User in the database
// =============================================================================
// This file only defines WHAT a user looks like (fields, types, defaults).
// It does NOT contain any logic (no password hashing, no methods).
// All logic (hashing, comparing passwords, etc.) is done in the controllers.
// =============================================================================

import mongoose from 'mongoose';

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
    unique: true,           // No two users can have the same email
    lowercase: true,        // Store emails in lowercase
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  avatar: {
    type: String,
    default: null            // Optional profile picture
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Only 'user' or 'admin' allowed
    default: 'user'
  },
  adminId: {
    type: String,
    unique: true,
    sparse: true             // Only admins have this field (allows multiple null values)
  }
}, {
  timestamps: true           // Automatically adds createdAt and updatedAt fields
});

export default mongoose.model('User', userSchema);
