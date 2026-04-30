const express = require('express');
const { body } = require('express-validator');
const { chat, getChatList, getChatSession, aiGenerateQuiz, aiGenerateNotes, aiEvaluateAssignment, aiGenerateFlashcards, stt, aiTeachTopic, aiLessonQuiz, aiAnalyzeWeakAreas } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(protect);

router.post('/chat', validate([body('message').notEmpty().withMessage('Message is required')]), chat);
router.get('/chats', getChatList);
router.get('/chats/:id', getChatSession);
router.post('/generate-quiz', validate([body('topic').notEmpty().withMessage('Topic is required')]), aiGenerateQuiz);
router.post('/generate-notes', validate([body('topic').notEmpty().withMessage('Topic is required')]), aiGenerateNotes);
router.post('/evaluate-assignment', validate([body('content').notEmpty().withMessage('Content is required')]), aiEvaluateAssignment);
router.post('/generate-flashcards', protect, validate([body('topic').notEmpty().withMessage('Topic is required')]), aiGenerateFlashcards);
router.post('/stt', stt);
router.post('/teach', validate([body('topic').notEmpty().withMessage('Topic is required')]), aiTeachTopic);
router.post('/lesson-quiz', validate([body('topic').notEmpty().withMessage('Topic is required')]), aiLessonQuiz);
router.post('/analyze', validate([body('topic').notEmpty().withMessage('Topic is required')]), aiAnalyzeWeakAreas);

module.exports = router;
