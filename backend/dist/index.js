"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./utils/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
/**
 * Middleware setup
 */
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true
})); // Enable CORS
app.use((0, morgan_1.default)('combined')); // HTTP request logger
app.use(express_1.default.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'PotionPoker API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
/**
 * API routes
 */
app.use('/api/auth', authRoutes_1.default);
app.use('/api/sessions', sessionRoutes_1.default);
/**
 * 404 handler for unknown routes
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
/**
 * Global error handler
 */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
/**
 * Start server
 */
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8081'}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await (0, database_1.disconnectDatabase)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await (0, database_1.disconnectDatabase)();
    process.exit(0);
});
// Start the server
startServer();
