const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const { generateQuiz } = require('../services/aiService');

// @desc  Create AI-generated quiz
// @route POST /api/quiz/create
const createQuiz = async (req, res, next) => {
  try {
    const { topic, difficulty = 'intermediate', numQuestions, studentId } = req.body;
    
    // Map frontend difficulty to Quiz enum
    const difficultyMap = {
      beginner: 'easy',
      intermediate: 'medium',
      professional: 'medium',
      expert: 'hard'
    };
    const targetDifficulty = difficultyMap[difficulty] || 'medium';

    const quizData = await generateQuiz(topic, targetDifficulty, numQuestions || 5);

    // If teacher is assigning, use the provided studentId, else use own _id
    const targetUserId = (req.user.role === 'teacher' && studentId) ? studentId : req.user._id;

    const quiz = await Quiz.create({
      userId: targetUserId,
      assignedBy: req.user.role === 'teacher' ? req.user._id : undefined,
      topic,
      difficulty: targetDifficulty,
      questions: quizData.questions,
      totalQuestions: quizData.questions.length,
    });
    res.status(201).json({ success: true, quiz });
  } catch (error) { 
    console.error('CREATE QUIZ ERROR:', error);
    next(error); 
  }
};

// @desc  Submit quiz answers
// @route POST /api/quiz/submit
const submitQuiz = async (req, res, next) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    const quiz = await Quiz.findOne({ _id: quizId, userId: req.user._id });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (quiz.status === 'completed') return res.status(400).json({ success: false, message: 'Quiz already submitted' });

    let correct = 0;
    quiz.questions = quiz.questions.map((q, i) => {
      const userAnswer = answers[i] || '';
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correct++;
      return { ...q.toObject(), userAnswer, isCorrect };
    });

    quiz.score = Math.round((correct / quiz.totalQuestions) * 100);
    quiz.timeTaken = timeTaken || 0;
    quiz.status = 'completed';
    quiz.submittedAt = new Date();
    await quiz.save();

    // Update progress
    const existing = await Progress.findOne({ userId: req.user._id, topic: quiz.topic });
    if (existing) {
      existing.history.push({ accuracy: quiz.score, timeSpent: Math.round(timeTaken / 60) });
      existing.accuracy = Math.round((existing.accuracy + quiz.score) / 2);
      existing.timeSpent += Math.round(timeTaken / 60);
      existing.sessionsCount += 1;
      existing.lastUpdated = new Date();
      await existing.save();
    } else {
      await Progress.create({
        userId: req.user._id,
        topic: quiz.topic,
        subject: quiz.topic,
        accuracy: quiz.score,
        timeSpent: Math.round(timeTaken / 60),
        history: [{ accuracy: quiz.score, timeSpent: Math.round(timeTaken / 60) }],
      });
    }

    // Award XP
    const xpEarned = Math.round(quiz.score / 10) * 5;
    await require('../models/User').findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned } });

    res.json({ 
      success: true, 
      score: quiz.score,
      correct, 
      total: quiz.totalQuestions,
      xpEarned,
      questions: quiz.questions // Flattened questions with userAnswer and isCorrect
    });
  } catch (error) { next(error); }
};

// @desc  Get quiz history
// @route GET /api/quiz/history
const getQuizHistory = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id })
      .select('topic difficulty score totalQuestions status createdAt timeTaken assignedBy')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, quizzes });
  } catch (error) { next(error); }
};

// @desc  Get single quiz
// @route GET /api/quiz/:id
const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('assignedBy', 'name');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, quiz });
  } catch (error) { next(error); }
};

module.exports = { createQuiz, submitQuiz, getQuizHistory, getQuiz };
