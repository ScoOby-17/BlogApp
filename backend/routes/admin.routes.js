// This file defines public admin login and protected administrator management routes.

import express from 'express';
import {
  adminLogin,
  deleteUser,
  getAllPosts,
  getAllUsers
} from '../controllers/admin.controller.js';
import admin from '../middlewares/admin.middleware.js';
import auth from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { adminLoginSchema } from '../validations/auth.validation.js';

const router = express.Router();

// Public route: administrators sign in with an admin ID and password.
router.post('/login', validate(adminLoginSchema), adminLogin);

// Protected routes: require a valid login and the administrator role.
router.get('/users', auth, admin, getAllUsers);
router.delete('/users/:id', auth, admin, deleteUser);
router.get('/posts', auth, admin, getAllPosts);

export default router;
