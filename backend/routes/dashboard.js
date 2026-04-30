const express = require('express');
const { getStats, getRecommendedCourses, getWeakAreasHandler } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/stats', getStats);
router.get('/recommendations', getRecommendedCourses);
router.get('/weak-areas', getWeakAreasHandler);

module.exports = router;
