const express = require('express');
const TranslationHistory = require('../models/TranslationHistory');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/history
// @desc    Save a translation to history
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { originalText, detectedLanguage, translatedText, targetLanguage, medicalTerms } = req.body;

    const translationHistory = new TranslationHistory({
      userId: req.user._id,
      originalText,
      detectedLanguage,
      translatedText,
      targetLanguage,
      medicalTerms: medicalTerms || []
    });

    await translationHistory.save();

    res.json({ message: 'Translation saved to history', translation: translationHistory });
  } catch (error) {
    console.error('Save history error:', error);
    res.status(500).json({ message: 'Server error while saving translation' });
  }
});

// @route   GET /api/history
// @desc    Get user's translation history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const translations = await TranslationHistory
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await TranslationHistory.countDocuments({ userId: req.user._id });

    res.json({
      translations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error while fetching history' });
  }
});

// @route   DELETE /api/history/:id
// @desc    Delete a translation from history
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const translation = await TranslationHistory.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!translation) {
      return res.status(404).json({ message: 'Translation not found' });
    }

    await TranslationHistory.findByIdAndDelete(req.params.id);

    res.json({ message: 'Translation deleted successfully' });
  } catch (error) {
    console.error('Delete translation error:', error);
    res.status(500).json({ message: 'Server error while deleting translation' });
  }
});

// @route   DELETE /api/history
// @desc    Clear all user's translation history
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    await TranslationHistory.deleteMany({ userId: req.user._id });

    res.json({ message: 'All translations deleted successfully' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ message: 'Server error while clearing history' });
  }
});

module.exports = router;



