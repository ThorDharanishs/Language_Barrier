import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const Translate = () => {
  const { isAuthenticated } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('hi');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [languages, setLanguages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [interimText, setInterimText] = useState('');
  const [detectedMedicalTerms, setDetectedMedicalTerms] = useState([]);
  const [speechLanguage, setSpeechLanguage] = useState('en');
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  useEffect(() => {
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true; // Enable interim results for better UX
      
      // Set language based on speech language selection
      const languageMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'fr': 'fr-FR',
        'es': 'es-ES',
        'de': 'de-DE'
      };
      recognition.lang = languageMap[speechLanguage] || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update interim text for real-time display
        setInterimText(interimTranscript);

        // Update main text with final results
        if (finalTranscript) {
          const newText = text + finalTranscript;
          setText(newText);
          setInterimText(''); // Clear interim text when we have final results
          
          // Auto-translate after speech recognition if user is authenticated
          if (isAuthenticated && newText.trim()) {
            setTimeout(() => {
              handleTranslate();
            }, 500); // Small delay to ensure text is updated
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition error. ';
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'No speech was detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage += 'No microphone was found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage += 'Permission to use microphone was denied.';
            break;
          case 'network':
            errorMessage += 'Network error occurred. Please check your connection.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }
        setError(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText(''); // Clear interim text when recognition ends
      };

      setRecognition(recognition);
    } else {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    // Load supported languages
    loadLanguages();
    
    // Test Gradio service on component load
    testGradioService();
  }, [speechLanguage]); // Re-initialize when speech language changes


  const loadLanguages = async () => {
    setLanguagesLoading(true);
    try {
      const response = await axios.get('/api/translate/languages');
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Error loading languages:', error);
      // Fallback languages if API fails
      const fallbackLanguages = [
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
      setLanguages(fallbackLanguages);
    } finally {
      setLanguagesLoading(false);
    }
  };

  const handleTranslate = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!text.trim()) {
      setError('Please enter text to translate');
      return;
    }

    if (!isAuthenticated) {
      setError('Please log in to use translation features');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setDetectedMedicalTerms([]);

    try {
      const response = await axios.post('/api/translate', {
        text: text.trim(),
        targetLang: targetLang
      });

      setResult(response.data);
      
      // Use medical terms from backend response
      setDetectedMedicalTerms(response.data.medicalTerms || []);
      
      // Save to history with medical terms (already done on backend)
      try {
        await axios.post('/api/history', {
          originalText: text.trim(),
          detectedLanguage: response.data.detected_language || 'en',
          translatedText: response.data.translated_text,
          targetLanguage: targetLang,
          medicalTerms: response.data.medicalTerms || []
        });
      } catch (historyError) {
        console.error('Error saving to history:', historyError);
        // Don't show error to user as this is not critical
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleTranslate(e);
    }
  };

  const handleSpeak = async (text) => {
    if (!text || text.trim() === '') {
      setError('No text to speak');
      return;
    }

    setIsSpeaking(true);
    setError('');

    try {
      console.log('Sending TTS request with text:', text);
      console.log('Request URL:', 'https://8f97eca83217e20fe9.gradio.live/api/predict');
      
      // Call external TTS service - Use correct Gradio API format
      const response = await axios.post('https://8f97eca83217e20fe9.gradio.live/api/predict', {
        data: [text] // Only text input, language is auto-detected
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('TTS API response:', response.data);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response contains audio data
      if (response.data && response.data.data) {
        const audioData = response.data.data;
        console.log('Audio data received:', audioData);
        
        // Create audio element and play
        const audio = new Audio();
        setCurrentAudio(audio);
        
        // Handle Gradio audio response - it returns a file path or URL
        if (typeof audioData === 'string') {
          // If it's a file path, construct the full URL
          if (audioData.includes('output.mp3') || audioData.includes('.mp3')) {
            // Construct the full URL to the audio file
            audio.src = `https://8f97eca83217e20fe9.gradio.live/file=${audioData}`;
          } else if (audioData.startsWith('data:audio')) {
            audio.src = audioData;
          } else if (audioData.startsWith('http')) {
            audio.src = audioData;
          } else {
            // Try as direct file path
            audio.src = `https://8f97eca83217e20fe9.gradio.live/file=${audioData}`;
          }
        } else if (audioData instanceof Blob) {
          audio.src = URL.createObjectURL(audioData);
        }

        // Set up audio event handlers
        audio.onloadstart = () => {
          console.log('Audio loading started');
        };

        audio.oncanplay = () => {
          console.log('Audio can play');
        };

        audio.onplay = () => {
          console.log('Audio started playing');
        };

        audio.onended = () => {
          console.log('Audio finished playing');
          setIsSpeaking(false);
          setCurrentAudio(null);
        };

        audio.onerror = (event) => {
          console.error('Audio playback error:', event);
          setError('Failed to play audio. Please try again.');
          setIsSpeaking(false);
          setCurrentAudio(null);
        };

        // Play the audio
        try {
          await audio.play();
        } catch (playError) {
          console.error('Error playing audio:', playError);
          setError('Failed to play audio. Please check your browser audio settings.');
          setIsSpeaking(false);
          setCurrentAudio(null);
        }

      } else {
        console.log('No audio data in expected format, checking alternative formats...');
        console.log('Full response data:', response.data);
        
        // Try alternative response formats
        if (response.data && typeof response.data === 'string') {
          // Direct audio file path
          const audio = new Audio();
          setCurrentAudio(audio);
          audio.src = `https://8f97eca83217e20fe9.gradio.live/file=${response.data}`;
          
          // Set up event handlers
          audio.onended = () => {
            setIsSpeaking(false);
            setCurrentAudio(null);
          };
          audio.onerror = () => {
            setError('Failed to load audio file');
            setIsSpeaking(false);
            setCurrentAudio(null);
          };
          
          try {
            await audio.play();
          } catch (playError) {
            console.error('Error playing audio:', playError);
            setError('Failed to play audio');
            setIsSpeaking(false);
            setCurrentAudio(null);
          }
        } else {
          throw new Error('No audio data received from TTS service');
        }
      }

    } catch (error) {
      console.error('TTS API error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.code === 'ECONNABORTED') {
        setError('TTS service timeout. Please try again.');
      } else if (error.response) {
        if (error.response.status === 404) {
          setError('TTS service endpoint not found. Please check if the service is running.');
        } else if (error.response.status === 500) {
          setError('TTS service internal error. Please try again later.');
        } else {
          setError(`TTS service error: ${error.response.status}. Please try again.`);
        }
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Failed to generate speech. Please try again.');
      }
      
      setIsSpeaking(false);
      setCurrentAudio(null);
    }
  };

  const handleStopSpeech = () => {
    // Stop the current audio if it exists
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    // Also stop any other audio elements on the page
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    setIsSpeaking(false);
  };

  // Test function to check Gradio service
  const testGradioService = async () => {
    console.log('Testing Gradio service...');
    try {
      // Test if the service is accessible
      const testResponse = await axios.get('https://8f97eca83217e20fe9.gradio.live/', {
        timeout: 10000
      });
      console.log('Gradio service is accessible:', testResponse.status);
      return true;
    } catch (error) {
      console.error('Gradio service test failed:', error);
      return false;
    }
  };

  const handleVoiceInput = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        // Clear any previous errors
        setError('');
        // Start fresh with empty text or append to existing
        if (!text.trim()) {
          setText('');
        }
        recognition.start();
      }
    } else {
      setError('Speech recognition is not available. Please use a supported browser.');
    }
  };

  const clearText = () => {
    setText('');
    setInterimText('');
    setError('');
    setDetectedMedicalTerms([]);
    setResult(null);
  };


  const highlightMedicalTerms = (text) => {
    if (!text || !detectedMedicalTerms || detectedMedicalTerms.length === 0) return text;
    
    let highlightedText = text;
    
    // Highlight detected medical terms in the text
    detectedMedicalTerms.forEach(termData => {
      // Handle different data structures from API
      const term = termData.originalTerm || termData.medical_term || termData.term || termData.translatedTerm;
      if (term) {
        const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, `<span class="medical-term bg-yellow-200 px-1 rounded cursor-pointer hover:bg-yellow-300 transition-colors" data-term="${term}">${term}</span>`);
      }
    });
    
    return highlightedText;
  };

  const handleTermClick = (termData) => {
    if (typeof termData === 'string') {
      // Handle click from highlighted text
      const foundTerm = detectedMedicalTerms.find(term => {
        const originalTerm = term.originalTerm || term.medical_term || term.term || term.translatedTerm;
        return originalTerm === termData;
      });
      if (foundTerm) {
        setSelectedTerm({ 
          term: foundTerm.translatedTerm || foundTerm.medical_term || foundTerm.term, 
          definition: foundTerm.translatedDefinition || foundTerm.description || foundTerm.definition,
          originalTerm: foundTerm.originalTerm || foundTerm.medical_term || foundTerm.term,
          originalDefinition: foundTerm.originalDefinition || foundTerm.description || foundTerm.definition
        });
      }
    } else {
      // Handle click from medical terms list
      setSelectedTerm({ 
        term: termData.translatedTerm || termData.medical_term || termData.term, 
        definition: termData.translatedDefinition || termData.description || termData.definition,
        originalTerm: termData.originalTerm || termData.medical_term || termData.term,
        originalDefinition: termData.originalDefinition || termData.description || termData.definition
      });
    }
  };

  const closeTermPopup = () => {
    setSelectedTerm(null);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('translate.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('translate.subtitle')}
          </p>
        </div>

        <form onSubmit={handleTranslate} className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl p-8 border border-blue-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{t('translate.input_text')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('translate.input_text')}
                </label>
                <div className="relative">
                  <div className="relative">
                    <textarea
                      value={text + interimText}
                      onChange={(e) => setText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter medical text or conversation to translate... (Ctrl+Enter to translate)"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 ${
                        isListening 
                          ? 'border-red-400 bg-red-50 ring-2 ring-red-200' 
                          : 'border-gray-300'
                      }`}
                      rows={6}
                    />
                    {interimText && (
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                        <span className="animate-pulse">🎤</span> Speaking...
                      </div>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex space-x-2">
                    {text && (
                      <button
                        type="button"
                        onClick={clearText}
                        className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        title="Clear text"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={!recognition}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                    >
                      {isListening ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 6h12v12H6z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {isListening && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-sm text-red-600 font-medium">Listening... Speak now</p>
                  </div>
                )}
                {!recognition && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Voice input not supported. Please use Chrome, Edge, or Safari.
                  </p>
                )}
                
                {/* Speech Language Selector */}
                {recognition && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-800">Speech Input Language:</span>
                      </div>
                      <select
                        value={speechLanguage}
                        onChange={(e) => setSpeechLanguage(e.target.value)}
                        className="px-3 py-1 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="en">🇺🇸 English</option>
                        <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                        <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
                        <option value="fr">🇫🇷 Français (French)</option>
                        <option value="es">🇪🇸 Español (Spanish)</option>
                        <option value="de">🇩🇪 Deutsch (German)</option>
                      </select>
                    </div>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Voice Input Instructions:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Select your speaking language above</li>
                        <li>Click the microphone button to start speaking</li>
                        <li>Speak clearly and at a normal pace</li>
                        <li>Medical terms will be automatically detected and highlighted</li>
                        <li>Translation will start automatically after you finish speaking</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('translate.target_language')}
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  disabled={languagesLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {languagesLoading ? (
                    <option value="">Loading languages...</option>
                  ) : languages.length > 0 ? (
                    languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="ta">Tamil</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                    </>
                  )}
                </select>
                {languagesLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading supported languages...</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Translating...
                  </div>
                ) : (
                  t('common.translate')
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-xl p-8 border border-green-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{t('translate.title')} Result</h2>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('translate.title')} Text
                  </label>
                  <div 
                    className="px-4 py-3 bg-gray-50 rounded-lg min-h-[120px] border"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMedicalTerms(result.translated_text) 
                    }}
                    onClick={(e) => {
                      if (e.target.classList.contains('medical-term')) {
                        handleTermClick(e.target.dataset.term);
                      }
                    }}
                  />
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={isSpeaking ? handleStopSpeech : () => handleSpeak(result.translated_text)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isSpeaking 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h12v12H6z"/>
                          </svg>
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                          <span>{t('common.speak')}</span>
                        </>
                      )}
                    </button>
                    
                    {isSpeaking && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <div className="flex space-x-1">
                          <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm">Speaking...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Terms Explanation Section */}
                {detectedMedicalTerms && Array.isArray(detectedMedicalTerms) && detectedMedicalTerms.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Medical Terms Found in Translation ({languages.find(lang => lang.code === targetLang)?.name || targetLang})
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-4">
                        The following medical terms were detected in your translation. Click on any term to see a detailed explanation.
                      </p>
                      
                      {/* Medical Terms Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {detectedMedicalTerms.map((medicalTerm, index) => {
                          // Handle different data structures from API
                          const term = medicalTerm.translatedTerm || medicalTerm.medical_term || medicalTerm.term || 'Unknown Term';
                          const definition = medicalTerm.translatedDefinition || medicalTerm.description || medicalTerm.definition || 'No definition available';
                          const originalTerm = medicalTerm.originalTerm || medicalTerm.medical_term || term;
                          
                          return (
                            <div
                              key={index}
                              className="relative group"
                            >
                              <button
                                onClick={() => handleTermClick(medicalTerm)}
                                className="w-full text-left bg-white text-blue-700 px-3 py-2 rounded-lg border border-blue-300 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200"
                              >
                                <div className="font-medium text-sm group-hover:text-blue-800">
                                  {term}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 italic">
                                  ({originalTerm})
                                </div>
                                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {definition.length > 100 ? `${definition.substring(0, 100)}...` : definition}
                                </div>
                              </button>
                              
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full left-0 mb-2 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-lg">
                                <div className="font-medium mb-1">{term}</div>
                                <div className="text-gray-300 leading-relaxed">
                                  {definition}
                                </div>
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Quick Access Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {detectedMedicalTerms.map((medicalTerm, index) => {
                          const term = medicalTerm.translatedTerm || medicalTerm.medical_term || medicalTerm.term || 'Unknown Term';
                          return (
                            <button
                              key={index}
                              onClick={() => handleTermClick(medicalTerm)}
                              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors duration-200"
                            >
                              {term}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}


                {/* No Medical Terms Message */}
                {result && detectedMedicalTerms && detectedMedicalTerms.length === 0 && (
                  <div className="mt-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-green-800">
                          No medical terms detected in this translation. The text appears to be in simple language.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!result && !loading && (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Enter text and click translate to see results here</p>
              </div>
            )}
          </div>
        </form>

        {/* Medical Terms Popup */}
        {selectedTerm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedTerm.term}
                  </h3>
                  {selectedTerm.originalTerm && selectedTerm.originalTerm !== selectedTerm.term && (
                    <p className="text-sm text-gray-500 italic">
                      Original: {selectedTerm.originalTerm}
                    </p>
                  )}
                </div>
                <button
                  onClick={closeTermPopup}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Explanation:</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedTerm.definition}
                  </p>
                </div>
                
                {selectedTerm.originalDefinition && selectedTerm.originalDefinition !== selectedTerm.definition && (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Original Definition:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      {selectedTerm.originalDefinition}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Translate;
