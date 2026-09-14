// This file contains the business logic for creating and deleting comments on blog posts.

import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { error, success } from '../utils/apiResponse.js';

/**
 * Creates a comment for a post and stores its reference on that post.
 * @param {Object} req - Express request containing comment text, post ID, and authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the new comment or an error
 */
const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;

    console.log(`Creating a comment for post: ${postId}`);
    const post = await Post.findById(postId);

    if (!post) {
      return error(res, 'Post not found', 404);
    }

    const comment = await Comment.create({
      text,
      author: req.user._id,
      post: postId
    });

    // Store the comment ID on the post so its comments can be populated later.
    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name avatar');

    console.log(`Comment created successfully: ${comment._id}`);
    return success(res, { comment: populatedComment }, 'Comment created successfully', 201);
  } catch (err) {
    console.error('Creating comment failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Deletes a comment when the requester wrote it or has the admin role.
 * @param {Object} req - Express request containing comment ID and authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming deletion or describing an error
 */
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return error(res, 'Comment not found', 404);
    }

    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isAdmin) {
      return error(res, 'You are not authorized to delete this comment', 403);
    }

    // Remove the comment ID from its post before removing the comment document.
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }
    });

    await Comment.findByIdAndDelete(req.params.id);
    console.log(`Comment deleted successfully: ${req.params.id}`);

    return success(res, null, 'Comment deleted successfully');
  } catch (err) {
    console.error('Deleting comment failed:', err.message);
    return error(res, err.message, 500);
  }
};

export { createComment, deleteComment };