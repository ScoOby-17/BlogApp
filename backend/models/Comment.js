// This file defines the Comment model - represents user comments on blog posts
// Each comment has text, an author (user who wrote it), and the post it belongs to

import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true, // Remove extra whitespace
    minlength: 1,
    maxlength: 1000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User who wrote this comment
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', // References the Post this comment belongs to
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create an index to quickly find comments by post and sort by date
commentSchema.index({ post: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);
