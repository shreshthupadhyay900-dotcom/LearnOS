const express = require('express');
const { body } = require('express-validator');
const { createQuiz, submitQuiz, getQuizHistory, getQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(protect);

router.post('/create', validate([body('topic').notEmpty().withMessage('Topic is required')]), createQuiz);
router.post('/submit', validate([body('quizId').notEmpty(), body('answers').isArray()]), submitQuiz);
router.get('/history', getQuizHistory);
router.get('/:id', getQuiz);

module.exports = router;
