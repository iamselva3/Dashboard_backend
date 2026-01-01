import mongoose from 'mongoose';

const dataPointSchema = new mongoose.Schema({
    end_year: Number,
    intensity: Number,
    sector: String,
    topic: String,
    insight: String,
    url: String,
    region: String,
    start_year: Number,
    impact: String,
    added: Date,
    published: Date,
    country: String,
    relevance: Number,
    pestle: String,
    source: String,
    title: String,
    likelihood: Number,
    city: String,
    swot: {
        strength: Boolean,
        weakness: Boolean,
        opportunity: Boolean,
        threat: Boolean
    },
    filters: {
        topics: [String],
        sectors: [String],
        regions: [String],
        countries: [String],
        cities: [String]
    }
}, {
    timestamps: true
});

// Create indexes for faster filtering
dataPointSchema.index({ intensity: 1 });
dataPointSchema.index({ likelihood: 1 });
dataPointSchema.index({ relevance: 1 });
dataPointSchema.index({ country: 1 });
dataPointSchema.index({ region: 1 });
dataPointSchema.index({ topic: 1 });
dataPointSchema.index({ sector: 1 });
dataPointSchema.index({ pestle: 1 });
dataPointSchema.index({ 'filters.topics': 1 });

const DataPoint = mongoose.model('DataPoint', dataPointSchema);

export default DataPoint;