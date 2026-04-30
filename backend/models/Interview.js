const mongoose = require('mongoose');

const answerScoreSchema = new mongoose.Schema({
  questionIndex: Number,
  score: { type: Number, min: 0, max: 100 },
  technicalAccuracy: { type: Number, min: 0, max: 100 },
  clarity: { type: Number, min: 0, max: 100 },
  depth: { type: Number, min: 0, max: 100 },
}, { _id: false });

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    domain: { type: String, required: true },
    company: { type: String, default: 'General Tech' },
    difficulty: {
      type: String,
      enum: ['junior', 'mid', 'senior'],
      default: 'mid'
    },
    phase: {
      type: String,
      enum: ['intro', 'technical', 'behavioral', 'system_design', 'closing'],
      default: 'intro'
    },
    questionCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 7 },
    status: {
      type: String,
      enum: ['ongoing', 'completed'],
      default: 'ongoing'
    },
    transcript: [{
      role: { type: String, enum: ['interviewer', 'candidate'] },
      content: String,
      phase: String,
      timestamp: { type: Date, default: Date.now }
    }],
    answerScores: [answerScoreSchema],
    mistakes: [{
      question: String,
      mistake: String,
      feedback: String,
      isResolved: { type: Boolean, default: false }
    }],
    feedback: {
      overallScore: Number,
      technicalScore: Number,
      communicationScore: Number,
      problemSolvingScore: Number,
      confidence: Number,
      clarity: Number,
      pros: [String],
      cons: [String],
      knowledgeGaps: [String],
      overallFeedback: String,
      hiringRecommendation: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
