// =============================================================================
// post.routes.js — Routes for blog posts
// =============================================================================
// This file connects URLs to the post controller functions.
// GET    /api/posts         — List posts (with pagination, filters, search)
// GET    /api/posts/:id     — Get a single post by ID
// POST   /api/posts         — Create a new post (requires login + image upload)
// PUT    /api/posts/:id     — Update a post (requires login, author or admin only)
// DELETE /api/posts/:id     — Delete a post (requires login, author or admin only)
// POST   /api/posts/:id/like — Toggle like on a post (requires login)
// =============================================================================

import express from 'express';
import {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  toggleLike,
  updatePost
} from '../controllers/post.controller.js';
import auth from '../middlewares/auth.middleware.js';
import { handleMulterError, upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// --- Public routes (no login required) ---

// List all posts with optional filtering and search
router.get('/', getPosts);

// Get a single post with its author and comments
router.get('/:id', getPostById);

// --- Protected routes (login required) ---

// Create a new post — first check auth, then handle file upload, then create
router.post(
  '/',
  auth,
  upload.single('coverImage'),
  handleMulterError,
  createPost
);

// Update a post — same middleware chain as create
router.put(
  '/:id',
  auth,
  upload.single('coverImage'),
  handleMulterError,
  updatePost
);

// Delete a post
router.delete('/:id', auth, deletePost);

// Like or unlike a post
router.post('/:id/like', auth, toggleLike);

export default router;
