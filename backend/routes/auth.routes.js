// =============================================================================
// auth.routes.js — Routes for user authentication
// =============================================================================
// This file connects URLs to the auth controller functions.
// POST /api/auth/register  — Create a new user account
// POST /api/auth/login     — Log in with email and password
// POST /api/auth/logout    — Log out (clear cookies)
// POST /api/auth/refresh   — Get a new access token using refresh token
// =============================================================================

import express from 'express';
import { login, logout, refresh, register } from '../controllers/auth.controller.js';

const router = express.Router();

// Create a new standard user account
router.post('/register', register);

// Log in with email and password
router.post('/login', login);

// Log out — removes authentication cookies
router.post('/logout', logout);

// Get a new access token using the refresh token cookie
router.post('/refresh', refresh);

export default router;
