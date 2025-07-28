"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestUser = exports.clearTestData = exports.mockRateLimit = void 0;
/**
 * Test utilities for bypassing middleware in test environment
 */
/**
 * Mock rate limiter that bypasses rate limiting in tests
 */
const mockRateLimit = (req, res, next) => {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === 'test') {
        return next();
    }
    // In non-test environments, this would be the actual rate limiter
    // For now, we'll just pass through
    next();
};
exports.mockRateLimit = mockRateLimit;
/**
 * Test helper to clear database for clean test runs
 */
const clearTestData = async () => {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('clearTestData can only be used in test environment');
    }
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
        // Delete all users (this will cascade delete related data)
        await prisma.user.deleteMany({});
        console.log('Test data cleared successfully');
    }
    catch (error) {
        console.error('Failed to clear test data:', error);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.clearTestData = clearTestData;
/**
 * Generate test user data
 */
const generateTestUser = (suffix = '') => ({
    email: `test${suffix}@example.com`,
    password: 'TestPassword123',
    username: `testuser${suffix}`,
    firstName: 'Test',
    lastName: `User${suffix}`
});
exports.generateTestUser = generateTestUser;
