// =============================================================================
// user.routes.js — Routes for the logged-in user's profile and posts
// =============================================================================
// This file connects URLs to the user controller functions.
// GET    /api/users/me        — Get the logged-in user's profile
// GET    /api/users/me/posts  — Get the logged-in user's posts
// PUT    /api/users/me        — Update profile (name and/or avatar)
// DELETE /api/users/me        — Delete account and all associated content
// =============================================================================

import express from 'express';
import { getProfile, getUserPosts, updateProfile, deleteProfile } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.middleware.js';
import { handleMulterError, upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Get the logged-in user's profile
router.get('/me', auth, getProfile);

// Get all posts written by the logged-in user
router.get('/me/posts', auth, getUserPosts);

// Update the user's name and/or avatar (avatar upload handled by multer)
router.put('/me', auth, upload.single('avatar'), handleMulterError, updateProfile);

// Delete the user's account and all their content
router.delete('/me', auth, deleteProfile);

export default router;
