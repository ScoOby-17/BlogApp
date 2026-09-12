// This file defines validation rules for blog post creation and updates
// Ensures posts have valid titles, content, and categories before saving to database

import Joi from 'joi';

/**
 * Validation schema for creating a new blog post
 * All fields are required when creating a post
 */
const createPostSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  content: Joi.string()
    .min(20)
    .required()
    .messages({
      'string.min': 'Content must be at least 20 characters',
      'any.required': 'Content is required'
    }),
  category: Joi.string()
    .valid('tech', 'food', 'other', 'place')
    .required()
    .messages({
      'any.only': 'Category must be one of: tech, food, other, place',
      'any.required': 'Category is required'
    })
});

/**
 * Validation schema for updating an existing blog post
 * All fields are optional (user can update just title, or just content, etc.)
 * But at least one field must be provided
 */
const updatePostSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .messages({
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  content: Joi.string()
    .min(20)
    .messages({
      'string.min': 'Content must be at least 20 characters'
    }),
  category: Joi.string()
    .valid('tech', 'food', 'other', 'place')
    .messages({
      'any.only': 'Category must be one of: tech, food, other, place'
    })
}).min(1); // At least one field must be provided

export { createPostSchema, updatePostSchema };
