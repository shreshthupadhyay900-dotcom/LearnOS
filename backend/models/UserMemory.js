const mongoose = require('mongoose');

const userMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'analytical'],
    default: 'analytical'
  },
  weakTopics: [{
    topic: String,
    lastAttempted: Date,
    score: Number,
    revisions: { type: Number, default: 0 }
  }],
  strongTopics: [String],
  behavioralTraits: {
    persistence: { type: Number, default: 5 }, // 1-10
    curiosity: { type: Number, default: 5 },
    frustrationThreshold: { type: Number, default: 5 }
  },
  pastInteractionsSummary: {
    type: String,
    default: ""
  },
  lastEmotionalState: {
    type: String,
    default: "NEUTRAL"
  }
}, { timestamps: true });

module.exports = mongoose.model('UserMemory', userMemorySchema);
