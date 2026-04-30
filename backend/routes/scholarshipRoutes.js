const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { protect } = require('../middleware/auth');

// Public/Semi-public routes
router.get('/', scholarshipController.getAllScholarships);
router.get('/:id', scholarshipController.getScholarshipById);
router.post('/recommend', scholarshipController.getRecommendations);

// Protected routes
router.post('/check-eligibility', protect, scholarshipController.checkEligibility);
router.post('/apply', protect, scholarshipController.applyForScholarship);
router.get('/user/applications', protect, scholarshipController.getApplicationStatus);

module.exports = router;
