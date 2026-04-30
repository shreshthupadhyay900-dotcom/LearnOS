const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const { getWeakAreas, getRecommendations } = require('../services/recommendationService');

// @desc  Get dashboard stats
// @route GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const progress = await Progress.find({ userId });

    const totalTopics = progress.length;
    const completedTopics = progress.filter((p) => p.accuracy >= 70).length;
    const avgAccuracy = totalTopics > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.accuracy, 0) / totalTopics)
      : 0;
    const totalStudyTime = progress.reduce((sum, p) => sum + p.timeSpent, 0);
    const quizzes = await Quiz.find({ userId, status: 'completed' });
    const coursesInProgress = progress.filter((p) => p.accuracy > 0 && p.accuracy < 100).length;

    res.json({
      success: true,
      stats: {
        streak: req.user.streak,
        xp: req.user.xp,
        coursesInProgress,
        completedTopics,
        accuracy: avgAccuracy,
        studyTime: totalStudyTime,
        quizzesCompleted: quizzes.length,
        badges: req.user.badges?.length || 0,
      },
    });
  } catch (error) { next(error); }
};

// @desc  Get recommended courses
// @route GET /api/dashboard/recommendations
const getRecommendedCourses = async (req, res, next) => {
  try {
    const courses = await getRecommendations(req.user._id);
    res.json({ success: true, courses });
  } catch (error) { next(error); }
};

// @desc  Get weak areas
// @route GET /api/dashboard/weak-areas
const getWeakAreasHandler = async (req, res, next) => {
  try {
    const weakAreas = await getWeakAreas(req.user._id);
    res.json({ success: true, weakAreas });
  } catch (error) { next(error); }
};

module.exports = { getStats, getRecommendedCourses, getWeakAreasHandler };
