const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem', required: true, index: true },
    foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true, index: true },
    score: { type: Number, required: true, index: true },
    status: { type: String, default: 'Potential Match', index: true },
    breakdown: {
      category: { type: Number, default: 0 },
      keywords: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      date: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

matchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
