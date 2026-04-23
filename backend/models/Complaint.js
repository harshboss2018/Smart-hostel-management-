const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Maintenance', 'Plumbing', 'Electrical', 'WiFi', 'Cleanliness', 'Other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Emergency'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  expectedResolutionDate: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  resolutionTimeMinutes: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-calculate SLA based on priority before saving new docs
complaintSchema.pre('save', async function() {
  if (this.isNew && !this.expectedResolutionDate) {
    const hoursMap = { 'Emergency': 4, 'High': 24, 'Medium': 48, 'Low': 96 };
    const hoursToAdd = hoursMap[this.priority] || 48;
    const baseDate = this.createdAt || new Date();
    
    this.expectedResolutionDate = new Date(baseDate.getTime() + (hoursToAdd * 60 * 60 * 1000));
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
