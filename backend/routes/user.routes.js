// This file defines protected routes for viewing the current user's data.

import express from 'express';
import { getProfile, getUserPosts, updateProfile, deleteProfile } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.middleware.js';
import { handleMulterError, upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Return the profile of the signed-in user.
router.get('/me', auth, getProfile);

// Return all blog posts written by the signed-in user.
router.get('/me/posts', auth, getUserPosts);

// Update user profile (name and avatar)
router.put('/me', auth, upload.single('avatar'), handleMulterError, updateProfile);

// Delete user profile
router.delete('/me', auth, deleteProfile);

export default router;