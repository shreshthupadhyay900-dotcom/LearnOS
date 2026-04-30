const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      default: 'General',
    },
    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    sessionsCount: {
      type: Number,
      default: 1,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    history: [
      {
        accuracy: Number,
        timeSpent: Number,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for fast lookups
progressSchema.index({ userId: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
