// This file generates JWT (JSON Web Tokens) for user authentication
// Access tokens expire quickly (15 min), refresh tokens last longer (7 days)

import jwt from 'jsonwebtoken';

/**
 * Generates a short-lived access token for authenticating API requests
 * @param {String} userId - The user's MongoDB _id
 * @returns {String} JWT access token (expires in 15 minutes)
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId }, // Payload - data stored in the token
    process.env.JWT_ACCESS_SECRET, // Secret key to sign the token
    { expiresIn: '15m' } // Token expires in 15 minutes
  );
};

/**
 * Generates a long-lived refresh token for getting new access tokens
 * @param {String} userId - The user's MongoDB _id
 * @returns {String} JWT refresh token (expires in 7 days)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

/**
 * Generates both access and refresh tokens at once
 * @param {String} userId - The user's MongoDB _id
 * @returns {Object} Object with accessToken and refreshToken properties
 */
const generateTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

export { generateAccessToken, generateRefreshToken, generateTokens };