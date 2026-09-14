// This file contains endpoints for viewing the authenticated user's profile and posts.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import { error, success } from '../utils/apiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

const removeUploadedImage = async (filename) => {
  if (!filename) return;
  try {
    await fs.unlink(path.join(uploadDir, filename));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Unable to delete uploaded image ${filename}:`, err.message);
    }
  }
};

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

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return error(res, 'User not found', 404);

    if (req.body.name) {
      user.name = req.body.name;
    }

    if (req.file) {
      if (user.avatar) {
        await removeUploadedImage(user.avatar);
      }
      user.avatar = req.file.filename;
    }

    await user.save();
    return success(res, { user: user.toJSON() }, 'Profile updated successfully');
  } catch (err) {
    if (req.file) {
      await removeUploadedImage(req.file.filename);
    }
    console.error('Updating profile failed:', err.message);
    return error(res, err.message, 500);
  }
};

const deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return error(res, 'User not found', 404);

    const userPosts = await Post.find({ author: user._id });
    for (const post of userPosts) {
      await removeUploadedImage(post.coverImage);
    }

    await Comment.deleteMany({ author: user._id });
    await Post.deleteMany({ author: user._id });

    if (user.avatar) {
      await removeUploadedImage(user.avatar);
    }

    await User.findByIdAndDelete(req.user._id);

    // Clear auth cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return success(res, null, 'Profile and all associated content deleted successfully');
  } catch (err) {
    console.error('Deleting profile failed:', err.message);
    return error(res, err.message, 500);
  }
};

export { getProfile, getUserPosts, updateProfile, deleteProfile };