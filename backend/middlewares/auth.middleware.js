// This middleware verifies JWT access tokens from cookies
// It checks if the user is logged in and adds user info to the request

import jwt from 'jsonwebtoken';
import { error } from '../utils/apiResponse.js';
import User from '../models/User.js';

/**
 * Middleware to authenticate users using JWT access token from cookies
 * If valid, adds the user object to req.user for use in route handlers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const auth = async (req, res, next) => {
  try {
    // Get the access token from cookies (set during login)
    const token = req.cookies.accessToken;

    if (!token) {
      return error(res, 'Access token not found. Please login.', 401);
    }

    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Find the user in the database (exclude password field)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return error(res, 'User not found', 404);
    }

    // Attach user to the request so route handlers can access it
    req.user = user;
    next(); // User is authenticated, continue to the route handler
  } catch (err) {
    // Handle different types of JWT errors
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Access token expired. Please refresh.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid access token', 401);
    }
    return error(res, 'Authentication failed', 401);
  }
};

export default auth;