const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    subject: { type: String, default: 'General' },
    topics: [{ type: String }],
    tags: [{ type: String }],
    thumbnail: { type: String, default: '' },
    duration: { type: Number, default: 0 }, // in minutes
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrolledCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
