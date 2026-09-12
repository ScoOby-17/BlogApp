// This file defines the Post model - represents blog posts in the database
// Each post has title, content, cover image, category, author, likes, and comments

import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  coverImage: {
    type: String, // Stores the filename of the uploaded image
    required: [true, 'Cover image is required']
  },
  content: {
    type: String, // Rich HTML content from the editor
    required: [true, 'Content is required'],
    minlength: 20
  },
  category: {
    type: String,
    enum: ['tech', 'food', 'other', 'place'], // Only these 4 categories allowed
    required: [true, 'Category is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User who created this post
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Array of user IDs who liked this post
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment' // Array of comment IDs on this post
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create indexes for faster queries
postSchema.index({ category: 1, createdAt: -1 }); // For filtering by category
postSchema.index({ author: 1, createdAt: -1 }); // For finding posts by author

export default mongoose.model('Post', postSchema);
