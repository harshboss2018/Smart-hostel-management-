const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['cleaning', 'complaint-resolution', 'custom'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  prompt: {
    type: String,
    required: true,
    trim: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
  },
  complaintTitle: {
    type: String,
    default: '',
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdByRole: {
    type: String,
    enum: ['warden', 'admin', 'system'],
    default: 'warden',
  },
  audience: {
    type: String,
    enum: ['single', 'bulk'],
    default: 'single',
  },
  targetLabel: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Submitted'],
    default: 'Pending',
  },
  response: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    satisfaction: {
      type: String,
      enum: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied', 'Very Unsatisfied'],
    },
    comment: {
      type: String,
      default: '',
      trim: true,
    },
  },
  submittedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Feedback', feedbackSchema);
