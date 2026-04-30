const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questions: [
      {
        text: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: String, required: true },
        explanation: { type: String, default: '' },
        userAnswer: { type: String, default: null },
        isCorrect: { type: Boolean, default: null },
      },
    ],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 }, // seconds
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
