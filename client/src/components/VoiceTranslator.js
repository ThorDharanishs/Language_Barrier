import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const VoiceTranslator = () => {
  const { currentLanguage, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Start with English
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognition.onresult = async (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setIsTranslating(true);
          try {
            const response = await axios.post('/api/translate', {
              text: finalTranscript,
              targetLang: currentLanguage
            });
            setTranslatedText(response.data.translated_text);
          } catch (error) {
            setError('Translation failed. Please try again.');
          } finally {
            setIsTranslating(false);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Speech recognition failed. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    } else {
      setError('Speech recognition is not supported in this browser.');
    }
  }, [currentLanguage]);

  const startListening = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const speakTranslated = () => {
    if ('speechSynthesis' in window && translatedText) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(translatedText);
      
      const languageMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'ta': 'ta-IN'
      };
      
      utterance.lang = languageMap[currentLanguage] || 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        🎤 Voice Translator
      </h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={startListening}
          disabled={isListening || isTranslating}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? 'Listening...' : 'Start Voice Translation'}
        </button>

        {isTranslating && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Translating...</span>
            </div>
          </div>
        )}

        {translatedText && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Translated Text:</h4>
              <button
                onClick={speakTranslated}
                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                title="Speak translation"
              >
                🔊
              </button>
            </div>
            <p className="text-gray-700">{translatedText}</p>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>• Speak in English and get instant translation</p>
          <p>• Perfect for medical consultations</p>
          <p>• Works with {currentLanguage === 'en' ? 'English' : currentLanguage === 'hi' ? 'Hindi' : 'Tamil'}</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceTranslator;




