// This middleware checks if the logged-in user is an admin
// Used to protect admin-only routes (like deleting users or managing all posts)

import { error } from '../utils/apiResponse.js';

/**
 * Middleware to verify the current user has admin role
 * Must be used AFTER the auth middleware (which sets req.user)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const admin = (req, res, next) => {
  // Check if user is logged in (auth middleware should have set req.user)
  if (!req.user) {
    return error(res, 'Authentication required', 401);
  }

  // Check if the user's role is 'admin'
  if (req.user.role !== 'admin') {
    return error(res, 'Access denied. Admin privileges required.', 403);
  }

  // User is admin, allow them to proceed
  next();
};

export default admin;
