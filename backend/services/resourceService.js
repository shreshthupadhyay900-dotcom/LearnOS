const axios = require('axios');

/**
 * Aggregates educational resources from multiple sources
 */
const getResources = async (topic, limit = 5) => {
  try {
    // In a real production app, you would call YouTube Search API, Google Search API, etc.
    // For this implementation, we aggregate from a curated set and use AI to rank them (simulated)
    
    const sources = [
      {
        title: `Complete Guide to ${topic}`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}+tutorial`,
        type: 'video',
        provider: 'YouTube'
      },
      {
        title: `${topic} - National Scholarship Portal Info`,
        url: `https://scholarships.gov.in/search?q=${encodeURIComponent(topic)}`,
        type: 'article',
        provider: 'Gov'
      },
      {
        title: `Advanced ${topic} Patterns`,
        url: `https://github.com/search?q=${encodeURIComponent(topic)}+best+practices`,
        type: 'code',
        provider: 'GitHub'
      }
    ];

    return sources.slice(0, limit);
  } catch (error) {
    console.error('Resource Aggregation Error:', error);
    return [];
  }
};

module.exports = { getResources };
