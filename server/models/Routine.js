const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
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
  description: {
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
    enum: ['daily', 'weekly', 'twice-weekly', 'monthly'],
    default: 'daily'
  },
  category: {
    type: String,
    enum: ['exercise', 'medication', 'diet', 'sleep', 'hygiene', 'therapy', 'other'],
    default: 'other'
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  reminders: [{
    time: String,
    isEnabled: {
      type: Boolean,
      default: true
    }
  }],
  completionHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: true
    },
    notes: String,
    duration: Number // actual duration in minutes
  }],
  goals: {
    targetDays: Number,
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
routineSchema.index({ userId: 1, isActive: 1, createdAt: -1 });
routineSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Routine', routineSchema);




