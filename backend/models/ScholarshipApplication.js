const mongoose = require('mongoose');

const scholarshipApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Applied', 'Under Review', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  notes: String,
  aiFeedback: String
});

module.exports = mongoose.model('ScholarshipApplication', scholarshipApplicationSchema);
