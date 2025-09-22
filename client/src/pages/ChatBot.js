import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const ChatBot = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [medicines, setMedicines] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: '', dosage: '', time: '', frequency: 'daily' });
  const [newRoutine, setNewRoutine] = useState({ name: '', time: '', description: '', frequency: 'daily' });
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [languages, setLanguages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showLanguageConfirm, setShowLanguageConfirm] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize with welcome message
    if (isAuthenticated) {
      const welcomeText = `Hello ${user?.username || 'there'}! I'm your personal medical assistant. I can help you with:\n\n• Medical doubts and questions\n• Medicine tracking and reminders\n• Health routine management\n• General health advice\n\nHow can I assist you today?`;
      setMessages([
        {
          id: 1,
          text: welcomeText,
          sender: 'bot',
          timestamp: new Date(),
          type: 'welcome'
        }
      ]);
    }
    
    // Load saved medicines and routines
    loadMedicines();
    loadRoutines();
    loadLanguages();
  }, [isAuthenticated, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMedicines = async () => {
    try {
      const response = await axios.get('/api/medicine');
      setMedicines(response.data.medicines || []);
    } catch (error) {
      console.error('Error loading medicines:', error);
      setMedicines([]);
    }
  };

  const loadRoutines = async () => {
    try {
      const response = await axios.get('/api/routine');
      setRoutines(response.data.routines || []);
    } catch (error) {
      console.error('Error loading routines:', error);
      setRoutines([]);
    }
  };

  const loadLanguages = async () => {
    try {
      const response = await axios.get('/api/translate/languages');
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Error loading languages:', error);
      // Fallback languages if API fails
      setLanguages([
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ta', name: 'Tamil' },
        { code: 'fr', name: 'French' },
        { code: 'es', name: 'Spanish' },
        { code: 'de', name: 'German' }
      ]);
    }
  };

  const translateText = async (text, targetLang) => {
    if (targetLang === 'en') return text;
    
    try {
      const response = await axios.post('/api/translate', {
        text: text,
        targetLang: targetLang
      });
      return response.data.translated_text || text;
    } catch (error) {
      console.error('Error translating text:', error);
      // Fallback to hardcoded translations for common responses
      return getFallbackTranslation(text, targetLang);
    }
  };

  // Fallback translations for common responses
  const getFallbackTranslation = (text, targetLang) => {
    const translations = {
      hi: {
        'Hello there! I\'m your personal medical assistant. I can help you with:': 'नमस्ते! मैं आपका व्यक्तिगत चिकित्सा सहायक हूं। मैं आपकी मदद कर सकता हूं:',
        'Medical doubts and questions': 'चिकित्सा संदेह और प्रश्न',
        'Medicine tracking and reminders': 'दवा ट्रैकिंग और अनुस्मारक',
        'Health routine management': 'स्वास्थ्य दिनचर्या प्रबंधन',
        'General health advice': 'सामान्य स्वास्थ्य सलाह',
        'How can I assist you today?': 'आज मैं आपकी कैसे मदद कर सकता हूं?',
        'Headaches can have various causes. Here are some general suggestions:': 'सिरदर्द के विभिन्न कारण हो सकते हैं। यहां कुछ सामान्य सुझाव हैं:',
        'Stay hydrated': 'हाइड्रेटेड रहें',
        'Get adequate rest': 'पर्याप्त आराम करें',
        'Avoid stress when possible': 'जब भी संभव हो तनाव से बचें',
        'Consider over-the-counter pain relief': 'ओवर-द-काउंटर दर्द निवारक पर विचार करें',
        'If headaches are severe, frequent, or accompanied by other symptoms, please consult a healthcare professional immediately.': 'यदि सिरदर्द गंभीर, बार-बार होता है, या अन्य लक्षणों के साथ है, तो कृपया तुरंत एक स्वास्थ्य पेशेवर से परामर्श करें।',
        'For fever management:': 'बुखार प्रबंधन के लिए:',
        'Rest and stay hydrated': 'आराम करें और हाइड्रेटेड रहें',
        'Use fever-reducing medications as directed': 'निर्देशानुसार बुखार कम करने वाली दवाओं का उपयोग करें',
        'Monitor temperature regularly': 'तापमान की नियमित निगरानी करें',
        'Keep cool with light clothing': 'हल्के कपड़े पहनकर ठंडा रहें',
        'If fever is high (>103°F/39.4°C), persistent, or accompanied by severe symptoms, seek medical attention.': 'यदि बुखार उच्च (>103°F/39.4°C), लगातार है, या गंभीर लक्षणों के साथ है, तो चिकित्सा सहायता लें।',
        'I apologize, but I encountered an error. Please try again.': 'मैं क्षमा चाहता हूं, लेकिन मुझे एक त्रुटि का सामना करना पड़ा। कृपया फिर से कोशिश करें।'
      },
      ta: {
        'Hello there! I\'m your personal medical assistant. I can help you with:': 'வணக்கம்! நான் உங்கள் தனிப்பட்ட மருத்துவ உதவியாளர். நான் உங்களுக்கு உதவ முடியும்:',
        'Medical doubts and questions': 'மருத்துவ சந்தேகங்கள் மற்றும் கேள்விகள்',
        'Medicine tracking and reminders': 'மருந்து கண்காணிப்பு மற்றும் நினைவூட்டல்கள்',
        'Health routine management': 'சுகாதார வழக்கத்தை நிர்வகித்தல்',
        'General health advice': 'பொது சுகாதார ஆலோசனை',
        'How can I assist you today?': 'இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
        'Headaches can have various causes. Here are some general suggestions:': 'தலைவலிக்கு பல்வேறு காரணங்கள் இருக்கலாம். இங்கே சில பொதுவான பரிந்துரைகள்:',
        'Stay hydrated': 'நீரேற்றம் பராமரிக்கவும்',
        'Get adequate rest': 'போதுமான ஓய்வு எடுத்துக்கொள்ளுங்கள்',
        'Avoid stress when possible': 'முடிந்தவரை மன அழுத்தத்தைத் தவிர்க்கவும்',
        'Consider over-the-counter pain relief': 'கவுண்டரில் கிடைக்கும் வலி நிவாரணி பற்றி சிந்தியுங்கள்',
        'If headaches are severe, frequent, or accompanied by other symptoms, please consult a healthcare professional immediately.': 'தலைவலி கடுமையானது, அடிக்கடி நிகழ்கிறது, அல்லது பிற அறிகுறிகளுடன் இருந்தால், உடனடியாக ஒரு சுகாதார நிபுணரைக் கலந்தாலோசியுங்கள்.',
        'For fever management:': 'காய்ச்சல் நிர்வாகத்திற்கு:',
        'Rest and stay hydrated': 'ஓய்வெடுத்து நீரேற்றம் பராமரிக்கவும்',
        'Use fever-reducing medications as directed': 'வழிகாட்டப்பட்டபடி காய்ச்சல் குறைக்கும் மருந்துகளைப் பயன்படுத்தவும்',
        'Monitor temperature regularly': 'வெப்பநிலையை தவறாமல் கண்காணிக்கவும்',
        'Keep cool with light clothing': 'இலகுவான ஆடைகளுடன் குளிர்ச்சியாக இருங்கள்',
        'If fever is high (>103°F/39.4°C), persistent, or accompanied by severe symptoms, seek medical attention.': 'காய்ச்சல் அதிகமாக (>103°F/39.4°C), தொடர்ச்சியாக இருந்தால், அல்லது கடுமையான அறிகுறிகளுடன் இருந்தால், மருத்துவ உதவியை நாடுங்கள்.',
        'I apologize, but I encountered an error. Please try again.': 'மன்னிக்கவும், ஆனால் எனக்கு ஒரு பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
      }
    };

    return translations[targetLang]?.[text] || text;
  };

  const detectLanguage = async (text) => {
    try {
      // Use the new ML service to detect language
      const response = await axios.post('/api/chatbot/detect-language', {
        text: text
      });
      return response.data.detectedLanguage || 'en';
    } catch (error) {
      console.error('Error detecting language:', error);
      // Enhanced fallback: better language detection
      return detectLanguageFallback(text);
    }
  };

  const detectLanguageFallback = (text) => {
    const lowerText = text.toLowerCase();
    
    // Tamil detection
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    if (/\b(தலைவலி|காய்ச்சல்|இருமல்|சளி|வயிறு|மருந்து|வழக்கம்|பழக்கம்|உதவி|ஆலோசனை|சுகாதாரம்|நோய்|வலி|உடல்|மருத்துவர்|நோயாளி)\b/.test(text)) return 'ta';
    
    // Hindi detection
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    if (/\b(सिरदर्द|बुखार|खांसी|जुकाम|पेट|दवा|दिनचर्या|आदत|मदद|सलाह|स्वास्थ्य|बीमारी|दर्द|शरीर|डॉक्टर|रोगी)\b/.test(text)) return 'hi';
    
    // Other languages
    if (/[àâäéèêëïîôùûüÿç]/.test(text)) return 'fr';
    if (/[ñáéíóúü]/.test(text)) return 'es';
    if (/[äöüß]/.test(text)) return 'de';
    
    return 'en'; // Default to English
  };

  // Efficient medical response generator
  const getMedicalResponse = async (condition, responseLanguage) => {
    const responses = {
      headache: 'Headaches can have various causes. Here are some general suggestions:\n\n• Stay hydrated\n• Get adequate rest\n• Avoid stress when possible\n• Consider over-the-counter pain relief\n\n⚠️ If headaches are severe, frequent, or accompanied by other symptoms, please consult a healthcare professional immediately.',
      fever: 'For fever management:\n\n• Rest and stay hydrated\n• Use fever-reducing medications as directed\n• Monitor temperature regularly\n• Keep cool with light clothing\n\n⚠️ If fever is high (>103°F/39.4°C), persistent, or accompanied by severe symptoms, seek medical attention.',
      cough: 'For cough and cold symptoms:\n\n• Stay hydrated with warm fluids\n• Use a humidifier\n• Get plenty of rest\n• Consider honey for cough relief\n• Use saline nasal sprays\n\n⚠️ If symptoms worsen or persist beyond 10 days, consult a doctor.',
      cold: 'For cough and cold symptoms:\n\n• Stay hydrated with warm fluids\n• Use a humidifier\n• Get plenty of rest\n• Consider honey for cough relief\n• Use saline nasal sprays\n\n⚠️ If symptoms worsen or persist beyond 10 days, consult a doctor.',
      stomach: 'For stomach issues:\n\n• Stay hydrated with small sips of water\n• Eat bland foods (BRAT diet: Bananas, Rice, Applesauce, Toast)\n• Avoid spicy, fatty, or acidic foods\n• Rest and avoid strenuous activity\n\n⚠️ If vomiting is severe, persistent, or contains blood, seek immediate medical attention.',
      help: 'I\'m here to help you with your health concerns. I can assist with:\n\n• Medical questions and advice\n• Medicine tracking\n• Health routine management\n• General wellness tips\n\nWhat specific help do you need?',
      health: 'Maintaining good health is important. Here are some general tips:\n\n• Eat a balanced diet\n• Exercise regularly\n• Get adequate sleep\n• Stay hydrated\n• Manage stress\n• Regular health checkups\n\nIs there a specific health concern you\'d like to discuss?',
      doctor: 'If you need to see a doctor, here are some tips:\n\n• Prepare your symptoms and questions\n• Bring your medical history\n• List current medications\n• Be honest about your concerns\n• Ask questions if you don\'t understand\n\nFor emergencies, contact emergency services immediately.',
      pain: 'Pain management depends on the type and severity. General suggestions:\n\n• Rest the affected area\n• Apply ice or heat as appropriate\n• Take over-the-counter pain relief as directed\n• Avoid activities that worsen pain\n\n⚠️ If pain is severe, sudden, or persistent, consult a healthcare professional.'
    };

    const responseText = await translateText(responses[condition] || responses.help, responseLanguage);
    return { text: responseText, type: 'medical_advice' };
  };

  const handleLanguageChange = async (newLanguage) => {
    setSelectedLanguage(newLanguage);
    
    // Update welcome message in the selected language
    if (messages.length > 0 && messages[0].type === 'welcome') {
      const welcomeText = `Hello ${user?.username || 'there'}! I'm your personal medical assistant. I can help you with:\n\n• Medical doubts and questions\n• Medicine tracking and reminders\n• Health routine management\n• General health advice\n\nHow can I assist you today?`;
      const translatedWelcome = await translateText(welcomeText, newLanguage);
      
      setMessages(prev => prev.map((msg, index) => 
        index === 0 ? { ...msg, text: translatedWelcome } : msg
      ));
    }
  };

  const speakText = (text, language = selectedLanguage) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language based on selection
      const languageMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'fr': 'fr-FR',
        'es': 'es-ES',
        'de': 'de-DE'
      };
      
      utterance.lang = languageMap[language] || 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const saveMedicines = async (medicinesList) => {
    setMedicines(medicinesList);
  };

  const saveRoutines = async (routinesList) => {
    setRoutines(routinesList);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Detect the language of the user's input
      const detectedLang = await detectLanguage(inputMessage);
      setDetectedLanguage(detectedLang);
      
      // Show language confirmation if detected language is different
      if (detectedLang !== selectedLanguage) {
        setShowLanguageConfirm(true);
        return; // Wait for user confirmation
      }

      // Generate bot response in the detected language
      const botResponse = await generateBotResponse(inputMessage, detectedLanguage);
      
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        type: botResponse.type || 'text',
        data: botResponse.data,
        medicalTerms: botResponse.medicalTerms,
        condition: botResponse.condition,
        confidence: botResponse.confidence
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorText = await translateText('I apologize, but I encountered an error. Please try again.', selectedLanguage);
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBotResponse = async (userInput, responseLanguage = selectedLanguage) => {
    try {
      // Use the new ML service for generating responses
      const response = await axios.post('/api/chatbot/respond', {
        message: userInput,
        preferredLanguage: responseLanguage
      });

      if (response.data.success) {
        return {
          text: response.data.response,
          type: response.data.condition === 'general' ? 'general' : 'medical_advice',
          condition: response.data.condition,
          language: response.data.language,
          confidence: response.data.confidence,
          medicalTerms: response.data.medicalTerms,
          hasFollowUp: response.data.hasFollowUp
        };
      }
    } catch (error) {
      console.error('Error calling ML service:', error);
    }

    // Fallback: Generate response in the detected language
    try {
      const fallbackResponse = await getMedicalResponse('general', responseLanguage);
      return fallbackResponse;
    } catch (error) {
      console.error('Error generating fallback response:', error);
    }

    // Fallback to local processing for medicine/routine tracking
    const input = userInput.toLowerCase();
    
    // Medicine tracking commands
    if (input.includes('add medicine') || input.includes('new medicine')) {
      const responseText = await translateText('I can help you add a new medicine to track. Please use the Medicine Tracker tab to add your medicine details.', responseLanguage);
      return {
        text: responseText,
        type: 'medicine_help'
      };
    }

    if (input.includes('medicine list') || input.includes('my medicines')) {
      if (medicines.length === 0) {
        const responseText = await translateText('You haven\'t added any medicines yet. Use the Medicine Tracker tab to add your medicines.', responseLanguage);
        return {
          text: responseText,
          type: 'medicine_list'
        };
      }
      
      const headerText = await translateText('Here are your tracked medicines:', responseLanguage);
      const dosageText = await translateText('Dosage:', responseLanguage);
      const timeText = await translateText('Time:', responseLanguage);
      const frequencyText = await translateText('Frequency:', responseLanguage);
      
      let medicineList = `${headerText}\n\n`;
      medicines.forEach((med, index) => {
        medicineList += `${index + 1}. ${med.name}\n   ${dosageText} ${med.dosage}\n   ${timeText} ${med.time}\n   ${frequencyText} ${med.frequency}\n\n`;
      });
      
      return {
        text: medicineList,
        type: 'medicine_list'
      };
    }

    // Routine tracking commands
    if (input.includes('add routine') || input.includes('new routine')) {
      const responseText = await translateText('I can help you add a new health routine. Please use the Routine Tracker tab to add your routine details.', responseLanguage);
      return {
        text: responseText,
        type: 'routine_help'
      };
    }

    if (input.includes('routine list') || input.includes('my routines')) {
      if (routines.length === 0) {
        const responseText = await translateText('You haven\'t added any routines yet. Use the Routine Tracker tab to add your health routines.', responseLanguage);
        return {
          text: responseText,
          type: 'routine_list'
        };
      }
      
      const headerText = await translateText('Here are your tracked routines:', responseLanguage);
      const timeText = await translateText('Time:', responseLanguage);
      const descriptionText = await translateText('Description:', responseLanguage);
      const frequencyText = await translateText('Frequency:', responseLanguage);
      
      let routineList = `${headerText}\n\n`;
      routines.forEach((routine, index) => {
        routineList += `${index + 1}. ${routine.name}\n   ${timeText} ${routine.time}\n   ${descriptionText} ${routine.description}\n   ${frequencyText} ${routine.frequency}\n\n`;
      });
      
      return {
        text: routineList,
        type: 'routine_list'
      };
    }

    // Fallback response
    const defaultText = await translateText('I understand you\'re asking about: "' + userInput + '"\n\nI can help you with:\n• Medical questions and health advice\n• Medicine tracking and reminders\n• Health routine management\n• General wellness tips\n\nFor specific medical concerns, please consult with a healthcare professional. How else can I assist you?', responseLanguage);
    return {
      text: defaultText,
      type: 'general'
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const confirmLanguageChange = async () => {
    setSelectedLanguage(detectedLanguage);
    setShowLanguageConfirm(false);
    
    // Continue with the message processing
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const botResponse = await generateBotResponse(inputMessage, detectedLanguage);
      
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        type: botResponse.type || 'text',
        data: botResponse.data,
        medicalTerms: botResponse.medicalTerms,
        condition: botResponse.condition,
        confidence: botResponse.confidence
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorText = await translateText('I apologize, but I encountered an error. Please try again.', selectedLanguage);
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelLanguageChange = () => {
    setShowLanguageConfirm(false);
    setInputMessage(''); // Clear the input
    setIsLoading(false);
  };

  const addMedicine = async () => {
    if (!newMedicine.name || !newMedicine.dosage || !newMedicine.time) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await axios.post('/api/medicine', newMedicine);
      const medicine = response.data.medicine;
      
      // Reload medicines from database
      await loadMedicines();
      setNewMedicine({ name: '', dosage: '', time: '', frequency: 'daily' });
      
      // Add confirmation message to chat
      const confirmationText = await translateText(`✅ Added medicine: ${medicine.name} (${medicine.dosage}) at ${medicine.time}`, selectedLanguage);
      const confirmationMessage = {
        id: Date.now(),
        text: confirmationText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'confirmation'
      };
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Failed to add medicine. Please try again.');
    }
  };

  const addRoutine = async () => {
    if (!newRoutine.name || !newRoutine.time || !newRoutine.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await axios.post('/api/routine', newRoutine);
      const routine = response.data.routine;
      
      // Reload routines from database
      await loadRoutines();
      setNewRoutine({ name: '', time: '', description: '', frequency: 'daily' });
      
      // Add confirmation message to chat
      const confirmationText = await translateText(`✅ Added routine: ${routine.name} at ${routine.time}`, selectedLanguage);
      const confirmationMessage = {
        id: Date.now(),
        text: confirmationText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'confirmation'
      };
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      console.error('Error adding routine:', error);
      alert('Failed to add routine. Please try again.');
    }
  };

  const deleteMedicine = async (id) => {
    try {
      await axios.delete(`/api/medicine/${id}`);
      await loadMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error);
      alert('Failed to delete medicine. Please try again.');
    }
  };

  const deleteRoutine = async (id) => {
    try {
      await axios.delete(`/api/routine/${id}`);
      await loadRoutines();
    } catch (error) {
      console.error('Error deleting routine:', error);
      alert('Failed to delete routine. Please try again.');
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access your personal medical assistant.
            </p>
            <a
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              {t('chatbot.title')}
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            {t('chatbot.subtitle')}
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">🌐 {t('chatbot.chat_language')}:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              💬 {t('chatbot.title')}
            </button>
            <button
              onClick={() => setActiveTab('medicine')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'medicine'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              💊 {t('chatbot.medicine_tracker')}
            </button>
            <button
              onClick={() => setActiveTab('routine')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'routine'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              🏃 {t('chatbot.routine_tracker')}
            </button>
          </div>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="relative">
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.type === 'error'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : message.type === 'confirmation'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                      <div className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                    
                    {/* Speak Button for Bot Messages */}
                    {message.sender === 'bot' && (
                      <button
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(message.text, selectedLanguage)}
                        className={`absolute -right-8 top-2 p-2 rounded-full transition-all duration-200 ${
                          isSpeaking 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title={isSpeaking ? 'Stop speaking' : 'Speak message'}
                      >
                        {isSpeaking ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h12v12H6z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Medical Terms Display */}
                  {message.sender === 'bot' && message.medicalTerms && (
                    <div className="mt-2 ml-4 max-w-xs lg:max-w-md">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm font-medium text-blue-800">Medical Terms</span>
                        </div>
                        <div className="text-sm text-blue-700">
                          {message.medicalTerms.terms && message.medicalTerms.terms.length > 0 ? (
                            <ul className="space-y-1">
                              {message.medicalTerms.terms.slice(0, 3).map((term, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-blue-600 mr-2">•</span>
                                  <span>{term.term}: {term.definition}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No specific medical terms found in your message.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm">Assistant is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('chatbot.ask_question')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('chatbot.send')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Medicine Tracker Tab */}
        {activeTab === 'medicine' && (
          <div className="space-y-6">
            {/* Add Medicine Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Medicine</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
                  <input
                    type="text"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                    placeholder="e.g., Paracetamol"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dosage *</label>
                  <input
                    type="text"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                    placeholder="e.g., 500mg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={newMedicine.time}
                    onChange={(e) => setNewMedicine({...newMedicine, time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={newMedicine.frequency}
                    onChange={(e) => setNewMedicine({...newMedicine, frequency: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="twice-daily">Twice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as-needed">As Needed</option>
                  </select>
                </div>
              </div>
              <button
                onClick={addMedicine}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Medicine
              </button>
            </div>

            {/* Medicine List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Medicines</h2>
              {medicines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <p>No medicines added yet. Add your first medicine above!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {medicines.map((medicine) => (
                    <div key={medicine.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-blue-900">{medicine.name}</h3>
                        <button
                          onClick={() => deleteMedicine(medicine.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Dosage:</strong> {medicine.dosage}</p>
                        <p><strong>Time:</strong> {medicine.time}</p>
                        <p><strong>Frequency:</strong> {medicine.frequency}</p>
                        <p className="text-xs text-blue-600 mt-2">
                          Added: {new Date(medicine.addedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Routine Tracker Tab */}
        {activeTab === 'routine' && (
          <div className="space-y-6">
            {/* Add Routine Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Routine</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Routine Name *</label>
                  <input
                    type="text"
                    value={newRoutine.name}
                    onChange={(e) => setNewRoutine({...newRoutine, name: e.target.value})}
                    placeholder="e.g., Morning Exercise"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={newRoutine.time}
                    onChange={(e) => setNewRoutine({...newRoutine, time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={newRoutine.frequency}
                    onChange={(e) => setNewRoutine({...newRoutine, frequency: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="twice-weekly">Twice Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <input
                    type="text"
                    value={newRoutine.description}
                    onChange={(e) => setNewRoutine({...newRoutine, description: e.target.value})}
                    placeholder="e.g., 30 min cardio workout"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={addRoutine}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Routine
              </button>
            </div>

            {/* Routine List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Routines</h2>
              {routines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p>No routines added yet. Add your first routine above!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {routines.map((routine) => (
                    <div key={routine.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-green-900">{routine.name}</h3>
                        <button
                          onClick={() => deleteRoutine(routine.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-sm text-green-800 space-y-1">
                        <p><strong>Time:</strong> {routine.time}</p>
                        <p><strong>Description:</strong> {routine.description}</p>
                        <p><strong>Frequency:</strong> {routine.frequency}</p>
                        <p className="text-xs text-green-600 mt-2">
                          Added: {new Date(routine.addedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Language Confirmation Dialog */}
        {showLanguageConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Language Detected
                </h3>
                <p className="text-gray-600 mb-4">
                  I detected that you're speaking in <strong>{languages.find(lang => lang.code === detectedLanguage)?.name || detectedLanguage}</strong>. 
                  Would you like me to respond in this language?
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelLanguageChange}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    No, keep {languages.find(lang => lang.code === selectedLanguage)?.name || selectedLanguage}
                  </button>
                  <button
                    onClick={confirmLanguageChange}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Yes, switch to {languages.find(lang => lang.code === detectedLanguage)?.name || detectedLanguage}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
