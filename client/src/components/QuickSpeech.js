import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const QuickSpeech = ({ isOpen, onClose }) => {
  const { currentLanguage, t } = useLanguage();
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');

  const speakText = (text) => {
    if (!text.trim()) {
      setError('Please enter text to pronounce');
      return;
    }

    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();
      setIsSpeaking(true);
      setError('');

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Enhanced language mapping for better TTS
      const languageMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'fr': 'fr-FR',
        'es': 'es-ES',
        'de': 'de-DE',
        'ko': 'ko-KR',
        'ja': 'ja-JP',
        'ru': 'ru-RU',
        'it': 'it-IT',
        'pt': 'pt-BR',
        'ar': 'ar-SA',
        'zh': 'zh-CN'
      };
      
      utterance.lang = languageMap[currentLanguage] || 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to get a better voice for the language
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(currentLanguage) || 
        (currentLanguage === 'hi' && voice.lang.includes('hi')) ||
        (currentLanguage === 'ta' && voice.lang.includes('ta'))
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        setError('Speech synthesis failed. Please try again.');
        
        // Fallback to default voice if preferred voice fails
        if (preferredVoice) {
          utterance.voice = null;
          speechSynthesis.speak(utterance);
        }
      };
      
      speechSynthesis.speak(utterance);
    } else {
      setError('Speech synthesis is not supported in this browser');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const clearText = () => {
    setText('');
    setError('');
    stopSpeaking();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      speakText(text);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Quick Speech
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text to Pronounce
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter text to hear pronunciation..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => isSpeaking ? stopSpeaking() : speakText(text)}
            disabled={!text.trim()}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSpeaking 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSpeaking ? (
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Stop Speaking
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Speak Text
              </div>
            )}
          </button>
          <button
            onClick={clearText}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
          <strong>Tip:</strong> Press Enter to speak the text. Current language: {currentLanguage === 'hi' ? 'हिन्दी' : currentLanguage === 'ta' ? 'தமிழ்' : 'English'}
        </div>
      </div>
    </div>
  );
};

export default QuickSpeech;









