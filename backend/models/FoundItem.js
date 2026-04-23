const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema(
  {
    uniqueId: { type: String, required: true, unique: true, index: true },
    itemName: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    dateLostOrFound: { type: Date, required: true, index: true },
    location: { type: String, required: true, index: true },
    imageUrl: { type: String, default: '' },
    imageName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['REPORTED', 'MATCH_LINKED', 'HANDED_OVER', 'CLOSED'],
      default: 'REPORTED',
      index: true,
    },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reporterRole: { type: String, enum: ['student', 'warden', 'admin'], required: true },
    linkedMatchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
  },
  { timestamps: true },
);

foundItemSchema.index({ category: 1, location: 1, dateLostOrFound: -1 });

module.exports = mongoose.model('FoundItem', foundItemSchema);
