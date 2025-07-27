const jwt = require('jsonwebtoken');

/**
 * JWT utility functions for token generation and verification
 * JavaScript version for test compatibility
 */

/**
 * Generate access token
 */
const generateAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate password reset token
 */
const generateResetToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: '1h' // Reset tokens expire in 1 hour
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateResetToken
};