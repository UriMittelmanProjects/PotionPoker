"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionStats = exports.getLocationSuggestions = exports.deleteSession = exports.endSession = exports.addBuyIn = exports.updateSession = exports.getSession = exports.getUserSessions = exports.createSession = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createSession = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const sessionData = req.body;
        // Mark any existing active session as incomplete
        await prisma.pokerSession.updateMany({
            where: {
                userId,
                isActive: true,
                isComplete: false
            },
            data: {
                isActive: false,
                isComplete: false
            }
        });
        // Create new session
        const session = await prisma.pokerSession.create({
            data: {
                userId,
                sessionType: sessionData.sessionType,
                venue: sessionData.venue,
                address: sessionData.address,
                latitude: sessionData.latitude,
                longitude: sessionData.longitude,
                gameType: sessionData.gameType,
                stakes: sessionData.stakes,
                handsPlayed: sessionData.handsPlayed,
                notes: sessionData.notes,
                updateStatus: sessionData.updateStatus || false,
                notifyFriends: sessionData.notifyFriends || false,
                totalBuyIn: sessionData.initialBuyIn || 0
            },
            include: {
                buyIns: true
            }
        });
        // Add initial buy-in if provided
        if (sessionData.initialBuyIn && sessionData.initialBuyIn > 0) {
            await prisma.buyIn.create({
                data: {
                    sessionId: session.id,
                    amount: sessionData.initialBuyIn
                }
            });
        }
        // Update user playing status if requested
        if (sessionData.updateStatus) {
            const statusLocation = sessionData.venue || 'Unknown Location';
            await prisma.user.update({
                where: { id: userId },
                data: {
                    playingStatus: `Playing at ${statusLocation}`,
                    currentLocation: statusLocation
                }
            });
        }
        res.status(201).json({
            success: true,
            data: session
        });
    }
    catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create session'
        });
    }
};
exports.createSession = createSession;
const getUserSessions = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const { page = '1', limit = '20', active } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const whereClause = { userId };
        if (active !== undefined) {
            whereClause.isActive = active === 'true';
        }
        const sessions = await prisma.pokerSession.findMany({
            where: whereClause,
            include: {
                buyIns: true
            },
            orderBy: { startTime: 'desc' },
            skip,
            take: parseInt(limit)
        });
        const total = await prisma.pokerSession.count({ where: whereClause });
        res.json({
            success: true,
            data: sessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve sessions'
        });
    }
};
exports.getUserSessions = getUserSessions;
const getSession = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const session = await prisma.pokerSession.findFirst({
            where: {
                id,
                userId
            },
            include: {
                buyIns: true
            }
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        res.json({
            success: true,
            data: session
        });
    }
    catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve session'
        });
    }
};
exports.getSession = getSession;
const updateSession = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const updateData = req.body;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const session = await prisma.pokerSession.findFirst({
            where: { id, userId }
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        const updatedSession = await prisma.pokerSession.update({
            where: { id },
            data: updateData,
            include: {
                buyIns: true
            }
        });
        res.json({
            success: true,
            data: updatedSession
        });
    }
    catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update session'
        });
    }
};
exports.updateSession = updateSession;
const addBuyIn = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { amount } = req.body;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid buy-in amount required'
            });
        }
        const session = await prisma.pokerSession.findFirst({
            where: { id, userId }
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        if (!session.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot add buy-in to inactive session'
            });
        }
        // Create buy-in record
        const buyIn = await prisma.buyIn.create({
            data: {
                sessionId: id,
                amount
            }
        });
        // Update session total buy-in
        const updatedSession = await prisma.pokerSession.update({
            where: { id },
            data: {
                totalBuyIn: session.totalBuyIn + amount
            },
            include: {
                buyIns: true
            }
        });
        res.json({
            success: true,
            data: updatedSession
        });
    }
    catch (error) {
        console.error('Add buy-in error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add buy-in'
        });
    }
};
exports.addBuyIn = addBuyIn;
const endSession = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { cashOut, handsPlayed, notes } = req.body;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        if (cashOut === undefined || cashOut < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid cash-out amount required'
            });
        }
        const session = await prisma.pokerSession.findFirst({
            where: { id, userId }
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / (1000 * 60));
        const profit = cashOut - session.totalBuyIn;
        const updatedSession = await prisma.pokerSession.update({
            where: { id },
            data: {
                cashOut,
                profit,
                endTime,
                duration,
                isActive: false,
                isComplete: true,
                handsPlayed: handsPlayed || session.handsPlayed,
                notes: notes || session.notes
            },
            include: {
                buyIns: true
            }
        });
        // Update user statistics
        await prisma.user.update({
            where: { id: userId },
            data: {
                totalSessions: { increment: 1 },
                totalWinnings: { increment: profit },
                playingStatus: null,
                currentLocation: null
            }
        });
        res.json({
            success: true,
            data: updatedSession
        });
    }
    catch (error) {
        console.error('End session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to end session'
        });
    }
};
exports.endSession = endSession;
const deleteSession = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const session = await prisma.pokerSession.findFirst({
            where: { id, userId }
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        // Delete session (buy-ins will be cascade deleted)
        await prisma.pokerSession.delete({
            where: { id }
        });
        // Update user statistics if session was completed
        if (session.isComplete && session.profit !== null) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    totalSessions: { decrement: 1 },
                    totalWinnings: { decrement: session.profit }
                }
            });
        }
        res.json({
            success: true,
            message: 'Session deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete session'
        });
    }
};
exports.deleteSession = deleteSession;
const getLocationSuggestions = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const suggestions = await prisma.pokerSession.groupBy({
            by: ['venue', 'address', 'sessionType'],
            where: {
                userId,
                venue: { not: null },
                isComplete: true
            },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 3
        });
        const locationSuggestions = suggestions.map(suggestion => ({
            venue: suggestion.venue,
            address: suggestion.address || undefined,
            sessionCount: suggestion._count.id,
            sessionType: suggestion.sessionType
        }));
        res.json({
            success: true,
            data: locationSuggestions
        });
    }
    catch (error) {
        console.error('Get location suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get location suggestions'
        });
    }
};
exports.getLocationSuggestions = getLocationSuggestions;
const getSessionStats = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const sessions = await prisma.pokerSession.findMany({
            where: { userId }
        });
        const completedSessions = sessions.filter(s => s.isComplete);
        const activeSessions = sessions.filter(s => s.isActive);
        const totalBuyIns = sessions.reduce((sum, s) => sum + s.totalBuyIn, 0);
        const totalCashOuts = completedSessions.reduce((sum, s) => sum + (s.cashOut || 0), 0);
        const totalProfit = completedSessions.reduce((sum, s) => sum + (s.profit || 0), 0);
        const validSessions = completedSessions.filter(s => s.duration && s.duration >= 2);
        const totalMinutes = validSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const totalHours = totalMinutes / 60;
        const stats = {
            totalSessions: sessions.length,
            completedSessions: completedSessions.length,
            activeSessions: activeSessions.length,
            totalBuyIns,
            totalCashOuts,
            totalProfit,
            averageProfit: completedSessions.length > 0 ? totalProfit / completedSessions.length : 0,
            biggestWin: Math.max(...completedSessions.map(s => s.profit || 0), 0),
            biggestLoss: Math.min(...completedSessions.map(s => s.profit || 0), 0),
            averageSessionLength: validSessions.length > 0 ? totalMinutes / validSessions.length : 0,
            totalHoursPlayed: totalHours,
            hourlyRate: totalHours > 0 ? totalProfit / totalHours : 0
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Get session stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get session statistics'
        });
    }
};
exports.getSessionStats = getSessionStats;
