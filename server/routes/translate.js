const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const TranslationHistory = require('../models/TranslationHistory');

const router = express.Router();

// @route   POST /api/translate
// @desc    Translate text using external API
// @access  Private
router.post('/', [
  auth,
  body('text')
    .notEmpty()
    .withMessage('Text to translate is required')
    .isLength({ max: 1000 })
    .withMessage('Text must be less than 1000 characters'),
  body('targetLang')
    .notEmpty()
    .withMessage('Target language is required')
    .isIn(['en', 'hi', 'ta', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'])
    .withMessage('Invalid target language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, targetLang } = req.body;

    // Call external translation API
    const translationResponse = await axios.post(
      process.env.TRANSLATION_API_URL || 'https://74305a8511de.ngrok-free.app/translate',
      {
        text: text,
        target_lang: targetLang
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        timeout: 10000
      }
    );

    const { detected_language, translated_text } = translationResponse.data;

    // Detect medical terms in the translated text
    let medicalTerms = [];
    
    // Clean the text - remove punctuation and extra characters, keep only words
    const cleanedText = translated_text
      .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
      .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
      .trim();                   // Remove leading/trailing spaces
    
    try {
      
      console.log('Calling medical terms API with cleaned text:', cleanedText);
      const medicalTermsResponse = await axios.post(
        'https://9af9f4327d36.ngrok-free.app/find_terms',
        {
          sentence: cleanedText
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          timeout: 5000
        }
      );
      
      console.log('Medical terms API response:', medicalTermsResponse.data);

      if (medicalTermsResponse.data && medicalTermsResponse.data.matches) {
        // Map language codes to match our target language
        const languageMap = {
          'hi': 'hindi',
          'ta': 'tamil', 
          'fr': 'french',
          'es': 'spanish',
          'de': 'german',
          'ko': 'korean',
          'ja': 'japanese',
          'ru': 'russian',
          'it': 'italian',
          'en': 'english'
        };
        
        const targetLanguageName = languageMap[targetLang] || 'english';
        
        // Group matches by medical term and find the best match for target language
        const termGroups = {};
        medicalTermsResponse.data.matches.forEach(match => {
          if (!termGroups[match.medical_term]) {
            termGroups[match.medical_term] = [];
          }
          termGroups[match.medical_term].push(match);
        });
        
        // For each unique medical term, find the best description in target language
        const termKeys = Object.keys(termGroups);
        
        for (const term of termKeys) {
          const matches = termGroups[term];
          
          // Try to find exact language match first
          let bestMatch = matches.find(match => 
            match.language.toLowerCase() === targetLanguageName.toLowerCase()
          );
          
          // If no exact match, try to find English as fallback
          if (!bestMatch) {
            bestMatch = matches.find(match => 
              match.language.toLowerCase() === 'english'
            );
          }
          
          // If still no match, use the first available match
          if (!bestMatch) {
            bestMatch = matches[0];
          }
          
          medicalTerms.push({
            originalTerm: term,
            translatedTerm: term, // Will be translated on frontend if needed
            originalDefinition: bestMatch.description,
            translatedDefinition: bestMatch.description,
            normalizedTerm: term.toLowerCase().replace(/[^\w\s]/g, '').trim()
          });
        }
      }
    } catch (medicalError) {
      console.error('Medical terms detection error:', medicalError);
      console.error('Error details:', medicalError.response?.data || medicalError.message);
      
      // Fallback: Create mock medical terms based on common medical words in the text
      const commonMedicalTerms = {
        'fever': {
          description: 'Elevated body temperature often due to infection or illness',
          language: 'english',
          medical_term: 'fever'
        },
        'sick': {
          description: 'Feeling unwell or suffering from illness',
          language: 'english',
          medical_term: 'sick'
        },
        'allergy': {
          description: 'Immune system reaction to foreign substances like pollen or food',
          language: 'english',
          medical_term: 'allergy'
        },
        'headache': {
          description: 'Pain in the head or neck area',
          language: 'english', 
          medical_term: 'headache'
        },
        'cough': {
          description: 'A reflex action to clear the throat and breathing passages',
          language: 'english',
          medical_term: 'cough'
        },
        'cold': {
          description: 'A mild viral infection of the nose and throat',
          language: 'english',
          medical_term: 'cold'
        },
        'pain': {
          description: 'An unpleasant physical sensation',
          language: 'english',
          medical_term: 'pain'
        },
        'asthma': {
          description: 'A respiratory condition marked by spasms in the lungs',
          language: 'english',
          medical_term: 'asthma'
        },
        'diabetes': {
          description: 'A metabolic disorder affecting blood sugar levels',
          language: 'english',
          medical_term: 'diabetes'
        },
        'hypertension': {
          description: 'High blood pressure condition',
          language: 'english',
          medical_term: 'hypertension'
        },
        'infection': {
          description: 'Invasion of the body by harmful microorganisms',
          language: 'english',
          medical_term: 'infection'
        },
        'inflammation': {
          description: 'Body response to injury or infection causing swelling',
          language: 'english',
          medical_term: 'inflammation'
        }
      };
      
      // Check for medical terms in the cleaned text
      const textWords = cleanedText.toLowerCase().split(/\s+/);
      const foundTerms = [];
      
      for (const [term, data] of Object.entries(commonMedicalTerms)) {
        if (textWords.includes(term.toLowerCase())) {
          foundTerms.push({
            originalTerm: term,
            translatedTerm: term,
            originalDefinition: data.description,
            translatedDefinition: data.description,
            normalizedTerm: term.toLowerCase()
          });
        }
      }
      
      if (foundTerms.length > 0) {
        medicalTerms = foundTerms;
        console.log('Using fallback medical terms:', medicalTerms);
      }
    }

    // Save translation to history with medical terms
    const translationHistory = new TranslationHistory({
      userId: req.user._id,
      originalText: text,
      detectedLanguage: detected_language,
      translatedText: translated_text,
      targetLanguage: targetLang,
      medicalTerms: medicalTerms
    });

    await translationHistory.save();

    res.json({
      detected_language,
      translated_text,
      medicalTerms: medicalTerms,
      success: true
    });

  } catch (error) {
    console.error('Translation error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        message: 'Translation service timeout. Please try again.' 
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({
        message: 'Translation service error',
        details: error.response.data
      });
    }

    res.status(500).json({ 
      message: 'Server error during translation' 
    });
  }
});

// @route   GET /api/translate/languages
// @desc    Get supported languages
// @access  Public
router.get('/languages', (req, res) => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  res.json({ languages });
});

module.exports = router;




