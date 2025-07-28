"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * Rate limiting for auth routes to prevent abuse
 * Disabled in test environment to allow comprehensive testing
 */
const authLimiter = (req, res, next) => {
    // Skip rate limiting in test environment or if test header is present
    if (process.env.NODE_ENV === 'test' || req.headers['x-test-mode'] === 'true') {
        return next();
    }
    // Apply normal rate limiting for non-test requests
    return (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per window
        message: {
            success: false,
            message: 'Too many authentication attempts, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
    })(req, res, next);
};
const forgotPasswordLimiter = (req, res, next) => {
    // Skip rate limiting in test environment or if test header is present
    if (process.env.NODE_ENV === 'test' || req.headers['x-test-mode'] === 'true') {
        return next();
    }
    // Apply normal rate limiting for non-test requests
    return (0, express_rate_limit_1.default)({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // 3 attempts per hour
        message: {
            success: false,
            message: 'Too many password reset requests, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
    })(req, res, next);
};
/**
 * Validation rules
 */
const registerValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];
/**
 * Auth routes
 */
// POST /api/auth/register - Register new user
router.post('/register', authLimiter, registerValidation, authController_1.register);
// POST /api/auth/login - Login user
router.post('/login', authLimiter, loginValidation, authController_1.login);
// POST /api/auth/logout - Logout user (optional, as JWT is stateless)
router.post('/logout', auth_1.authenticateToken, authController_1.logout);
// POST /api/auth/forgot-password - Send password reset email
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidation, authController_1.forgotPassword);
// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', authLimiter, resetPasswordValidation, authController_1.resetPassword);
// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', auth_1.authenticateToken, authController_1.getProfile);
exports.default = router;
