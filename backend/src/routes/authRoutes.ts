import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  getProfile 
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * Rate limiting for auth routes to prevent abuse
 * Disabled in test environment to allow comprehensive testing
 */
const authLimiter = process.env.NODE_ENV === 'test' ? 
  (req: any, res: any, next: any) => next() : // Skip in test
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

const forgotPasswordLimiter = process.env.NODE_ENV === 'test' ?
  (req: any, res: any, next: any) => next() : // Skip in test
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
      success: false,
      message: 'Too many password reset requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

/**
 * Validation rules
 */
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

/**
 * Auth routes
 */

// POST /api/auth/register - Register new user
router.post('/register', authLimiter, registerValidation, register);

// POST /api/auth/login - Login user
router.post('/login', authLimiter, loginValidation, login);

// POST /api/auth/forgot-password - Send password reset email
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidation, forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', authLimiter, resetPasswordValidation, resetPassword);

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', authenticateToken, getProfile);

export default router;