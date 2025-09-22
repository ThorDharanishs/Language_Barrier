const mongoose = require('mongoose');

const doctorTipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'emergency', 'medication', 'nutrition', 'exercise', 'mental_health', 'pediatrics', 'geriatrics', 'women_health', 'men_health'],
    default: 'general'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  doctorSpecialization: {
    type: String,
    required: true
  },
  doctorExperience: {
    type: Number,
    required: true,
    min: 0
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for now, can be changed to require admin approval
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
doctorTipSchema.index({ category: 1, createdAt: -1 });
doctorTipSchema.index({ doctorId: 1, createdAt: -1 });
doctorTipSchema.index({ isApproved: 1, createdAt: -1 });

// Virtual for formatted date
doctorTipSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Ensure virtual fields are serialized
doctorTipSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('DoctorTip', doctorTipSchema);

