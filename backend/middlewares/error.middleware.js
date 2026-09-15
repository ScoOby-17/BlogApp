// =============================================================================
// error.middleware.js — Global error handler for the Express app
// =============================================================================
// This middleware catches any errors that happen during request processing.
// It handles common error types (validation, duplicate keys, JWT) and sends
// back a clear JSON error response to the frontend.
// Must be registered AFTER all routes in server.js.
// =============================================================================

const errorHandler = (err, req, res, next) => {
  // Log the error so we can debug it
  console.log('Error:', err);

  // 1. Handle Mongoose validation errors (e.g., missing required fields)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed'
    });
  }

  // 2. Handle duplicate key errors (e.g., email already exists in the database)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // 3. Handle invalid JWT token errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // 4. Handle expired JWT token errors
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // 5. For any other error, send a generic 500 response
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

export default errorHandler;
