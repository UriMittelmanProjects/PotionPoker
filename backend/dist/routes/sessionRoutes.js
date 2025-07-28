"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const sessionController_1 = require("../controllers/sessionController");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_2.authenticateToken);
// Create new session
router.post('/', [
    (0, express_validator_1.body)('sessionType')
        .isIn(['live_casino', 'home_game', 'online', 'other'])
        .withMessage('Invalid session type'),
    (0, express_validator_1.body)('venue')
        .optional()
        .isString()
        .isLength({ max: 255 })
        .withMessage('Venue name too long'),
    (0, express_validator_1.body)('address')
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage('Address too long'),
    (0, express_validator_1.body)('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Invalid latitude'),
    (0, express_validator_1.body)('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Invalid longitude'),
    (0, express_validator_1.body)('gameType')
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage('Game type too long'),
    (0, express_validator_1.body)('stakes')
        .optional()
        .isString()
        .isLength({ max: 50 })
        .withMessage('Stakes format too long'),
    (0, express_validator_1.body)('handsPlayed')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Hands played must be non-negative integer'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isString()
        .isLength({ max: 2000 })
        .withMessage('Notes too long'),
    (0, express_validator_1.body)('initialBuyIn')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Initial buy-in must be non-negative'),
    (0, express_validator_1.body)('updateStatus')
        .optional()
        .isBoolean()
        .withMessage('Update status must be boolean'),
    (0, express_validator_1.body)('notifyFriends')
        .optional()
        .isBoolean()
        .withMessage('Notify friends must be boolean'),
    auth_1.validateRequest
], sessionController_1.createSession);
// Get user's sessions with pagination
router.get('/', [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('active')
        .optional()
        .isBoolean()
        .withMessage('Active filter must be boolean'),
    auth_1.validateRequest
], sessionController_1.getUserSessions);
// Get location suggestions
router.get('/location-suggestions', sessionController_1.getLocationSuggestions);
// Get session statistics
router.get('/stats', sessionController_1.getSessionStats);
// Get specific session
router.get('/:id', [
    (0, express_validator_1.param)('id')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Valid session ID required'),
    auth_1.validateRequest
], sessionController_1.getSession);
// Update session
router.put('/:id', [
    (0, express_validator_1.param)('id')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Valid session ID required'),
    (0, express_validator_1.body)('venue')
        .optional()
        .isString()
        .isLength({ max: 255 })
        .withMessage('Venue name too long'),
    (0, express_validator_1.body)('address')
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage('Address too long'),
    (0, express_validator_1.body)('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Invalid latitude'),
    (0, express_validator_1.body)('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Invalid longitude'),
    (0, express_validator_1.body)('gameType')
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage('Game type too long'),
    (0, express_validator_1.body)('stakes')
        .optional()
        .isString()
        .isLength({ max: 50 })
        .withMessage('Stakes format too long'),
    (0, express_validator_1.body)('handsPlayed')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Hands played must be non-negative integer'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isString()
        .isLength({ max: 2000 })
        .withMessage('Notes too long'),
    (0, express_validator_1.body)('updateStatus')
        .optional()
        .isBoolean()
        .withMessage('Update status must be boolean'),
    (0, express_validator_1.body)('notifyFriends')
        .optional()
        .isBoolean()
        .withMessage('Notify friends must be boolean'),
    auth_1.validateRequest
], sessionController_1.updateSession);
// Add buy-in to session
router.post('/:id/buyin', [
    (0, express_validator_1.param)('id')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Valid session ID required'),
    (0, express_validator_1.body)('amount')
        .isFloat({ gt: 0 })
        .withMessage('Buy-in amount must be positive'),
    auth_1.validateRequest
], sessionController_1.addBuyIn);
// End session
router.post('/:id/end', [
    (0, express_validator_1.param)('id')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Valid session ID required'),
    (0, express_validator_1.body)('cashOut')
        .isFloat({ min: 0 })
        .withMessage('Cash-out amount must be non-negative'),
    (0, express_validator_1.body)('handsPlayed')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Hands played must be non-negative integer'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isString()
        .isLength({ max: 2000 })
        .withMessage('Notes too long'),
    auth_1.validateRequest
], sessionController_1.endSession);
// Delete session
router.delete('/:id', [
    (0, express_validator_1.param)('id')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Valid session ID required'),
    auth_1.validateRequest
], sessionController_1.deleteSession);
exports.default = router;
