// =============================================================================
// auth.middleware.js — Checks if the user is logged in
// =============================================================================
// This middleware reads the JWT access token from cookies, verifies it,
// finds the user in the database, and attaches the user to req.user.
// If the token is missing, expired, or invalid, it sends back a 401 error.
// =============================================================================

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    // 1. Get the access token from the cookies (it was set during login)
    const token = req.cookies.accessToken;

    // 2. If there's no token, the user is not logged in
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token not found. Please login.'
      });
    }

    // 3. Verify the token is valid and has not expired
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 4. Find the user in the database using the ID from the token
    // (exclude the password field for security)
    const user = await User.findById(decoded.userId).select('-password');

    // 5. If the user was deleted but their token is still valid, reject the request
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 6. Attach the user to the request so controllers can use it
    req.user = user;

    // 7. User is authenticated — continue to the next middleware or controller
    next();

  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired. Please refresh.'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export default auth;
