import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const QuickTranslate = ({ isOpen, onClose }) => {
  const { currentLanguage, t } = useLanguage();
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/translate', {
        text: text.trim(),
        targetLang: currentLanguage
      });

      setTranslatedText(response.data.translated_text);
    } catch (error) {
      setError('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'ta' ? 'ta-IN' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const clearText = () => {
    setText('');
    setTranslatedText('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('common.translate')}
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
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text to translate..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Translating...' : t('common.translate')}
          </button>
          <button
            onClick={clearText}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            {t('common.clear')}
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {translatedText && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Translation:</span>
              <button
                onClick={() => speakText(translatedText)}
                className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                title="Speak translation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>
            <p className="text-gray-800">{translatedText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickTranslate;

