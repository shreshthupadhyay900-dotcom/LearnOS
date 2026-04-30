const Progress = require('../models/Progress');
const Course = require('../models/Course');

/**
 * Get topics where user accuracy is below threshold
 */
const getWeakAreas = async (userId, threshold = 60) => {
  const weakTopics = await Progress.find({
    userId,
    accuracy: { $lt: threshold },
  }).sort({ accuracy: 1 }).limit(10);
  return weakTopics;
};

/**
 * Recommend courses based on user's weak areas
 */
const getRecommendations = async (userId) => {
  const weakAreas = await getWeakAreas(userId);
  if (weakAreas.length === 0) {
    // No weak areas — recommend popular/new courses
    return await Course.find({ isPublished: true }).sort({ enrolledCount: -1 }).limit(6);
  }
  const weakTopicNames = weakAreas.map((w) => w.topic.toLowerCase());
  const weakSubjects = [...new Set(weakAreas.map((w) => w.subject))];

  // Find courses matching weak subjects or tags
  const recommended = await Course.find({
    isPublished: true,
    $or: [
      { subject: { $in: weakSubjects } },
      { tags: { $in: weakTopicNames } },
      { topics: { $elemMatch: { $in: weakTopicNames.map((t) => new RegExp(t, 'i')) } } },
    ],
  }).limit(6);

  if (recommended.length < 3) {
    // Pad with popular courses
    const popular = await Course.find({ isPublished: true }).sort({ enrolledCount: -1 }).limit(6);
    const ids = new Set(recommended.map((c) => c._id.toString()));
    for (const c of popular) {
      if (!ids.has(c._id.toString())) recommended.push(c);
      if (recommended.length >= 6) break;
    }
  }
  return recommended;
};

module.exports = { getWeakAreas, getRecommendations };
