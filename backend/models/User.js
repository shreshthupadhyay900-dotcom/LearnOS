const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: '',
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    xp: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: Date,
      },
    ],
    dailyGoal: {
      type: Number,
      default: 30, // minutes
    },
    language: {
      type: String,
      default: 'en',
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    tutorPersonality: {
      type: String,
      enum: ['mentor', 'strict', 'coach'],
      default: 'mentor',
    },
    interests: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
