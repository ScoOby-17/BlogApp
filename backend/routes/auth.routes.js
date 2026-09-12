// This file defines public routes for registering, logging in, logging out,
// and refreshing user authentication tokens.

import express from 'express';
import { login, logout, refresh, register } from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { loginSchema, registerSchema } from '../validations/auth.validation.js';

const router = express.Router();

// Create a new standard user account.
router.post('/register', validate(registerSchema), register);

// Authenticate a standard user using email and password.
router.post('/login', validate(loginSchema), login);

// Remove the current user's authentication cookies.
router.post('/logout', logout);

// Replace an expired access token using a valid refresh-token cookie.
router.post('/refresh', refresh);

export default router;
