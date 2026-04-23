const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: String,
  rollNo: String,
  reason: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['Home Visit', 'Medical', 'Academic', 'Other'],
    default: 'Home Visit'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  wardenRemarks: String,
  approvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Leave', leaveSchema);
