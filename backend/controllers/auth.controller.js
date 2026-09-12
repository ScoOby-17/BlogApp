// This file contains the authentication logic for registering, logging in, logging out,
// and refreshing a user's access token.

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateAccessToken, generateTokens } from '../utils/generateTokens.js';
import { error, success } from '../utils/apiResponse.js';

/**
 * Stores the access and refresh tokens in secure HTTP-only cookies.
 * @param {Object} res - Express response object used to set cookies
 * @param {Object} tokens - Object containing accessToken and refreshToken
 */
const setAuthenticationCookies = (res, tokens) => {
  const useSecureCookies = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * Removes both authentication cookies from the browser.
 * @param {Object} res - Express response object used to clear cookies
 */
const clearAuthenticationCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

/**
 * Registers a new standard user, creates authentication tokens, and starts a session.
 * @param {Object} req - Express request containing name, email, and password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming registration or describing an error
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(`Registering a new user account for ${email}`);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return error(res, 'Email already registered', 400);
    }

    const user = await User.create({ name, email, password });
    const tokens = generateTokens(user._id);

    setAuthenticationCookies(res, tokens);
    console.log(`User account created successfully: ${user._id}`);

    return success(res, { user }, 'Registration successful', 201);
  } catch (err) {
    console.error('User registration failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Logs a standard user in after verifying their email and password.
 * @param {Object} req - Express request containing email and password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with the safe user details or an error
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt received for ${email}`);

    // Select password because it is hidden by default in the User schema.
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.warn(`Login failed: no user found for ${email}`);
      return error(res, 'Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.warn(`Login failed: incorrect password for ${email}`);
      return error(res, 'Invalid email or password', 401);
    }

    const tokens = generateTokens(user._id);
    setAuthenticationCookies(res, tokens);

    // toJSON removes the hashed password before sending the user to the client.
    const userResponse = user.toJSON();
    console.log(`User logged in successfully: ${user._id}`);

    return success(res, { user: userResponse }, 'Login successful');
  } catch (err) {
    console.error('User login failed:', err.message);
    return error(res, err.message, 500);
  }
};

/**
 * Logs the current user out by removing their authentication cookies.
 * @param {Object} req - Express request object (not needed for this action)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming logout
 */
const logout = (req, res) => {
  clearAuthenticationCookies(res);
  console.log('User logged out and authentication cookies were cleared');

  return success(res, null, 'Logout successful');
};

/**
 * Verifies a refresh token and issues a new short-lived access token.
 * @param {Object} req - Express request containing the refresh-token cookie
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming refresh or describing an error
 */
const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return error(res, 'Refresh token not found', 401);
    }

    const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return error(res, 'User not found', 404);
    }

    const newAccessToken = generateAccessToken(user._id);

    // Keep the original refresh token and replace only the expired access token.
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    console.log(`Access token refreshed for user: ${user._id}`);
    return success(res, null, 'Token refreshed successfully');
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      clearAuthenticationCookies(res);
      console.warn('Refresh token expired; authentication cookies were cleared');
      return error(res, 'Refresh token expired. Please login again.', 401);
    }

    console.warn('Invalid refresh-token attempt');
    return error(res, 'Invalid refresh token', 401);
  }
};

export { register, login, logout, refresh };
