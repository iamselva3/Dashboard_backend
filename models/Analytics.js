import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom']
    },
    period: {
        start: Date,
        end: Date
    },
    metrics: {
        totalRecords: Number,
        avgIntensity: Number,
        avgLikelihood: Number,
        avgRelevance: Number,
        uniqueCountries: Number,
        uniqueTopics: Number,
        uniqueRegions: Number,
        uniqueSectors: Number
    },
    data: mongoose.Schema.Types.Mixed,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;