import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  visitedAt: {
    type: Date,
    default: Date.now,
  },
  fingerprint: {
    type: String,
    required: true,
    unique: true,
  }
});

// Create a compound index for better performance
VisitorSchema.index({ fingerprint: 1 });

export default mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);