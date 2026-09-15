// =============================================================================
// post.controller.js — Handles creating, reading, updating, deleting, and liking posts
// =============================================================================
// This file contains all the business logic for blog posts. It handles:
// - Listing posts with pagination, category filtering, and search
// - Getting a single post with its author and comments
// - Creating a new post with a cover image
// - Updating an existing post (only by the author or admin)
// - Deleting a post and its associated comments/image
// - Toggling likes on a post
// =============================================================================

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { createPostSchema, updatePostSchema } from '../validations/post.validation.js';

// Set up __dirname for ES modules (needed to build file paths)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

// -----------------------------------------------------------------------------
// Get a paginated list of posts, with optional category filter and search
// -----------------------------------------------------------------------------
export const getPosts = async (req, res) => {
  try {
    // 1. Get pagination values from the query string (default: page 1, 9 posts per page)
    const requestedPage = parseInt(req.query.page, 10) || 1;
    const requestedLimit = parseInt(req.query.limit, 10) || 9;
    const page = Math.max(requestedPage, 1);
    const limit = Math.max(requestedLimit, 1);
    const skip = (page - 1) * limit;

    // 2. Build the filter object for the database query
    const filter = {};

    // 3. If a category was specified (and it's not "all"), filter by it
    const category = req.query.category;
    if (category && category !== 'all') {
      filter.category = category;
    }

    // 4. If a search term was provided, search post titles (case-insensitive)
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    console.log(`Fetching posts: page ${page}, limit ${limit}, category ${category || 'all'}, search: ${req.query.search || 'none'}`);

    // 5. Query the database for posts matching the filter
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })              // newest posts first
      .skip(skip)                            // skip posts from previous pages
      .limit(limit)                          // only return the requested number
      .populate('author', 'name email avatar') // include author's name, email, avatar
      .lean();                               // return plain JS objects (faster)

    // 6. Count total matching posts (for calculating total pages)
    const totalPosts = await Post.countDocuments(filter);

    // 7. Add likesCount and commentsCount to each post
    const postsWithCounts = posts.map((post) => {
      return {
        ...post,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount: post.comments ? post.comments.length : 0
      };
    });

    // 8. Send the posts back to the frontend
    return res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      data: {
        posts: postsWithCounts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// -----------------------------------------------------------------------------
// Get a single post by its ID, including author info and comments
// -----------------------------------------------------------------------------
export const getPostById = async (req, res) => {
  try {
    // 1. Get the post ID from the URL
    const postId = req.params.id;
    console.log(`Fetching post: ${postId}`);

    // 2. Find the post and include the author's info and all comments
    const post = await Post.findById(postId)
      .populate('author', 'name email avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name avatar'
        },
        options: { sort: { createdAt: -1 } }   // newest comments first
      });

    // 3. If no post was found, return a 404 error
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // 4. Convert the post to a plain object so we can add extra fields
    const postData = post.toObject();
    postData.likesCount = post.likes.length;
    postData.commentsCount = post.comments.length;

    // 5. If a user is logged in, check if they have liked this post
    //    (This route is public, so req.user might not exist)
    if (req.user) {
      const userId = req.user._id.toString();
      postData.isLikedByUser = post.likes.some((likeId) => {
        return likeId.toString() === userId;
      });
    }

    // 6. Send the post data back to the frontend
    return res.status(200).json({
      success: true,
      message: 'Post fetched successfully',
      data: { post: postData }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// -----------------------------------------------------------------------------
// Create a new blog post (requires login and a cover image upload)
// -----------------------------------------------------------------------------
export const createPost = async (req, res) => {
  try {
    // 1. Validate the incoming data using our Joi schema
    const { error } = createPostSchema.validate(req.body);

    // 2. If validation fails, stop here and send back the error message
    if (error) {
      // If a file was uploaded but validation failed, delete it so it doesn't pile up
      if (req.file) {
        try {
          await fs.unlink(path.join(uploadDir, req.file.filename));
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            console.error(`Unable to delete uploaded image ${req.file.filename}:`, unlinkError.message);
          }
        }
      }
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // 3. Get the post details sent by the frontend
    const { title, content, category } = req.body;

    // 4. Make sure a cover image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Cover image is required'
      });
    }

    // 5. Get the logged-in user's ID (set by the auth middleware)
    const userId = req.user._id;
    console.log(`Creating post for user: ${userId}`);

    // 6. Create the post in the database
    const post = await Post.create({
      title,
      content,
      category,
      coverImage: req.file.filename,  // the filename saved by multer
      author: userId
    });

    // 7. Fetch the post again with the author info populated
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar');

    // 8. Send the new post back to the frontend
    console.log(`Post created successfully: ${post._id}`);
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: populatedPost }
    });

  } catch (error) {
    // If the database operation failed, delete the uploaded image so it doesn't pile up
    if (req.file) {
      try {
        await fs.unlink(path.join(uploadDir, req.file.filename));
      } catch (unlinkError) {
        if (unlinkError.code !== 'ENOENT') {
          console.error(`Unable to delete uploaded image ${req.file.filename}:`, unlinkError.message);
        }
      }
    }

    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// -----------------------------------------------------------------------------
// Update an existing post (only the author or an admin can do this)
// -----------------------------------------------------------------------------
export const updatePost = async (req, res) => {
  try {
    // 1. Validate the incoming data using our Joi schema
    const { error } = updatePostSchema.validate(req.body);

    // 2. If validation fails, stop here and send back the error message
    if (error) {
      // If a file was uploaded but validation failed, delete it
      if (req.file) {
        try {
          await fs.unlink(path.join(uploadDir, req.file.filename));
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            console.error(`Unable to delete uploaded image ${req.file.filename}:`, unlinkError.message);
          }
        }
      }
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // 3. Find the post by its ID
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // 4. Check if the logged-in user is the author of this post or an admin
    const isPostAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isPostAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post'
      });
    }

    // 5. Update only the fields that were sent by the frontend
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

    // 6. If a new cover image was uploaded, delete the old one and save the new filename
    if (req.file) {
      // Delete the old cover image from the uploads folder
      if (post.coverImage) {
        try {
          await fs.unlink(path.join(uploadDir, post.coverImage));
          console.log(`Deleted old cover image: ${post.coverImage}`);
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            console.error(`Unable to delete old cover image ${post.coverImage}:`, unlinkError.message);
          }
        }
      }
      post.coverImage = req.file.filename;
    }

    // 7. Save the updated post to the database
    await post.save();

    // 8. Fetch the updated post with author info populated
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar');

    // 9. Send the updated post back to the frontend
    console.log(`Post updated successfully: ${post._id}`);
    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post: updatedPost }
    });

  } catch (error) {
    // If saving failed after uploading a new image, clean up that unused file
    if (req.file) {
      try {
        await fs.unlink(path.join(uploadDir, req.file.filename));
      } catch (unlinkError) {
        if (unlinkError.code !== 'ENOENT') {
          console.error(`Unable to delete uploaded image ${req.file.filename}:`, unlinkError.message);
        }
      }
    }

    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// -----------------------------------------------------------------------------
// Delete a post, its cover image, and all its comments
// -----------------------------------------------------------------------------
export const deletePost = async (req, res) => {
  try {
    // 1. Find the post by its ID
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // 2. Check if the logged-in user is the author or an admin
    const isPostAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isPostAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }

    // 3. Delete the cover image file from the uploads folder
    if (post.coverImage) {
      try {
        await fs.unlink(path.join(uploadDir, post.coverImage));
        console.log(`Deleted uploaded image: ${post.coverImage}`);
      } catch (unlinkError) {
        if (unlinkError.code !== 'ENOENT') {
          console.error(`Unable to delete uploaded image ${post.coverImage}:`, unlinkError.message);
        }
      }
    }

    // 4. Delete all comments that belong to this post
    await Comment.deleteMany({ post: post._id });

    // 5. Delete the post itself
    await Post.findByIdAndDelete(req.params.id);

    // 6. Send success response
    console.log(`Post deleted successfully: ${req.params.id}`);
    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: null
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// -----------------------------------------------------------------------------
// Toggle like on a post (like it if not liked, unlike it if already liked)
// -----------------------------------------------------------------------------
export const toggleLike = async (req, res) => {
  try {
    // 1. Find the post by its ID
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // 2. Get the logged-in user's ID as a string (for comparison)
    const userId = req.user._id.toString();

    // 3. Check if the user has already liked this post
    const likeIndex = post.likes.findIndex((likeId) => {
      return likeId.toString() === userId;
    });

    // 4. If already liked, remove the like (unlike)
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
      await post.save();
      console.log(`Post unliked: ${post._id} by user ${req.user._id}`);

      return res.status(200).json({
        success: true,
        message: 'Post unliked',
        data: {
          isLiked: false,
          likesCount: post.likes.length
        }
      });
    }

    // 5. If not liked yet, add the like
    post.likes.push(req.user._id);
    await post.save();
    console.log(`Post liked: ${post._id} by user ${req.user._id}`);

    return res.status(200).json({
      success: true,
      message: 'Post liked',
      data: {
        isLiked: true,
        likesCount: post.likes.length
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
