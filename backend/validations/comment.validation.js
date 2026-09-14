// This file defines validation rules for comments
// Ensures comment text is within allowed length before saving

import Joi from 'joi';

/**
 * Validation schema for creating a new comment
 * Checks that comment text is not empty and not too long
 */
const createCommentSchema = Joi.object({
  text: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Comment cannot be empty',
      'string.max': 'Comment cannot exceed 1000 characters',
      'any.required': 'Comment text is required'
    })
});

export { createCommentSchema };