// This file defines protected routes for creating and deleting post comments.

import express from 'express';
import { createComment, deleteComment } from '../controllers/comment.controller.js';
import auth from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createCommentSchema } from '../validations/comment.validation.js';

const router = express.Router();

// Add a comment to the post identified by :id.
router.post('/posts/:id/comments', auth, validate(createCommentSchema), createComment);

// Delete the comment identified by :id when the requester owns it or is an admin.
router.delete('/comments/:id', auth, deleteComment);

export default router;
