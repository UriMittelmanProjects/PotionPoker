import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../types/auth';

/**
 * JWT utility functions for token generation and verification
 */

/**
 * Generate access token
 */
export const generateAccessToken = (payload: { userId: string; email: string }): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  } as SignOptions);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: { userId: string; email: string }): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  } as SignOptions);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate password reset token
 */
export const generateResetToken = (payload: { userId: string; email: string }): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: '1h' // Reset tokens expire in 1 hour
  } as SignOptions);
};