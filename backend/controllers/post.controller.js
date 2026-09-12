// This file contains the business logic for listing, reading, creating, updating,
// deleting, and liking blog posts.

import fs from 'fs/promises';
import path from 'path';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { error, success } from '../utils/apiResponse.js';

/**
 * Adds like and comment totals to plain post objects returned from MongoDB.
 * @param {Array<Object>} posts - Plain post objects returned by a lean query
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
 * Safely removes an uploaded image file when it exists.
 * @param {String} filename - The uploaded image filename to remove
 * @returns {Promise<void>} Resolves even when the file has already been removed
 */
const removeUploadedImage = async (filename) => {
  if (!filename) {
    return;
  }

  const imagePath = path.join('uploads', filename);

  try {
    await fs.unlink(imagePath);
    console.log(`Deleted uploaded image: ${filename}`);
  } catch (err) {
    // A missing image should not prevent its post operation from finishing.
    if (err.code !== 'ENOENT') {
      console.error(`Unable to delete uploaded image ${filename}:`, err.message);
    }
  }
};

/**
 * Checks whether a requester owns a post or is allowed to manage it as an admin.
 * @param {Object} post - Post document being changed
 * @param {Object} user - Authenticated user from the request
 * @returns {Boolean} True when the user can modify the post
 */
const canManagePost = (post, user) => {
  const isPostAuthor = post.author.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  return isPostAuthor || isAdmin;
};

/**
 * Gets a paginated list of posts, optionally filtered by category.
 * @param {Object} req - Express request containing page, limit, and category query values
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing page details and posts
 */
const getPosts = async (req, res) => {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10) || 1;
    const requestedLimit = Number.parseInt(req.query.limit, 10) || 9;
    const page = Math.max(requestedPage, 1);
    const limit = Math.max(requestedLimit, 1);
    const category = req.query.category;
    const skip = (page - 1) * limit;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    console.log(`Fetching posts: page ${page}, limit ${limit}, category ${category || 'all'}`);

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email avatar')
      .lean();

    const totalPosts = await Post.countDocuments(filter);
    const postsWithCounts = addPostCounts(posts);

    return success(res, {
      posts: postsWithCounts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts
    }, 'Posts fetched successfully');
  } catch (err) {
    console.error('Fetching posts failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Gets one post by its ID, including its author and comments.
 * @param {Object} req - Express request containing the post ID and optional req.user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the post or an error
 */
const getPostById = async (req, res) => {
  try {
    console.log(`Fetching post: ${req.params.id}`);

    const post = await Post.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name avatar'
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!post) {
      return error(res, 'Post not found', 404);
    }

    const postData = post.toObject();
    postData.likesCount = post.likes.length;
    postData.commentsCount = post.comments.length;

    // The route is public, so only calculate the current user's like status when present.
    if (req.user) {
      postData.isLikedByUser = post.likes.some((likeId) => {
        return likeId.toString() === req.user._id.toString();
      });
    }

    return success(res, { post: postData }, 'Post fetched successfully');
  } catch (err) {
    console.error('Fetching post failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Creates a post using the authenticated user as its author.
 * @param {Object} req - Express request containing post fields, cover image, and req.user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the new post or an error
 */
const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!req.file) {
      return error(res, 'Cover image is required', 400);
    }

    console.log(`Creating post for user: ${req.user._id}`);

    const post = await Post.create({
      title,
      content,
      category,
      coverImage: req.file.filename,
      author: req.user._id
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar');

    console.log(`Post created successfully: ${post._id}`);
    return success(res, { post: populatedPost }, 'Post created successfully', 201);
  } catch (err) {
    // Avoid leaving an unused upload behind when the database operation fails.
    if (req.file) {
      await removeUploadedImage(req.file.filename);
    }

    console.error('Creating post failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Updates a post when the requester is its author or an admin.
 * @param {Object} req - Express request containing post ID, editable fields, image, and req.user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the updated post or an error
 */
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return error(res, 'Post not found', 404);
    }

    if (!canManagePost(post, req.user)) {
      return error(res, 'You are not authorized to update this post', 403);
    }

    const { title, content, category } = req.body;

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    if (category) {
      post.category = category;
    }

    if (req.file) {
      // Delete the old image only after the new one has been accepted by Multer.
      await removeUploadedImage(post.coverImage);
      post.coverImage = req.file.filename;
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar');

    console.log(`Post updated successfully: ${post._id}`);
    return success(res, { post: updatedPost }, 'Post updated successfully');
  } catch (err) {
    // If saving failed after a replacement upload, delete that unused new file.
    if (req.file) {
      await removeUploadedImage(req.file.filename);
    }

    console.error('Updating post failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Deletes a post, its cover image, and all comments associated with it.
 * @param {Object} req - Express request containing post ID and req.user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming deletion or describing an error
 */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return error(res, 'Post not found', 404);
    }

    if (!canManagePost(post, req.user)) {
      return error(res, 'You are not authorized to delete this post', 403);
    }

    await removeUploadedImage(post.coverImage);
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(req.params.id);

    console.log(`Post deleted successfully: ${req.params.id}`);
    return success(res, null, 'Post deleted successfully');
  } catch (err) {
    console.error('Deleting post failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Adds or removes the authenticated user's like on a post.
 * @param {Object} req - Express request containing post ID and req.user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with the new like state and total
 */
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return error(res, 'Post not found', 404);
    }

    const userId = req.user._id.toString();
    const likeIndex = post.likes.findIndex((likeId) => {
      return likeId.toString() === userId;
    });

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
      await post.save();
      console.log(`Post unliked: ${post._id} by user ${req.user._id}`);

      return success(res, {
        isLiked: false,
        likesCount: post.likes.length
      }, 'Post unliked');
    }

    post.likes.push(req.user._id);
    await post.save();
    console.log(`Post liked: ${post._id} by user ${req.user._id}`);

    return success(res, {
      isLiked: true,
      likesCount: post.likes.length
    }, 'Post liked');
  } catch (err) {
    console.error('Toggling like failed:', err.message);
    return error(res, err.message, 500);
  }
};

export {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike
};
