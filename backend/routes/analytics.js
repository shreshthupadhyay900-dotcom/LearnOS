const express = require('express');
const { getProgress, getPerformance } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/progress', getProgress);
router.get('/performance', getPerformance);

module.exports = router;
