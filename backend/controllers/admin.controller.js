// This file contains administrator-only account and content management logic.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { generateTokens } from '../utils/generateTokens.js';
import { error, success } from '../utils/apiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

/**
 * Stores login tokens in secure HTTP-only cookies for an administrator.
 * @param {Object} res - Express response object used to set cookies
 * @param {Object} tokens - Object containing accessToken and refreshToken
 */
const setAuthenticationCookies = (res, tokens) => {
  const useSecureCookies = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * Adds like and comment totals to plain post objects for the admin interface.
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
 * Removes an uploaded image without failing the user-deletion operation if it is missing.
 * @param {String} filename - The image filename to remove
 * @returns {Promise<void>} Resolves after cleanup has been attempted
 */
const removeUploadedImage = async (filename) => {
  if (!filename) {
    return;
  }

  try {
    await fs.unlink(path.join(uploadDir, filename));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Unable to delete uploaded image ${filename}:`, err.message);
    }
  }
};

/**
 * Authenticates an administrator using their admin ID and password.
 * @param {Object} req - Express request containing adminId and password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing safe admin details or an error
 */
const adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;
    console.log(`Admin login attempt received for ID: ${adminId}`);

    // Select password because it is hidden by default in the User schema.
    const admin = await User.findOne({ adminId, role: 'admin' }).select('+password');

    if (!admin) {
      console.warn(`Admin login failed: no administrator found for ID ${adminId}`);
      return error(res, 'Invalid admin credentials', 401);
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      console.warn(`Admin login failed: incorrect password for ID ${adminId}`);
      return error(res, 'Invalid admin credentials', 401);
    }

    const tokens = generateTokens(admin._id);
    setAuthenticationCookies(res, tokens);

    const adminResponse = admin.toJSON();
    console.log(`Administrator logged in successfully: ${admin._id}`);

    return success(res, { user: adminResponse }, 'Admin login successful');
  } catch (err) {
    console.error('Administrator login failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Returns every standard user account for the administrator dashboard.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing standard user accounts
 */
const getAllUsers = async (req, res) => {
  try {
    console.log('Administrator requested the user list');

    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    return success(res, { users }, 'Users fetched successfully');
  } catch (err) {
    console.error('Fetching users for administrator failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Deletes a standard user and the posts, comments, and images they created.
 * @param {Object} req - Express request containing the user ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming deletion or describing an error
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return error(res, 'User not found', 404);
    }

    if (user.role === 'admin') {
      return error(res, 'Cannot delete admin user', 403);
    }

    console.log(`Administrator is deleting user: ${user._id}`);
    const userPosts = await Post.find({ author: user._id });

    // Delete each post's image before its post document is deleted.
    for (const post of userPosts) {
      await removeUploadedImage(post.coverImage);
    }

    await Comment.deleteMany({ author: user._id });
    await Post.deleteMany({ author: user._id });
    await User.findByIdAndDelete(req.params.id);

    console.log(`User deleted successfully: ${req.params.id}`);
    return success(res, null, 'User deleted successfully');
  } catch (err) {
    console.error('Deleting user failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Returns all blog posts for the administrator dashboard.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing all posts and their counts
 */
const getAllPosts = async (req, res) => {
  try {
    console.log('Administrator requested the post list');

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name email avatar')
      .lean();

    const postsWithCounts = addPostCounts(posts);

    return success(res, { posts: postsWithCounts }, 'All posts fetched successfully');
  } catch (err) {
    console.error('Fetching posts for administrator failed:', err.message);
    return error(res, err.message, 500);
  }
};

export { adminLogin, getAllUsers, deleteUser, getAllPosts };