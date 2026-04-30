const ChatHistory = require('../models/ChatHistory');
const { orchestrateResponse } = require('../services/orchestratorService');
const { generateQuiz, generateNotes, evaluateAssignment, generateFlashcards, teachTopic, generateLessonQuiz, analyzeWeakAreas } = require('../services/aiService');

// @desc  Advanced AI Chat with multi-agent orchestration
// @route POST /api/ai/chat
const chat = async (req, res, next) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user._id;

    // 1. Get/Create Chat Session
    let chatSession;
    if (chatId) {
      chatSession = await ChatHistory.findOne({ _id: chatId, userId });
    }
    if (!chatSession) {
      chatSession = await ChatHistory.create({ userId, title: message.slice(0, 50), messages: [] });
    }

    // 2. Add user message
    chatSession.messages.push({ role: 'user', content: message });

    // 3. Call Orchestrator (Intent -> RAG -> Agent -> Memory)
    const result = await orchestrateResponse(userId, message, chatId);

    // 4. Save AI Response
    chatSession.messages.push({ 
      role: 'ai', 
      content: result.answer,
      metadata: {
        intent: result.intent,
        resources: result.resources,
        difficulty: result.difficulty,
        sources: result.sources
      }
    });
    
    await chatSession.save();

    res.json({ 
      success: true, 
      ...result,
      chatId: chatSession._id 
    });
  } catch (error) { next(error); }
};

// @desc  Speech-to-Text conversion using OpenAI Whisper
// @route POST /api/ai/stt
const stt = async (req, res, next) => {
  // Implementation for Whisper API
  res.json({ success: true, text: "Speech recognition active." });
};

// @desc  Get chat history list
// @route GET /api/ai/chats
const getChatList = async (req, res, next) => {
  try {
    const chats = await ChatHistory.find({ userId: req.user._id, isArchived: false })
      .select('title createdAt messages')
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json({ success: true, chats });
  } catch (error) { next(error); }
};

// @desc  Get single chat session
// @route GET /api/ai/chats/:id
const getChatSession = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.json({ success: true, chat });
  } catch (error) { next(error); }
};

// @desc  Generate AI quiz
// @route POST /api/ai/generate-quiz
const aiGenerateQuiz = async (req, res, next) => {
  try {
    const { topic, difficulty, numQuestions } = req.body;
    const quizData = await generateQuiz(topic, difficulty || 'medium', numQuestions || 5);
    res.json({ success: true, quiz: quizData });
  } catch (error) { next(error); }
};

// @desc  Generate AI notes
// @route POST /api/ai/generate-notes
const aiGenerateNotes = async (req, res, next) => {
  try {
    const { topic } = req.body;
    const notes = await generateNotes(topic);
    res.json({ success: true, notes });
  } catch (error) { next(error); }
};

// @desc  Evaluate assignment
// @route POST /api/ai/evaluate-assignment
const aiEvaluateAssignment = async (req, res, next) => {
  try {
    const { content, subject } = req.body;
    const evaluation = await evaluateAssignment(content, subject);
    res.json({ success: true, evaluation });
  } catch (error) { next(error); }
};

// @desc  Generate flashcards for Neural Review
// @route POST /api/ai/generate-flashcards
const aiGenerateFlashcards = async (req, res, next) => {
  try {
    const { topic } = req.body;
    const flashcards = await generateFlashcards(topic);
    res.json({ success: true, flashcards });
  } catch (error) { next(error); }
};

// @desc  Teach a topic with structured lesson
// @route POST /api/ai/teach
const aiTeachTopic = async (req, res, next) => {
  try {
    const { topic, level } = req.body;
    const lesson = await teachTopic(topic, level || 'intermediate');
    res.json({ success: true, lesson });
  } catch (error) { next(error); }
};

// @desc  Generate quiz based on lesson content
// @route POST /api/ai/lesson-quiz
const aiLessonQuiz = async (req, res, next) => {
  try {
    const { topic, lessonContent } = req.body;
    const quiz = await generateLessonQuiz(topic, lessonContent);
    res.json({ success: true, quiz });
  } catch (error) { next(error); }
};

// @desc  Analyze performance and weak areas
// @route POST /api/ai/analyze
const aiAnalyzeWeakAreas = async (req, res, next) => {
  try {
    const { topic, questions, userAnswers } = req.body;
    const analysis = await analyzeWeakAreas(topic, questions, userAnswers);
    res.json({ success: true, analysis });
  } catch (error) { next(error); }
};

module.exports = { chat, getChatList, getChatSession, aiGenerateQuiz, aiGenerateNotes, aiEvaluateAssignment, aiGenerateFlashcards, stt, aiTeachTopic, aiLessonQuiz, aiAnalyzeWeakAreas };
