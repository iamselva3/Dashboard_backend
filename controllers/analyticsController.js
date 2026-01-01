import asyncHandler from 'express-async-handler';
import Analytics from '../models/Analytics.js';

// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Public
const getAnalytics = asyncHandler(async (req, res) => {
    const { type = 'monthly', limit = 10 } = req.query;

    const analytics = await Analytics.find({ type })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

    res.json({
        success: true,
        count: analytics.length,
        data: analytics
    });
});

// @desc    Create analytics snapshot
// @route   POST /api/analytics
// @access  Public
const createAnalytics = asyncHandler(async (req, res) => {
    const { type, period, metrics, data } = req.body;

    const analytics = await Analytics.create({
        type,
        period,
        metrics,
        data
    });

    res.status(201).json({
        success: true,
        data: analytics
    });
});

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
// @access  Public
const getAnalyticsSummary = asyncHandler(async (req, res) => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const analytics = await Analytics.find({
        createdAt: { $gte: lastMonth }
    }).sort({ createdAt: -1 });

    const summary = {
        totalSnapshots: analytics.length,
        latestSnapshot: analytics[0] || null,
        types: analytics.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
        }, {}),
        averageMetrics: {
            avgIntensity: 0,
            avgLikelihood: 0,
            avgRelevance: 0
        }
    };

    // Calculate average metrics
    if (analytics.length > 0) {
        const total = analytics.reduce((sum, item) => ({
            avgIntensity: sum.avgIntensity + (item.metrics?.avgIntensity || 0),
            avgLikelihood: sum.avgLikelihood + (item.metrics?.avgLikelihood || 0),
            avgRelevance: sum.avgRelevance + (item.metrics?.avgRelevance || 0)
        }), { avgIntensity: 0, avgLikelihood: 0, avgRelevance: 0 });

        summary.averageMetrics = {
            avgIntensity: total.avgIntensity / analytics.length,
            avgLikelihood: total.avgLikelihood / analytics.length,
            avgRelevance: total.avgRelevance / analytics.length
        };
    }

    res.json({
        success: true,
        summary
    });
});

export {
    getAnalytics,
    createAnalytics,
    getAnalyticsSummary
};