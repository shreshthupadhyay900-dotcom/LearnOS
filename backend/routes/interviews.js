const express = require('express');
const { interviewChat, generateFeedback, getHistory, getInterview } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.post('/chat', interviewChat);
router.post('/:id/feedback', generateFeedback);
router.get('/history', getHistory);
router.get('/:id', getInterview);

module.exports = router;
