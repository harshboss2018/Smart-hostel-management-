const mongoose = require('mongoose');

const voiceSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: String,
  hostelName: String,
  type: {
    type: String,
    enum: ['post', 'poll', 'review', 'info'],
    default: 'post'
  },
  content: {
    type: String,
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isTrending: {
    type: Boolean,
    default: false
  },
  metadata: {
    options: [{
      label: String,
      votes: { type: Number, default: 0 }
    }],
    rating: Number
  },
  comments: [{
    authorName: String,
    role: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Voice', voiceSchema);
