// This file contains helper functions for sending consistent API responses
// Every API response uses these functions to keep the format standardized

/**
 * Sends a successful API response
 * @param {Object} res - Express response object
 * @param {Object} data - The data to send back to the client (can be null)
 * @param {String} message - Success message to display
 * @param {Number} statusCode - HTTP status code (default 200)
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends an error API response
 * @param {Object} res - Express response object
 * @param {String} message - Error message to display
 * @param {Number} statusCode - HTTP status code (default 500)
 * @param {Array} errors - Array of detailed error objects (optional)
 */
const error = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

export { success, error };