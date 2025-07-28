import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/auth';
import { authenticateToken } from '../middleware/auth';
import {
  createSession,
  getUserSessions,
  getSession,
  updateSession,
  addBuyIn,
  endSession,
  deleteSession,
  getLocationSuggestions,
  getSessionStats
} from '../controllers/sessionController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create new session
router.post('/',
  [
    body('sessionType')
      .isIn(['live_casino', 'home_game', 'online', 'other'])
      .withMessage('Invalid session type'),
    body('venue')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Venue name too long'),
    body('address')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Address too long'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Invalid latitude'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Invalid longitude'),
    body('gameType')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Game type too long'),
    body('stakes')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Stakes format too long'),
    body('handsPlayed')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Hands played must be non-negative integer'),
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Notes too long'),
    body('initialBuyIn')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Initial buy-in must be non-negative'),
    body('updateStatus')
      .optional()
      .isBoolean()
      .withMessage('Update status must be boolean'),
    body('notifyFriends')
      .optional()
      .isBoolean()
      .withMessage('Notify friends must be boolean'),
    validateRequest
  ],
  createSession
);

// Get user's sessions with pagination
router.get('/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('active')
      .optional()
      .isBoolean()
      .withMessage('Active filter must be boolean'),
    validateRequest
  ],
  getUserSessions
);

// Get location suggestions
router.get('/location-suggestions', getLocationSuggestions);

// Get session statistics
router.get('/stats', getSessionStats);

// Get specific session
router.get('/:id',
  [
    param('id')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Valid session ID required'),
    validateRequest
  ],
  getSession
);

// Update session
router.put('/:id',
  [
    param('id')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Valid session ID required'),
    body('venue')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Venue name too long'),
    body('address')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Address too long'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Invalid latitude'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Invalid longitude'),
    body('gameType')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Game type too long'),
    body('stakes')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Stakes format too long'),
    body('handsPlayed')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Hands played must be non-negative integer'),
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Notes too long'),
    body('updateStatus')
      .optional()
      .isBoolean()
      .withMessage('Update status must be boolean'),
    body('notifyFriends')
      .optional()
      .isBoolean()
      .withMessage('Notify friends must be boolean'),
    validateRequest
  ],
  updateSession
);

// Add buy-in to session
router.post('/:id/buyin',
  [
    param('id')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Valid session ID required'),
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Buy-in amount must be positive'),
    validateRequest
  ],
  addBuyIn
);

// End session
router.post('/:id/end',
  [
    param('id')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Valid session ID required'),
    body('cashOut')
      .isFloat({ min: 0 })
      .withMessage('Cash-out amount must be non-negative'),
    body('handsPlayed')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Hands played must be non-negative integer'),
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Notes too long'),
    validateRequest
  ],
  endSession
);

// Delete session
router.delete('/:id',
  [
    param('id')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Valid session ID required'),
    validateRequest
  ],
  deleteSession
);

export default router;