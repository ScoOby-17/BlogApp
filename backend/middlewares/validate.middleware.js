// This middleware validates request data using Joi schemas
// Checks if the data sent by the client matches the expected format

import { error } from '../utils/apiResponse.js';

/**
 * Creates a validation middleware for a given Joi schema
 * @param {Object} schema - Joi validation schema to use
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    // Validate the request body against the schema
    const { error: validationError } = schema.validate(req.body, {
      abortEarly: false, // Check all fields, don't stop at first error
      stripUnknown: true // Remove fields not in the schema
    });

    if (validationError) {
      // Extract error details from Joi's error object
      const errors = validationError.details.map(detail => ({
        field: detail.path.join('.'), // Which field has the error
        message: detail.message // What's wrong with it
      }));

      return error(res, 'Validation failed', 400, errors);
    }

    // Validation passed, continue to the route handler
    next();
  };
};

export default validate;
