import asyncHandler from 'express-async-handler';
import Filter from '../models/Filter.js';

// @desc    Get all filters
// @route   GET /api/filters
// @access  Public
const getFilters = asyncHandler(async (req, res) => {
    const filters = await Filter.find().sort({ createdAt: -1 });

    res.json({
        success: true,
        count: filters.length,
        data: filters
    });
});

// @desc    Get filter by type
// @route   GET /api/filters/:type
// @access  Public
const getFilterByType = asyncHandler(async (req, res) => {
    const { type } = req.params;

    const filter = await Filter.findOne({ type });

    if (!filter) {
        return res.status(404).json({
            success: false,
            message: `Filter of type ${type} not found`
        });
    }

    res.json({
        success: true,
        data: filter
    });
});

// @desc    Create a filter
// @route   POST /api/filters
// @access  Public
const createFilter = asyncHandler(async (req, res) => {
    const { name, description, type, options } = req.body;

    const filter = await Filter.create({
        name,
        description,
        type,
        options
    });

    res.status(201).json({
        success: true,
        data: filter
    });
});

// @desc    Update a filter
// @route   PUT /api/filters/:id
// @access  Public
const updateFilter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, options } = req.body;

    const filter = await Filter.findById(id);

    if (!filter) {
        return res.status(404).json({
            success: false,
            message: 'Filter not found'
        });
    }

    filter.name = name || filter.name;
    filter.description = description || filter.description;
    filter.options = options || filter.options;
    filter.updatedAt = Date.now();

    await filter.save();

    res.json({
        success: true,
        data: filter
    });
});

// @desc    Delete a filter
// @route   DELETE /api/filters/:id
// @access  Public
const deleteFilter = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const filter = await Filter.findById(id);

    if (!filter) {
        return res.status(404).json({
            success: false,
            message: 'Filter not found'
        });
    }

    await filter.deleteOne();

    res.json({
        success: true,
        message: 'Filter deleted successfully'
    });
});

// @desc    Save user filter configuration
// @route   POST /api/filters/save
// @access  Public
const saveFilterConfig = asyncHandler(async (req, res) => {
    const { name, filters } = req.body;

    const filterConfig = await Filter.create({
        name,
        type: 'custom',
        description: 'User saved filter configuration',
        options: Object.entries(filters).map(([key, value]) => ({
            value: key,
            label: key,
            count: Array.isArray(value) ? value.length : 1
        }))
    });

    res.status(201).json({
        success: true,
        data: filterConfig,
        message: 'Filter configuration saved successfully'
    });
});

export {
    getFilters,
    getFilterByType,
    createFilter,
    updateFilter,
    deleteFilter,
    saveFilterConfig
};