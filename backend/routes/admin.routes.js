// =============================================================================
// admin.routes.js — Routes for admin dashboard actions
// =============================================================================
// This file connects URLs to the admin controller functions.
// POST   /api/admin/login      — Admin login with adminId and password
// GET    /api/admin/users      — List all regular users (admin only)
// DELETE /api/admin/users/:id  — Delete a user and their content (admin only)
// GET    /api/admin/posts      — List all posts for moderation (admin only)
// =============================================================================

import express from 'express';
import {
  adminLogin,
  deleteUser,
  getAllPosts,
  getAllUsers
} from '../controllers/admin.controller.js';
import admin from '../middlewares/admin.middleware.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin login (public — no auth needed, admins need to log in first!)
router.post('/login', adminLogin);

// --- Protected routes (require login + admin role) ---

// Get a list of all regular users
router.get('/users', auth, admin, getAllUsers);

// Delete a user and all their content
router.delete('/users/:id', auth, admin, deleteUser);

// Get all posts for moderation
router.get('/posts', auth, admin, getAllPosts);

export default router;
