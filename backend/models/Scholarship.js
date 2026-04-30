const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  applyLink: {
    type: String,
    required: true
  },
  category: {
    type: [String],
    enum: ['General', 'OBC', 'SC', 'ST', 'Minority', 'All'],
    default: ['All']
  },
  incomeLimit: {
    type: Number,
    required: true
  },
  educationLevel: {
    type: [String],
    enum: ['School', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Undergraduate', 'Postgraduate', 'PhD', 'Diploma'],
    required: true
  },
  state: {
    type: String,
    default: 'All India'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'All'],
    default: 'All'
  },
  ageLimit: {
    type: Number,
    default: 100
  },
  courseTypes: {
    type: [String],
    default: ['Any']
  },
  eligibilitySummary: {
    type: String
  },
  requiredDocuments: {
    type: [String],
    default: []
  },
  scholarshipType: {
    type: String,
    enum: ['State', 'Central', 'International'],
    default: 'Central'
  },
  applicationPortal: {
    type: String,
    default: 'Official Portal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);
