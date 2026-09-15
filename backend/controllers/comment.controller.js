// =============================================================================
// comment.controller.js — Handles creating and deleting comments on blog posts
// =============================================================================
// This file contains the logic for adding comments to posts and removing them.
// Only the comment author or an admin can delete a comment.
// =============================================================================

import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { createCommentSchema } from '../validations/comment.validation.js';

// -----------------------------------------------------------------------------
// Create a new comment on a post
// -----------------------------------------------------------------------------
export const createComment = async (req, res) => {
  try {
    // 1. Validate the incoming data using our Joi schema
    const { error } = createCommentSchema.validate(req.body);

    // 2. If validation fails, stop here and send back the error message
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // 3. Get the comment text from the request body
    const { text } = req.body;

    // 4. Get the post ID from the URL
    const postId = req.params.id;
    console.log(`Creating a comment for post: ${postId}`);

    // 5. Find the post to make sure it exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // 6. Create the comment in the database
    const comment = await Comment.create({
      text,
      author: req.user._id,
      post: postId
    });

    // 7. Add the comment's ID to the post's comments array
    post.comments.push(comment._id);
    await post.save();

    // 8. Fetch the comment again with the author's name and avatar populated
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name avatar');

    // 9. Send the new comment back to the frontend
    console.log(`Comment created successfully: ${comment._id}`);
    return res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: { comment: populatedComment }
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
// Delete a comment (only the comment author or an admin can do this)
// -----------------------------------------------------------------------------
export const deleteComment = async (req, res) => {
  try {
    // 1. Find the comment by its ID
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // 2. Check if the logged-in user is the comment author or an admin
    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isCommentAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment'
      });
    }

    // 3. Remove the comment ID from the post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }
    });

    // 4. Delete the comment from the database
    await Comment.findByIdAndDelete(req.params.id);

    // 5. Send success response
    console.log(`Comment deleted successfully: ${req.params.id}`);
    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
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
