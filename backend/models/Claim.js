const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem', required: true, index: true },
    foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true, index: true },
    claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    claimantRole: { type: String, enum: ['student', 'warden', 'admin'], required: true },
    verificationAnswers: {
      uniqueIdentifiers: { type: String, required: true },
      contentsProof: { type: String, required: true },
      proofStatement: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewNotes: { type: String, default: '' },
    handoverSchedule: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

claimSchema.index({ claimantId: 1, status: 1 });

module.exports = mongoose.model('Claim', claimSchema);
