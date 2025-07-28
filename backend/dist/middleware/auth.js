"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.optionalAuth = exports.authenticateToken = void 0;
const express_validator_1 = require("express-validator");
const jwt_1 = require("../utils/jwt");
/**
 * Authentication middleware
 * Verifies JWT token and adds user data to request object
 */
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token required'
            });
            return;
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Optional authentication middleware
 * Adds user data to request if token is provided, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = (0, jwt_1.verifyToken)(token);
            req.user = decoded;
        }
        next();
    }
    catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Validation middleware
 * Checks for validation errors from express-validator
 */
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
