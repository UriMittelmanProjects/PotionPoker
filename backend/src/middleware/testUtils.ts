import { Request, Response, NextFunction } from 'express';

/**
 * Test utilities for bypassing middleware in test environment
 */

/**
 * Mock rate limiter that bypasses rate limiting in tests
 */
export const mockRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // Skip rate limiting in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  
  // In non-test environments, this would be the actual rate limiter
  // For now, we'll just pass through
  next();
};

/**
 * Test helper to clear database for clean test runs
 */
export const clearTestData = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('clearTestData can only be used in test environment');
  }
  
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    // Delete all users (this will cascade delete related data)
    await prisma.user.deleteMany({});
    console.log('Test data cleared successfully');
  } catch (error) {
    console.error('Failed to clear test data:', error);
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Generate test user data
 */
export const generateTestUser = (suffix: string = '') => ({
  email: `test${suffix}@example.com`,
  password: 'TestPassword123',
  username: `testuser${suffix}`,
  firstName: 'Test',
  lastName: `User${suffix}`
});