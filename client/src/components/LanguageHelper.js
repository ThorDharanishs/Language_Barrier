import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageHelper = () => {
  const { currentLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('pronunciation');

  const features = [
    {
      id: 'pronunciation',
      title: 'Medical Term Pronunciation',
      description: 'Learn how to pronounce medical terms correctly',
      icon: '🔊'
    },
    {
      id: 'translation',
      title: 'Quick Translation',
      description: 'Translate medical terms instantly',
      icon: '🌐'
    },
    {
      id: 'learning',
      title: 'Language Learning',
      description: 'Learn medical terms in different languages',
      icon: '📚'
    },
    {
      id: 'emergency',
      title: 'Emergency Phrases',
      description: 'Essential medical phrases for emergencies',
      icon: '🚨'
    }
  ];

  const emergencyPhrases = {
    en: [
      { phrase: "I need help", translation: "मुझे मदद चाहिए / எனக்கு உதவி வேண்டும்" },
      { phrase: "Call an ambulance", translation: "एम्बुलेंस बुलाएं / ஆம்புலன்ஸ் அழைக்கவும்" },
      { phrase: "I have chest pain", translation: "मुझे छाती में दर्द है / எனக்கு மார்பில் வலி" },
      { phrase: "I can't breathe", translation: "मैं सांस नहीं ले सकता / எனக்கு மூச்சு வரவில்லை" },
      { phrase: "Where is the hospital?", translation: "अस्पताल कहाँ है? / மருத்துவமனை எங்கே?" }
    ],
    hi: [
      { phrase: "मुझे मदद चाहिए", translation: "I need help / எனக்கு உதவி வேண்டும்" },
      { phrase: "एम्बुलेंस बुलाएं", translation: "Call an ambulance / ஆம்புலன்ஸ் அழைக்கவும்" },
      { phrase: "मुझे छाती में दर्द है", translation: "I have chest pain / எனக்கு மார்பில் வलி" },
      { phrase: "मैं सांस नहीं ले सकता", translation: "I can't breathe / எனக்கு மூச்சு வரவில்லை" },
      { phrase: "अस्पताल कहाँ है?", translation: "Where is the hospital? / மருத்துவமனை எங்கே?" }
    ],
    ta: [
      { phrase: "எனக்கு உதவி வேண்டும்", translation: "I need help / मुझे मदद चाहिए" },
      { phrase: "ஆம்புலன்ஸ் அழைக்கவும்", translation: "Call an ambulance / एम्बुलेंस बुलाएं" },
      { phrase: "எனக்கு மார்பில் வலி", translation: "I have chest pain / मुझे छाती में दर्द है" },
      { phrase: "எனக்கு மூச்சு வரவில்லை", translation: "I can't breathe / मैं सांस नहीं ले सकता" },
      { phrase: "மருத்துவமனை எங்கே?", translation: "Where is the hospital? / अस्पताल कहाँ है?" }
    ]
  };

  const medicalTerms = {
    en: [
      { term: "Fever", pronunciation: "FEE-ver", translation: "बुखार / காய்ச்சல்" },
      { term: "Headache", pronunciation: "HED-ayk", translation: "सिरदर्द / தலைவலி" },
      { term: "Cough", pronunciation: "Kawf", translation: "खांसी / இருமல்" },
      { term: "Stomach", pronunciation: "STUH-muhk", translation: "पेट / வயிறு" },
      { term: "Medicine", pronunciation: "MED-uh-sin", translation: "दवा / மருந்து" }
    ],
    hi: [
      { term: "बुखार", pronunciation: "buk-HAAR", translation: "Fever / காய்ச்சல்" },
      { term: "सिरदर्द", pronunciation: "sir-DARD", translation: "Headache / தலைவலி" },
      { term: "खांसी", pronunciation: "khaan-SEE", translation: "Cough / இருமல்" },
      { term: "पेट", pronunciation: "PET", translation: "Stomach / வயிறு" },
      { term: "दवा", pronunciation: "da-VAA", translation: "Medicine / மருந்து" }
    ],
    ta: [
      { term: "காய்ச்சல்", pronunciation: "kaay-chal", translation: "Fever / बुखार" },
      { term: "தலைவலி", pronunciation: "thalai-vali", translation: "Headache / सिरदर्द" },
      { term: "இருமல்", pronunciation: "irumal", translation: "Cough / खांसी" },
      { term: "வயிறு", pronunciation: "vayiru", translation: "Stomach / पेट" },
      { term: "மருந்து", pronunciation: "marunthu", translation: "Medicine / दवा" }
    ]
  };

  const speakText = (text, language = currentLanguage) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const languageMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'ta': 'ta-IN'
      };
      
      utterance.lang = languageMap[language] || 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      speechSynthesis.speak(utterance);
    }
  };

  const renderContent = () => {
    switch (selectedFeature) {
      case 'pronunciation':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Terms Pronunciation</h3>
            <div className="grid gap-3">
              {medicalTerms[currentLanguage]?.map((item, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">{item.term}</h4>
                      <p className="text-sm text-blue-700">{item.pronunciation}</p>
                      <p className="text-xs text-blue-600 mt-1">{item.translation}</p>
                    </div>
                    <button
                      onClick={() => speakText(item.term, currentLanguage)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      🔊
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Phrases</h3>
            <div className="grid gap-3">
              {emergencyPhrases[currentLanguage]?.map((item, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">{item.phrase}</h4>
                      <p className="text-sm text-red-700">{item.translation}</p>
                    </div>
                    <button
                      onClick={() => speakText(item.phrase, currentLanguage)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      🔊
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'learning':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Learning</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Quick Learning Tips:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Practice pronunciation daily</li>
                <li>• Use medical terms in context</li>
                <li>• Listen to native speakers</li>
                <li>• Practice with emergency phrases</li>
                <li>• Use the chatbot to practice conversations</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="Language Helper"
      >
        🌐
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Language Helper</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex space-x-2 mb-6">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setSelectedFeature(feature.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFeature === feature.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {feature.icon} {feature.title}
              </button>
            ))}
          </div>
          
          <div className="overflow-y-auto max-h-96">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageHelper;




