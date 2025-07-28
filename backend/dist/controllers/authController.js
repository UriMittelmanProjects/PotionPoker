"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../utils/database"));
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
/**
 * Auth controller handling user authentication operations
 */
/**
 * Register new user account
 */
const register = async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { email, password, username, firstName, lastName } = req.body;
        // Check if user already exists
        const existingUser = await database_1.default.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            res.status(400).json({
                success: false,
                message: `User with this ${field} already exists`
            });
            return;
        }
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        // Create user
        const user = await database_1.default.user.create({
            data: {
                email,
                username,
                firstName,
                lastName,
                password: hashedPassword,
            }
        });
        // Generate token
        const token = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email });
        // Send welcome email (non-blocking)
        (0, email_1.sendWelcomeEmail)(user.email, user.firstName).catch(console.error);
        // Return user data without password
        const userData = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            playingStatus: user.playingStatus,
            currentLocation: user.currentLocation,
            statusVisibility: user.statusVisibility,
            totalSessions: user.totalSessions,
            totalWinnings: user.totalWinnings,
        };
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: userData
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.register = register;
/**
 * Login user
 */
const login = async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { email, password } = req.body;
        // Find user by email
        const user = await database_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // Generate token
        const token = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email });
        // Return user data without password
        const userData = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            playingStatus: user.playingStatus,
            currentLocation: user.currentLocation,
            statusVisibility: user.statusVisibility,
            totalSessions: user.totalSessions,
            totalWinnings: user.totalWinnings,
        };
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: userData
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.login = login;
/**
 * Logout user (JWT is stateless, so this mainly serves for logging/analytics)
 */
const logout = async (req, res) => {
    try {
        // For JWT-based auth, we don't need to do much server-side
        // The client will remove the token from storage
        // This endpoint mainly serves for:
        // - Logging logout events
        // - Future token blacklisting (if implemented)
        // - Consistency with auth flow
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.logout = logout;
/**
 * Send forgot password email
 */
const forgotPassword = async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { email } = req.body;
        // Find user by email
        const user = await database_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            // Don't reveal if email exists for security
            res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
            return;
        }
        // Generate reset token
        const resetToken = (0, jwt_1.generateResetToken)({ userId: user.id, email: user.email });
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Save reset token to database
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });
        // Send password reset email
        await (0, email_1.sendPasswordResetEmail)(user.email, resetToken, user.firstName);
        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.forgotPassword = forgotPassword;
/**
 * Reset password with token
 */
const resetPassword = async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { token, newPassword } = req.body;
        // Verify reset token
        let decoded;
        try {
            decoded = (0, jwt_1.verifyToken)(token);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
            return;
        }
        // Find user with matching reset token
        const user = await database_1.default.user.findFirst({
            where: {
                id: decoded.userId,
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
            return;
        }
        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
        // Update password and clear reset token
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.resetPassword = resetPassword;
/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                playingStatus: true,
                currentLocation: true,
                statusVisibility: true,
                totalSessions: true,
                totalWinnings: true,
                createdAt: true
            }
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getProfile = getProfile;
