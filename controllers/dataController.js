import asyncHandler from 'express-async-handler';
import DataPoint from '../models/DataPoint.js';

// @desc    Get all data points with filters
// @route   GET /api/data
// @access  Public
const getData = asyncHandler(async (req, res) => {
  const {
    startYear,
    endYear,
    topics,
    sectors,
    regions,
    countries,
    cities,
    pestle,
    source,
    swot,
    limit = 1000,
    page = 1
  } = req.query;

  // Build filter object
  const filter = {};

  if (startYear || endYear) {
    filter.$and = [];
    if (startYear) filter.$and.push({ start_year: { $gte: parseInt(startYear) } });
    if (endYear) filter.$and.push({ end_year: { $lte: parseInt(endYear) } });
  }

  if (topics) filter.topic = { $in: topics.split(',') };
  if (sectors) filter.sector = { $in: sectors.split(',') };
  if (regions) filter.region = { $in: regions.split(',') };
  if (countries) filter.country = { $in: countries.split(',') };
  if (cities) filter.city = { $in: cities.split(',') };
  if (pestle) filter.pestle = pestle;
  if (source) filter.source = source;

  // SWOT filtering
  if (swot) {
    const swotType = swot.toLowerCase();
    filter[`swot.${swotType}`] = true;
  }

  const skip = (page - 1) * limit;

  const data = await DataPoint.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ intensity: -1 });

  const total = await DataPoint.countDocuments(filter);

  res.json({
    success: true,
    count: data.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data
  });
});

// @desc    Get aggregated statistics
// @route   GET /api/data/stats
// @access  Public
const getStats = asyncHandler(async (req, res) => {
  const stats = await DataPoint.aggregate([
    {
      $group: {
        _id: null,
        avgIntensity: { $avg: "$intensity" },
        avgLikelihood: { $avg: "$likelihood" },
        avgRelevance: { $avg: "$relevance" },
        totalRecords: { $sum: 1 },
        uniqueCountries: { $addToSet: "$country" },
        uniqueTopics: { $addToSet: "$topic" },
        uniqueRegions: { $addToSet: "$region" },
        uniqueSectors: { $addToSet: "$sector" }
      }
    },
    {
      $project: {
        avgIntensity: 1,
        avgLikelihood: 1,
        avgRelevance: 1,
        totalRecords: 1,
        uniqueCountries: { $size: "$uniqueCountries" },
        uniqueTopics: { $size: "$uniqueTopics" },
        uniqueRegions: { $size: "$uniqueRegions" },
        uniqueSectors: { $size: "$uniqueSectors" }
      }
    }
  ]);

  res.json({
    success: true,
    stats: stats[0] || {}
  });
});

// @desc    Get filter options
// @route   GET /api/data/filters
// @access  Public
const getFilterOptions = asyncHandler(async (req, res) => {
  const filters = await DataPoint.aggregate([
    {
      $facet: {
        topics: [
          { $match: { topic: { $ne: null, $ne: "" } } },
          { $group: { _id: "$topic", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        sectors: [
          { $match: { sector: { $ne: null, $ne: "" } } },
          { $group: { _id: "$sector", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        regions: [
          { $match: { region: { $ne: null, $ne: "" } } },
          { $group: { _id: "$region", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        countries: [
          { $match: { country: { $ne: null, $ne: "" } } },
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        cities: [
          { $match: { city: { $ne: null, $ne: "" } } },
          { $group: { _id: "$city", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        pestle: [
          { $match: { pestle: { $ne: null, $ne: "" } } },
          { $group: { _id: "$pestle", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        sources: [
          { $match: { source: { $ne: null, $ne: "" } } },
          { $group: { _id: "$source", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        years: [
          { $match: { end_year: { $ne: null } } },
          { $group: { _id: "$end_year", count: { $sum: 1 } } },
          { $sort: { _id: -1 } }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    filters: filters[0]
  });
});

// @desc    Get data for specific visualization
// @route   POST /api/data/visualization
// @access  Public
const getVisualizationData = asyncHandler(async (req, res) => {
  const { type, filters } = req.body;

  let aggregationPipeline = [];

  // Apply filters if provided
  if (filters) {
    const matchStage = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        if (Array.isArray(filters[key])) {
          matchStage[key] = { $in: filters[key] };
        } else {
          matchStage[key] = filters[key];
        }
      }
    });
    if (Object.keys(matchStage).length > 0) {
      aggregationPipeline.push({ $match: matchStage });
    }
  }

  // Add aggregation based on visualization type
  switch (type) {
    case 'intensity_by_country':
      aggregationPipeline.push(
        { $group: { _id: "$country", avgIntensity: { $avg: "$intensity" }, count: { $sum: 1 } } },
        { $sort: { avgIntensity: -1 } },
        { $limit: 20 }
      );
      break;

    case 'likelihood_by_topic':
      aggregationPipeline.push(
        { $group: { _id: "$topic", avgLikelihood: { $avg: "$likelihood" }, count: { $sum: 1 } } },
        { $sort: { avgLikelihood: -1 } },
        { $limit: 15 }
      );
      break;

    case 'relevance_by_sector':
      aggregationPipeline.push(
        { $group: { _id: "$sector", avgRelevance: { $avg: "$relevance" }, count: { $sum: 1 } } },
        { $sort: { avgRelevance: -1 } }
      );
      break;

    case 'yearly_trends':
      aggregationPipeline.push(
        { $group: { 
          _id: "$end_year", 
          avgIntensity: { $avg: "$intensity" },
          avgLikelihood: { $avg: "$likelihood" },
          avgRelevance: { $avg: "$relevance" },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      );
      break;

    case 'pestle_distribution':
      aggregationPipeline.push(
        { $group: { _id: "$pestle", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      );
      break;

    case 'region_analysis':
      aggregationPipeline.push(
        { $group: { 
          _id: "$region", 
          avgIntensity: { $avg: "$intensity" },
          totalRecords: { $sum: 1 },
          countries: { $addToSet: "$country" }
        }},
        { $project: { 
          avgIntensity: 1, 
          totalRecords: 1, 
          countryCount: { $size: "$countries" } 
        }},
        { $sort: { avgIntensity: -1 } }
      );
      break;

    case 'city_analysis':
      aggregationPipeline.push(
        { $match: { city: { $ne: null, $ne: "" } } },
        { $group: { 
          _id: "$city", 
          avgIntensity: { $avg: "$intensity" },
          avgLikelihood: { $avg: "$likelihood" },
          count: { $sum: 1 },
          country: { $first: "$country" }
        }},
        { $sort: { avgIntensity: -1 } },
        { $limit: 15 }
      );
      break;

    default:
      return res.status(400).json({ success: false, message: 'Invalid visualization type' });
  }

  const data = await DataPoint.aggregate(aggregationPipeline);

  res.json({
    success: true,
    type,
    data
  });
});

// @desc    Export data
// @route   POST /api/data/export
// @access  Public
const exportData = asyncHandler(async (req, res) => {
  const { format, filters } = req.body;

  const query = {};
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        if (Array.isArray(filters[key])) {
          query[key] = { $in: filters[key] };
        } else {
          query[key] = filters[key];
        }
      }
    });
  }

  const data = await DataPoint.find(query).limit(5000);

  if (format === 'csv') {
    // Convert to CSV
    let csv = 'End Year,Intensity,Sector,Topic,Region,Country,Relevance,PEST,Source,Title,Likelihood,City\n';
    data.forEach(item => {
      csv += `${item.end_year || ''},${item.intensity || ''},"${item.sector || ''}","${item.topic || ''}","${item.region || ''}","${item.country || ''}",${item.relevance || ''},"${item.pestle || ''}","${item.source || ''}","${item.title || ''}",${item.likelihood || ''},"${item.city || ''}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=data.csv');
    return res.send(csv);
  }

  // Default to JSON
  res.json({
    success: true,
    count: data.length,
    data
  });
});

export {
  getData,
  getStats,
  getFilterOptions,
  getVisualizationData,
  exportData
};