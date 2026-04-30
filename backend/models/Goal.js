const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  dueDate: Date,
  complexity: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['video', 'article', 'docs'] }
  }]
});

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['placement', 'exam', 'skill'],
      required: true
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'archived'],
      default: 'in-progress'
    },
    milestones: [milestoneSchema],
    dailyTasks: [{
      text: String,
      isCompleted: { type: Boolean, default: false },
      xpValue: { type: Number, default: 10 }
    }],
    targetDate: Date,
    progress: {
      type: Number,
      default: 0
    },
    aiRoadmapJson: String // Store raw AI generated structure
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
