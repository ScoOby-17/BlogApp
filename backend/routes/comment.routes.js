// =============================================================================
// comment.routes.js — Routes for post comments
// =============================================================================
// This file connects URLs to the comment controller functions.
// POST   /api/posts/:id/comments — Add a comment to a post (requires login)
// DELETE /api/comments/:id       — Delete a comment (requires login, author or admin)
// =============================================================================

import express from 'express';
import { createComment, deleteComment } from '../controllers/comment.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

// Add a comment to the post with the given ID
router.post('/posts/:id/comments', auth, createComment);

// Delete a comment (only the comment author or an admin can do this)
router.delete('/comments/:id', auth, deleteComment);

export default router;
