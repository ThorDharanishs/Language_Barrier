const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'twice-daily', 'weekly', 'as-needed'],
    default: 'daily'
  },
  instructions: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reminders: [{
    time: String,
    isEnabled: {
      type: Boolean,
      default: true
    }
  }],
  sideEffects: [{
    description: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    reportedDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
medicineSchema.index({ userId: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Medicine', medicineSchema);




