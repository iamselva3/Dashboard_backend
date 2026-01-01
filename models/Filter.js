import mongoose from 'mongoose';

const filterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    type: {
        type: String,
        enum: ['year', 'topic', 'sector', 'region', 'country', 'city', 'pestle', 'source', 'swot', 'custom'],
        required: true
    },
    options: [{
        value: String,
        label: String,
        count: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Filter = mongoose.model('Filter', filterSchema);

export default Filter;