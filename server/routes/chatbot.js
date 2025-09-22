const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mlService = require('../services/mlService');

// POST /api/chatbot/respond - Generate ML-based response
router.post('/respond', auth, async (req, res) => {
  try {
    const { message, preferredLanguage = 'en' } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    // Process user input using ML service
    const response = await mlService.processUserInput(message, preferredLanguage);
    
    res.json({
      success: true,
      response: response.text,
      condition: response.condition,
      language: response.language,
      detectedLanguage: response.detectedLanguage,
      confidence: response.confidence,
      medicalTerms: response.medicalTerms,
      hasFollowUp: response.hasFollowUp,
      timestamp: response.timestamp
    });
    
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process your request. Please try again.'
    });
  }
});

// POST /api/chatbot/detect-language - Detect language from text
router.post('/detect-language', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        error: 'Text is required' 
      });
    }

    const detectedLanguage = mlService.detectLanguage(text);
    
    res.json({
      success: true,
      detectedLanguage: detectedLanguage,
      confidence: 0.9
    });
    
  } catch (error) {
    console.error('Error detecting language:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to detect language. Please try again.'
    });
  }
});

// POST /api/chatbot/medical-terms - Get medical term explanations
router.post('/medical-terms', auth, async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        error: 'Text is required' 
      });
    }

    const medicalTerms = await mlService.getMedicalTermExplanation(text, language);
    
    res.json({
      success: true,
      medicalTerms: medicalTerms,
      language: language
    });
    
  } catch (error) {
    console.error('Error fetching medical terms:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch medical terms. Please try again.'
    });
  }
});

module.exports = router;





