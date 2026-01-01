// Data processing utilities

export const processJsonData = (data) => {
  return data.map(item => ({
    ...item,
    filters: {
      topics: item.topic ? [item.topic] : [],
      sectors: item.sector ? [item.sector] : [],
      regions: item.region ? [item.region] : [],
      countries: item.country ? [item.country] : [],
      cities: item.city ? [item.city] : []
    }
  }));
};

export const calculateStatistics = (data) => {
  if (!data || data.length === 0) {
    return {
      total: 0,
      avgIntensity: 0,
      avgLikelihood: 0,
      avgRelevance: 0,
      uniqueCountries: 0,
      uniqueTopics: 0,
      uniqueRegions: 0
    };
  }

  const intensities = data.filter(d => d.intensity).map(d => d.intensity);
  const likelihoods = data.filter(d => d.likelihood).map(d => d.likelihood);
  const relevances = data.filter(d => d.relevance).map(d => d.relevance);

  const countries = [...new Set(data.filter(d => d.country).map(d => d.country))];
  const topics = [...new Set(data.filter(d => d.topic).map(d => d.topic))];
  const regions = [...new Set(data.filter(d => d.region).map(d => d.region))];

  return {
    total: data.length,
    avgIntensity: intensities.length > 0 ? intensities.reduce((a, b) => a + b, 0) / intensities.length : 0,
    avgLikelihood: likelihoods.length > 0 ? likelihoods.reduce((a, b) => a + b, 0) / likelihoods.length : 0,
    avgRelevance: relevances.length > 0 ? relevances.reduce((a, b) => a + b, 0) / relevances.length : 0,
    uniqueCountries: countries.length,
    uniqueTopics: topics.length,
    uniqueRegions: regions.length
  };
};

export const filterData = (data, filters) => {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }

  return data.filter(item => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) continue;
        if (!value.includes(item[key])) return false;
      } else {
        if (item[key] !== value) return false;
      }
    }
    return true;
  });
};