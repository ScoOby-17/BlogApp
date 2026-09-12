// This file contains endpoints for viewing the authenticated user's profile and posts.

import Post from '../models/Post.js';
import { error, success } from '../utils/apiResponse.js';

/**
 * Adds like and comment totals to plain post objects for client-side display.
 * @param {Array<Object>} posts - Plain post objects returned from Mongoose
 * @returns {Array<Object>} Posts with likesCount and commentsCount properties
 */
const addPostCounts = (posts) => {
  return posts.map((post) => ({
    ...post,
    likesCount: post.likes ? post.likes.length : 0,
    commentsCount: post.comments ? post.comments.length : 0
  }));
};

/**
 * Returns the authenticated user's profile saved by the auth middleware.
 * @param {Object} req - Express request containing req.user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the current user's safe profile
 */
const getProfile = async (req, res) => {
  try {
    console.log(`Fetching profile for user: ${req.user._id}`);
    return success(res, { user: req.user }, 'Profile fetched successfully');
  } catch (err) {
    console.error('Fetching profile failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Returns all posts authored by the currently authenticated user.
 * @param {Object} req - Express request containing req.user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the user's posts and their counts
 */
const getUserPosts = async (req, res) => {
  try {
    console.log(`Fetching posts for user: ${req.user._id}`);

    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'name email avatar')
      .lean();

    const postsWithCounts = addPostCounts(posts);

    return success(res, { posts: postsWithCounts }, 'User posts fetched successfully');
  } catch (err) {
    console.error('Fetching user posts failed:', err.message);
    return error(res, err.message, 500);
  }
};

export { getProfile, getUserPosts };
