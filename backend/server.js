require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');
const quizRoutes = require('./routes/quiz');
const analyticsRoutes = require('./routes/analytics');
const assignmentRoutes = require('./routes/assignments');
const voiceRoutes = require('./routes/voice');
const goalRoutes = require('./routes/goals');
const interviewRoutes = require('./routes/interviews');
const resumeRoutes = require('./routes/resume');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const socialRoutes = require('./routes/social');
const messageRoutes = require('./routes/messages');
const teacherRoutes = require('./routes/teacher');
const notesRoutes = require('./routes/notes');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Rate limiting (Production Only)
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { success: false, message: 'Too many requests, please try again later.' }
  });
  const authLimiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    message: { success: false, message: 'Too many auth attempts, please try again later.' }
  });
  app.use('/api/', limiter);
  app.use('/api/auth', authLimiter);
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/notes', notesRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: '🚀 EduAI API is running', version: '1.0.0', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Global error handler
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 EduAI Backend running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🤖 AI Mode: ${process.env.OPENAI_API_KEY ? 'Advanced Orchestrator (OpenAI)' : 'Mock (Demo)'}`);
  console.log(`\n📋 Available Routes:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/dashboard/stats`);
  console.log(`   POST /api/ai/chat`);
  console.log(`   POST /api/quiz/create`);
  console.log(`   GET  /api/analytics/progress`);
});

module.exports = app;
