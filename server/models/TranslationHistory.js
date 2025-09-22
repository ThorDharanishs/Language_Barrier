const mongoose = require('mongoose');

const translationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalText: {
    type: String,
    required: true,
    trim: true
  },
  detectedLanguage: {
    type: String,
    required: true
  },
  translatedText: {
    type: String,
    required: true,
    trim: true
  },
  targetLanguage: {
    type: String,
    required: true
  },
  medicalTerms: [{
    originalTerm: {
      type: String,
      required: true
    },
    translatedTerm: {
      type: String,
      required: true
    },
    originalDefinition: {
      type: String,
      required: true
    },
    translatedDefinition: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
translationHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TranslationHistory', translationHistorySchema);




