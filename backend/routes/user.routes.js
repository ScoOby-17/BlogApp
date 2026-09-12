// This file defines protected routes for viewing the current user's data.

import express from 'express';
import { getProfile, getUserPosts } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

// Return the profile of the signed-in user.
router.get('/me', auth, getProfile);

// Return all blog posts written by the signed-in user.
router.get('/me/posts', auth, getUserPosts);

export default router;
