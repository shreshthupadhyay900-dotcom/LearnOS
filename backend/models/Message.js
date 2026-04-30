const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    subject: { type: String, default: 'General Inquiry' },
    relatedTo: {
      type: String,
      enum: ['assignment', 'quiz', 'tutor', 'general'],
      default: 'general'
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId } // e.g. Assignment ID
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
