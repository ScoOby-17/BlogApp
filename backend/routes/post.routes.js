// This file defines public and protected routes for working with blog posts.

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
import validate from '../middlewares/validate.middleware.js';
import { createPostSchema, updatePostSchema } from '../validations/post.validation.js';

const router = express.Router();

// Public routes: anyone can browse posts and open an individual post.
router.get('/', getPosts);
router.get('/:id', getPostById);

// Protected routes: only signed-in users can create, change, or like posts.
router.post(
  '/',
  auth,
  upload.single('coverImage'),
  handleMulterError,
  validate(createPostSchema),
  createPost
);

router.put(
  '/:id',
  auth,
  upload.single('coverImage'),
  handleMulterError,
  validate(updatePostSchema),
  updatePost
);

router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, toggleLike);

export default router;
