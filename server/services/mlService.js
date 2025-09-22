const natural = require('natural');
const axios = require('axios');

class MLService {
  constructor() {
    this.initializeModels();
  }

  initializeModels() {
    // Initialize natural language processing tools
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Medical terminology database
    this.medicalTerms = {
      en: {
        headache: ['headache', 'head pain', 'migraine', 'cephalgia'],
        fever: ['fever', 'temperature', 'pyrexia', 'hyperthermia'],
        cough: ['cough', 'coughing', 'tussis'],
        cold: ['cold', 'rhinorrhea', 'nasal congestion', 'runny nose'],
        stomach: ['stomach', 'abdominal', 'gastric', 'nausea', 'vomiting'],
        pain: ['pain', 'ache', 'soreness', 'discomfort'],
        medicine: ['medicine', 'medication', 'drug', 'pill', 'tablet'],
        routine: ['routine', 'schedule', 'habit', 'regimen'],
        health: ['health', 'wellness', 'fitness', 'medical'],
        doctor: ['doctor', 'physician', 'medical professional', 'healthcare provider'],
        // Common medicines
        paracetamol: ['paracetamol', 'acetaminophen', 'tylenol', 'panadol'],
        ibuprofen: ['ibuprofen', 'advil', 'motrin', 'brufen'],
        aspirin: ['aspirin', 'disprin', 'ecotrin'],
        amoxicillin: ['amoxicillin', 'amoxil', 'trimox'],
        omeprazole: ['omeprazole', 'prilosec', 'losec'],
        metformin: ['metformin', 'glucophage', 'fortamet'],
        atorvastatin: ['atorvastatin', 'lipitor'],
        lisinopril: ['lisinopril', 'zestril', 'prinivil'],
        // General topics
        weather: ['weather', 'climate', 'temperature', 'rain', 'sunny'],
        food: ['food', 'eating', 'diet', 'nutrition', 'meal'],
        travel: ['travel', 'trip', 'vacation', 'journey', 'flight'],
        technology: ['technology', 'computer', 'phone', 'internet', 'software'],
        education: ['education', 'school', 'study', 'learning', 'university'],
        work: ['work', 'job', 'career', 'office', 'business'],
        family: ['family', 'parents', 'children', 'siblings', 'relatives'],
        sports: ['sports', 'exercise', 'fitness', 'gym', 'running'],
        entertainment: ['entertainment', 'movie', 'music', 'game', 'fun']
      },
      ta: {
        headache: ['தலைவலி', 'கபாலம்', 'தலை', 'வலி', 'மிக்ரேன்'],
        fever: ['காய்ச்சல்', 'ஜ்வரம்', 'வெப்பம்', 'காய்ச்சல்', 'உடல் வெப்பம்'],
        cough: ['இருமல்', 'காசம்', 'கபம்', 'இருமல் வலி'],
        cold: ['சளி', 'தடிமன்', 'மூக்கு', 'மூக்கு சளி', 'தடிமன் சளி'],
        stomach: ['வயிறு', 'உதரம்', 'வயிற்று', 'வாந்தி', 'குமட்டல்'],
        pain: ['வலி', 'நோவு', 'துன்பம்', 'வேதனை'],
        medicine: ['மருந்து', 'ஔஷதம்', 'மாத்திரை', 'குளிகை'],
        routine: ['வழக்கம்', 'பழக்கம்', 'வழக்கமான', 'நடைமுறை'],
        health: ['சுகாதாரம்', 'ஆரோக்கியம்', 'நலம்', 'உடல் நலம்'],
        doctor: ['மருத்துவர்', 'டாக்டர்', 'வைத்தியர்', 'மருத்துவ நிபுணர்']
      },
      hi: {
        headache: ['सिरदर्द', 'सिर', 'दर्द', 'कपाल', 'माइग्रेन'],
        fever: ['बुखार', 'ज्वर', 'ताप', 'गर्मी', 'शरीर का ताप'],
        cough: ['खांसी', 'कफ', 'बलगम', 'खांसी का दर्द'],
        cold: ['जुकाम', 'सर्दी', 'नाक', 'नाक बहना', 'सर्दी जुकाम'],
        stomach: ['पेट', 'उदर', 'पेटदर्द', 'उल्टी', 'मतली'],
        pain: ['दर्द', 'पीड़ा', 'कष्ट', 'वेदना'],
        medicine: ['दवा', 'औषधि', 'गोली', 'टैबलेट'],
        routine: ['दिनचर्या', 'आदत', 'व्यवस्था', 'नियमित'],
        health: ['स्वास्थ्य', 'सेहत', 'आरोग्य', 'शारीरिक स्वास्थ्य'],
        doctor: ['डॉक्टर', 'चिकित्सक', 'वैद्य', 'स्वास्थ्य सेवा प्रदाता']
      }
    };

    // Response templates in different languages
    this.responseTemplates = {
      en: {
        greeting: "Hello! I'm your AI assistant. I can help you with medical questions, general topics, medicine information, and much more. How can I assist you today?",
        headache: "Headaches can have various causes. Here are some general suggestions:\n\n• Stay hydrated\n• Get adequate rest\n• Avoid stress when possible\n• Consider over-the-counter pain relief\n\n⚠️ If headaches are severe, frequent, or accompanied by other symptoms, please consult a healthcare professional immediately.",
        fever: "For fever management:\n\n• Rest and stay hydrated\n• Use fever-reducing medications as directed\n• Monitor temperature regularly\n• Keep cool with light clothing\n\n⚠️ If fever is high (>103°F/39.4°C), persistent, or accompanied by severe symptoms, seek medical attention.",
        cough: "For cough and cold symptoms:\n\n• Stay hydrated with warm fluids\n• Use a humidifier\n• Get plenty of rest\n• Consider honey for cough relief\n• Use saline nasal sprays\n\n⚠️ If symptoms worsen or persist beyond 10 days, consult a doctor.",
        cold: "For cough and cold symptoms:\n\n• Stay hydrated with warm fluids\n• Use a humidifier\n• Get plenty of rest\n• Consider honey for cough relief\n• Use saline nasal sprays\n\n⚠️ If symptoms worsen or persist beyond 10 days, consult a doctor.",
        stomach: "For stomach issues:\n\n• Stay hydrated with small sips of water\n• Eat bland foods (BRAT diet: Bananas, Rice, Applesauce, Toast)\n• Avoid spicy, fatty, or acidic foods\n• Rest and avoid strenuous activity\n\n⚠️ If vomiting is severe, persistent, or contains blood, seek immediate medical attention.",
        // Medicine information
        paracetamol: "Paracetamol (Acetaminophen) Information:\n\n• Used for: Pain relief and fever reduction\n• Common dosage: 500-1000mg every 4-6 hours\n• Maximum daily dose: 4000mg\n• Side effects: Rare, but can cause liver damage if overdosed\n\n⚠️ Always consult a doctor before taking any medication, especially if you have liver problems or are taking other medicines.",
        ibuprofen: "Ibuprofen Information:\n\n• Used for: Pain relief, inflammation, and fever\n• Common dosage: 200-400mg every 4-6 hours\n• Maximum daily dose: 2400mg\n• Side effects: Stomach upset, heartburn, dizziness\n\n⚠️ Not recommended for people with stomach ulcers, heart problems, or kidney issues. Always consult a doctor first.",
        aspirin: "Aspirin Information:\n\n• Used for: Pain relief, fever reduction, blood thinning\n• Common dosage: 325-650mg every 4 hours\n• Side effects: Stomach irritation, bleeding risk\n\n⚠️ Not recommended for children with viral infections. Consult a doctor before use, especially if you have bleeding disorders.",
        // General topics
        weather: "I'd be happy to discuss weather! However, for current weather conditions, I recommend checking a reliable weather app or website. For weather-related health concerns (like heat stroke prevention or cold weather safety), I can provide helpful advice. What specific weather topic interests you?",
        food: "Food and nutrition are important for health! I can discuss:\n\n• Healthy eating habits\n• Nutritional requirements\n• Food safety\n• Dietary restrictions\n• Cooking tips\n\nWhat would you like to know about food and nutrition?",
        travel: "Travel can be exciting! For travel-related health advice, I can help with:\n\n• Travel vaccinations\n• Motion sickness prevention\n• Jet lag management\n• Travel first aid\n• Health insurance for travel\n\nWhat travel health topic concerns you?",
        technology: "Technology is fascinating! While I can discuss general tech topics, for medical technology or health apps, I can provide insights on:\n\n• Health monitoring devices\n• Medical apps\n• Telemedicine\n• Digital health records\n\nWhat aspect of technology interests you?",
        education: "Education is crucial for health literacy! I can help with:\n\n• Medical terminology\n• Health education topics\n• Learning about conditions\n• Understanding treatments\n• Health research basics\n\nWhat would you like to learn about?",
        work: "Work-life balance affects health! I can discuss:\n\n• Workplace stress management\n• Ergonomics\n• Work-related health issues\n• Mental health at work\n• Occupational safety\n\nWhat work-related health concern do you have?",
        family: "Family health is important! I can help with:\n\n• Family health planning\n• Child health topics\n• Elderly care\n• Family medical history\n• Health communication\n\nWhat family health topic interests you?",
        sports: "Sports and exercise are great for health! I can discuss:\n\n• Exercise safety\n• Sports injuries\n• Fitness planning\n• Nutrition for athletes\n• Recovery strategies\n\nWhat sports or fitness topic would you like to know about?",
        entertainment: "Entertainment can be good for mental health! For health-related entertainment, I can suggest:\n\n• Health documentaries\n• Medical podcasts\n• Wellness apps\n• Relaxation techniques\n• Mental health activities\n\nWhat type of health entertainment interests you?",
        general: "I'm here to help with any topic! I can discuss:\n\n• Medical questions and health advice\n• Medicine information and recommendations\n• General knowledge on various topics\n• Technology, food, travel, and more\n• Always remember: For serious medical concerns, consulting a doctor is always the best approach\n\nWhat would you like to talk about?"
      },
      ta: {
        greeting: "வணக்கம்! நான் உங்கள் மருத்துவ உதவியாளர். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
        headache: "தலைவலிக்கு பல்வேறு காரணங்கள் இருக்கலாம். இங்கே சில பொதுவான பரிந்துரைகள்:\n\n• நீரேற்றம் பராமரிக்கவும்\n• போதுமான ஓய்வு எடுத்துக்கொள்ளுங்கள்\n• முடிந்தவரை மன அழுத்தத்தைத் தவிர்க்கவும்\n• கவுண்டரில் கிடைக்கும் வலி நிவாரணி பற்றி சிந்தியுங்கள்\n\n⚠️ தலைவலி கடுமையானது, அடிக்கடி நிகழ்கிறது, அல்லது பிற அறிகுறிகளுடன் இருந்தால், உடனடியாக ஒரு சுகாதார நிபுணரைக் கலந்தாலோசியுங்கள்.",
        fever: "காய்ச்சல் நிர்வாகத்திற்கு:\n\n• ஓய்வெடுத்து நீரேற்றம் பராமரிக்கவும்\n• வழிகாட்டப்பட்டபடி காய்ச்சல் குறைக்கும் மருந்துகளைப் பயன்படுத்தவும்\n• வெப்பநிலையை தவறாமல் கண்காணிக்கவும்\n• இலகுவான ஆடைகளுடன் குளிர்ச்சியாக இருங்கள்\n\n⚠️ காய்ச்சல் அதிகமாக (>103°F/39.4°C), தொடர்ச்சியாக இருந்தால், அல்லது கடுமையான அறிகுறிகளுடன் இருந்தால், மருத்துவ உதவியை நாடுங்கள்.",
        cough: "இருமல் மற்றும் சளி அறிகுறிகளுக்கு:\n\n• சூடான திரவங்களுடன் நீரேற்றம் பராமரிக்கவும்\n• ஈரப்பதமானியைப் பயன்படுத்தவும்\n• போதுமான ஓய்வு எடுத்துக்கொள்ளுங்கள்\n• இருமல் நிவாரணத்திற்கு தேனைக் கருத்தில் கொள்ளுங்கள்\n• உப்பு மூக்கு தெளிப்புகளைப் பயன்படுத்தவும்\n\n⚠️ அறிகுறிகள் மோசமடைந்தால் அல்லது 10 நாட்களுக்கு மேல் நீடித்தால், மருத்துவரைக் கலந்தாலோசியுங்கள்.",
        cold: "இருமல் மற்றும் சளி அறிகுறிகளுக்கு:\n\n• சூடான திரவங்களுடன் நீரேற்றம் பராமரிக்கவும்\n• ஈரப்பதமானியைப் பயன்படுத்தவும்\n• போதுமான ஓய்வு எடுத்துக்கொள்ளுங்கள்\n• இருமல் நிவாரணத்திற்கு தேனைக் கருத்தில் கொள்ளுங்கள்\n• உப்பு மூக்கு தெளிப்புகளைப் பயன்படுத்தவும்\n\n⚠️ அறிகுறிகள் மோசமடைந்தால் அல்லது 10 நாட்களுக்கு மேல் நீடித்தால், மருத்துவரைக் கலந்தாலோசியுங்கள்.",
        stomach: "வயிற்று பிரச்சினைகளுக்கு:\n\n• சிறிய சிறிய நீர் சிப்ஸுடன் நீரேற்றம் பராமரிக்கவும்\n• மென்மையான உணவுகளை சாப்பிடுங்கள் (BRAT உணவு: வாழைப்பழம், அரிசி, ஆப்பிள் சாஸ், டோஸ்ட்)\n• காரமான, கொழுப்பு அல்லது அமில உணவுகளைத் தவிர்க்கவும்\n• ஓய்வெடுத்து கடினமான செயல்பாடுகளைத் தவிர்க்கவும்\n\n⚠️ வாந்தி கடுமையானது, தொடர்ச்சியாக இருந்தால், அல்லது இரத்தத்தைக் கொண்டிருந்தால், உடனடியாக மருத்துவ உதவியை நாடுங்கள்.",
        general: "நீங்கள் சுகாதாரம் பற்றி கேட்கிறீர்கள் என்பதை நான் புரிந்துகொள்கிறேன். மருத்துவ கேள்விகள், மருந்து கண்காணிப்பு மற்றும் சுகாதார ஆலோசனைகளில் நான் உங்களுக்கு உதவ முடியும். குறிப்பிட்ட மருத்துவ கவலைகளுக்கு, தயவுசெய்து ஒரு சுகாதார நிபுணருடன் கலந்தாலோசியுங்கள்."
      },
      hi: {
        greeting: "नमस्ते! मैं आपका मेडिकल असिस्टेंट हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        headache: "सिरदर्द के विभिन्न कारण हो सकते हैं। यहां कुछ सामान्य सुझाव हैं:\n\n• हाइड्रेटेड रहें\n• पर्याप्त आराम करें\n• जब भी संभव हो तनाव से बचें\n• ओवर-द-काउंटर दर्द निवारक पर विचार करें\n\n⚠️ यदि सिरदर्द गंभीर, बार-बार होता है, या अन्य लक्षणों के साथ है, तो कृपया तुरंत एक स्वास्थ्य पेशेवर से परामर्श करें।",
        fever: "बुखार प्रबंधन के लिए:\n\n• आराम करें और हाइड्रेटेड रहें\n• निर्देशानुसार बुखार कम करने वाली दवाओं का उपयोग करें\n• तापमान की नियमित निगरानी करें\n• हल्के कपड़े पहनकर ठंडा रहें\n\n⚠️ यदि बुखार उच्च (>103°F/39.4°C), लगातार है, या गंभीर लक्षणों के साथ है, तो चिकित्सा सहायता लें।",
        cough: "खांसी और सर्दी के लक्षणों के लिए:\n\n• गर्म तरल पदार्थों के साथ हाइड्रेटेड रहें\n• ह्यूमिडिफायर का उपयोग करें\n• भरपूर आराम करें\n• खांसी से राहत के लिए शहद पर विचार करें\n• सलाइन नेज़ल स्प्रे का उपयोग करें\n\n⚠️ यदि लक्षण बिगड़ते हैं या 10 दिनों से अधिक समय तक बने रहते हैं, तो डॉक्टर से परामर्श करें।",
        cold: "खांसी और सर्दी के लक्षणों के लिए:\n\n• गर्म तरल पदार्थों के साथ हाइड्रेटेड रहें\n• ह्यूमिडिफायर का उपयोग करें\n• भरपूर आराम करें\n• खांसी से राहत के लिए शहद पर विचार करें\n• सलाइन नेज़ल स्प्रे का उपयोग करें\n\n⚠️ यदि लक्षण बिगड़ते हैं या 10 दिनों से अधिक समय तक बने रहते हैं, तो डॉक्टर से परामर्श करें।",
        stomach: "पेट की समस्याओं के लिए:\n\n• छोटे-छोटे घूंट पानी के साथ हाइड्रेटेड रहें\n• हल्का भोजन खाएं (BRAT डाइट: केले, चावल, सेब की चटनी, टोस्ट)\n• मसालेदार, वसायुक्त या अम्लीय भोजन से बचें\n• आराम करें और जोरदार गतिविधि से बचें\n\n⚠️ यदि उल्टी गंभीर, लगातार है, या रक्त युक्त है, तो तुरंत चिकित्सा सहायता लें।",
        general: "मैं समझता हूं कि आप स्वास्थ्य के बारे में पूछ रहे हैं। मैं आपकी मेडिकल प्रश्नों, दवा ट्रैकिंग और स्वास्थ्य सलाह में मदद कर सकता हूं। विशिष्ट चिकित्सा चिंताओं के लिए, कृपया एक स्वास्थ्य पेशेवर से परामर्श करें।"
      }
    };
  }

  // Detect language from input text
  detectLanguage(text) {
    const lowerText = text.toLowerCase();
    
    // Tamil detection
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    if (/\b(தலைவலி|காய்ச்சல்|இருமல்|சளி|வயிறு|மருந்து|வழக்கம்|பழக்கம்|உதவி|ஆலோசனை|சுகாதாரம்|நோய்|வலி|உடல்|மருத்துவர்|நோயாளி|வணக்கம்|எப்படி|என்ன|உதவ|ஆலோசனை|சுகாதார|நலம்)\b/.test(text)) return 'ta';
    
    // Hindi detection
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    if (/\b(सिरदर्द|बुखार|खांसी|जुकाम|पेट|दवा|दिनचर्या|आदत|मदद|सलाह|स्वास्थ्य|बीमारी|दर्द|शरीर|डॉक्टर|रोगी|नमस्ते|कैसे|क्या|मदद|सलाह|स्वास्थ्य|सेहत)\b/.test(text)) return 'hi';
    
    // Other languages
    if (/[àâäéèêëïîôùûüÿç]/.test(text)) return 'fr';
    if (/[ñáéíóúü]/.test(text)) return 'es';
    if (/[äöüß]/.test(text)) return 'de';
    
    return 'en'; // Default to English
  }

  // Extract medical condition from text
  extractMedicalCondition(text, language) {
    const lowerText = text.toLowerCase();
    const terms = this.medicalTerms[language] || this.medicalTerms.en;
    
    for (const [condition, keywords] of Object.entries(terms)) {
      if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
        return condition;
      }
    }
    
    return 'general';
  }

  // Get medicine recommendation with doctor consultation advice
  getMedicineRecommendation(condition, language = 'en') {
    const recommendations = {
      en: {
        headache: {
          recommendation: "For mild headaches, you might consider:\n\n• Paracetamol (500-1000mg every 4-6 hours)\n• Ibuprofen (200-400mg every 4-6 hours)\n• Rest in a dark, quiet room\n• Apply cold compress to forehead",
          warning: "⚠️ IMPORTANT: While I can provide general information about medicines, consulting a doctor is always the best and safest approach. A doctor can:\n\n• Assess your specific condition\n• Consider your medical history\n• Check for drug interactions\n• Provide personalized dosage\n• Monitor for side effects\n\nPlease see a healthcare professional for proper diagnosis and treatment."
        },
        fever: {
          recommendation: "For fever management, consider:\n\n• Paracetamol (500-1000mg every 4-6 hours)\n• Ibuprofen (200-400mg every 4-6 hours)\n• Stay well hydrated\n• Rest and monitor temperature",
          warning: "⚠️ IMPORTANT: While I can provide general information about medicines, consulting a doctor is always the best and safest approach. A doctor can:\n\n• Determine the cause of fever\n• Check for serious infections\n• Provide appropriate treatment\n• Monitor your condition\n• Prevent complications\n\nPlease see a healthcare professional for proper diagnosis and treatment."
        },
        pain: {
          recommendation: "For general pain relief, you might consider:\n\n• Paracetamol (500-1000mg every 4-6 hours)\n• Ibuprofen (200-400mg every 4-6 hours)\n• Apply ice or heat as appropriate\n• Rest the affected area",
          warning: "⚠️ IMPORTANT: While I can provide general information about medicines, consulting a doctor is always the best and safest approach. A doctor can:\n\n• Identify the cause of pain\n• Rule out serious conditions\n• Prescribe appropriate medication\n• Provide pain management plan\n• Monitor your progress\n\nPlease see a healthcare professional for proper diagnosis and treatment."
        }
      },
      hi: {
        headache: {
          recommendation: "हल्के सिरदर्द के लिए, आप इन पर विचार कर सकते हैं:\n\n• पैरासिटामोल (500-1000mg हर 4-6 घंटे)\n• इबुप्रोफेन (200-400mg हर 4-6 घंटे)\n• अंधेरे, शांत कमरे में आराम करें\n• माथे पर ठंडा सेक लगाएं",
          warning: "⚠️ महत्वपूर्ण: हालांकि मैं दवाओं के बारे में सामान्य जानकारी दे सकता हूं, डॉक्टर से परामर्श करना हमेशा सबसे अच्छा और सुरक्षित तरीका है। डॉक्टर कर सकते हैं:\n\n• आपकी विशिष्ट स्थिति का आकलन\n• आपके चिकित्सा इतिहास पर विचार\n• दवा की बातचीत की जांच\n• व्यक्तिगत खुराक प्रदान\n• साइड इफेक्ट्स की निगरानी\n\nकृपया उचित निदान और उपचार के लिए स्वास्थ्य पेशेवर से मिलें।"
        },
        fever: {
          recommendation: "बुखार प्रबंधन के लिए, इन पर विचार करें:\n\n• पैरासिटामोल (500-1000mg हर 4-6 घंटे)\n• इबुप्रोफेन (200-400mg हर 4-6 घंटे)\n• अच्छी तरह से हाइड्रेटेड रहें\n• आराम करें और तापमान की निगरानी करें",
          warning: "⚠️ महत्वपूर्ण: हालांकि मैं दवाओं के बारे में सामान्य जानकारी दे सकता हूं, डॉक्टर से परामर्श करना हमेशा सबसे अच्छा और सुरक्षित तरीका है। डॉक्टर कर सकते हैं:\n\n• बुखार का कारण निर्धारित करना\n• गंभीर संक्रमण की जांच\n• उपयुक्त उपचार प्रदान\n• आपकी स्थिति की निगरानी\n• जटिलताओं को रोकना\n\nकृपया उचित निदान और उपचार के लिए स्वास्थ्य पेशेवर से मिलें।"
        }
      },
      ta: {
        headache: {
          recommendation: "இலகுவான தலைவலிக்கு, நீங்கள் இவற்றைக் கருத்தில் கொள்ளலாம்:\n\n• பாராசிட்டமோல் (500-1000mg ஒவ்வொரு 4-6 மணி)\n• இபுபுரோபன் (200-400mg ஒவ்வொரு 4-6 மணி)\n• இருட்டான, அமைதியான அறையில் ஓய்வெடுக்கவும்\n• நெற்றியில் குளிர்ந்த கட்டு வைக்கவும்",
          warning: "⚠️ முக்கியம்: மருந்துகள் பற்றிய பொதுவான தகவல்களை நான் வழங்க முடியும் என்றாலும், மருத்துவரைக் கலந்தாலோசிப்பது எப்போதும் சிறந்த மற்றும் பாதுகாப்பான அணுகுமுறை. மருத்துவர் செய்ய முடியும்:\n\n• உங்கள் குறிப்பிட்ட நிலையை மதிப்பிட\n• உங்கள் மருத்துவ வரலாற்றைக் கருத்தில் கொள்ள\n• மருந்து தொடர்புகளைச் சரிபார்க்க\n• தனிப்பட்ட மருந்தளவை வழங்க\n• பக்க விளைவுகளைக் கண்காணிக்க\n\nசரியான நோயறிதல் மற்றும் சிகிச்சைக்கு தயவுசெய்து சுகாதார நிபுணரைப் பார்க்கவும்."
        }
      }
    };

    const langRecommendations = recommendations[language] || recommendations.en;
    return langRecommendations[condition] || langRecommendations.headache;
  }

  // Generate response in the specified language
  generateResponse(userInput, language = 'en') {
    const condition = this.extractMedicalCondition(userInput, language);
    const templates = this.responseTemplates[language] || this.responseTemplates.en;
    
    // Check if user is asking for medicine recommendation
    const lowerInput = userInput.toLowerCase();
    const isAskingForMedicine = lowerInput.includes('medicine') || 
                               lowerInput.includes('medication') || 
                               lowerInput.includes('drug') || 
                               lowerInput.includes('pill') ||
                               lowerInput.includes('tablet') ||
                               lowerInput.includes('recommend') ||
                               lowerInput.includes('suggest');
    
    // If asking for medicine recommendation and it's a medical condition
    if (isAskingForMedicine && ['headache', 'fever', 'pain', 'cough', 'cold', 'stomach'].includes(condition)) {
      const medicineInfo = this.getMedicineRecommendation(condition, language);
      return {
        text: `${templates[condition]}\n\n💊 Medicine Recommendation:\n\n${medicineInfo.recommendation}\n\n${medicineInfo.warning}`,
        condition: condition,
        language: language,
        confidence: 0.9,
        isMedicineRecommendation: true
      };
    }
    
    // Return appropriate response based on condition
    if (templates[condition]) {
      return {
        text: templates[condition],
        condition: condition,
        language: language,
        confidence: 0.9
      };
    }
    
    // Fallback to general response
    return {
      text: templates.general,
      condition: 'general',
      language: language,
      confidence: 0.7
    };
  }

  // Enhanced response generation with context awareness
  generateContextualResponse(userInput, language = 'en', conversationHistory = []) {
    const condition = this.extractMedicalCondition(userInput, language);
    const templates = this.responseTemplates[language] || this.responseTemplates.en;
    
    // Add contextual information based on conversation history
    let contextualResponse = templates[condition] || templates.general;
    
    // Add follow-up suggestions based on condition
    const followUpSuggestions = {
      en: {
        headache: "\n\n💡 Would you like me to help you track your headache patterns or set up medication reminders?",
        fever: "\n\n💡 I can help you monitor your temperature and set up fever management reminders.",
        cough: "\n\n💡 Would you like me to help you track your symptoms and set up medication reminders?",
        stomach: "\n\n💡 I can help you track your symptoms and suggest dietary modifications.",
        general: "\n\n💡 I can also help you with medicine tracking and health routine management."
      },
      ta: {
        headache: "\n\n💡 உங்கள் தலைவலி வடிவங்களைக் கண்காணிக்கவும் அல்லது மருந்து நினைவூட்டல்களை அமைக்கவும் நான் உதவ விரும்புகிறீர்களா?",
        fever: "\n\n💡 உங்கள் வெப்பநிலையைக் கண்காணிக்கவும் காய்ச்சல் நிர்வாக நினைவூட்டல்களை அமைக்கவும் நான் உதவ முடியும்.",
        cough: "\n\n💡 உங்கள் அறிகுறிகளைக் கண்காணிக்கவும் மருந்து நினைவூட்டல்களை அமைக்கவும் நான் உதவ விரும்புகிறீர்களா?",
        stomach: "\n\n💡 உங்கள் அறிகுறிகளைக் கண்காணிக்கவும் உணவு மாற்றங்களை பரிந்துரைக்கவும் நான் உதவ முடியும்.",
        general: "\n\n💡 மருந்து கண்காணிப்பு மற்றும் சுகாதார வழக்க நிர்வாகத்திலும் நான் உதவ முடியும்."
      },
      hi: {
        headache: "\n\n💡 क्या आप चाहते हैं कि मैं आपके सिरदर्द के पैटर्न को ट्रैक करने या दवा रिमाइंडर सेट करने में मदद करूं?",
        fever: "\n\n💡 मैं आपके तापमान की निगरानी और बुखार प्रबंधन रिमाइंडर सेट करने में मदद कर सकता हूं।",
        cough: "\n\n💡 क्या आप चाहते हैं कि मैं आपके लक्षणों को ट्रैक करने और दवा रिमाइंडर सेट करने में मदद करूं?",
        stomach: "\n\n💡 मैं आपके लक्षणों को ट्रैक करने और आहार संशोधन सुझाने में मदद कर सकता हूं।",
        general: "\n\n💡 मैं दवा ट्रैकिंग और स्वास्थ्य दिनचर्या प्रबंधन में भी मदद कर सकता हूं।"
      }
    };
    
    const suggestions = followUpSuggestions[language] || followUpSuggestions.en;
    if (suggestions[condition]) {
      contextualResponse += suggestions[condition];
    }
    
    return {
      text: contextualResponse,
      condition: condition,
      language: language,
      confidence: 0.9,
      hasFollowUp: true
    };
  }

  // Get medical term explanations using the external API
  async getMedicalTermExplanation(text, language = 'en') {
    try {
      // Clean the text - remove punctuation and extra characters, keep only words
      const cleanedText = text
        .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
        .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
        .trim();                   // Remove leading/trailing spaces
      
      const response = await axios.post('https://4d51847c44d1.ngrok-free.app/find_terms', {
        sentence: cleanedText
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching medical terms:', error);
      return null;
    }
  }

  // Process user input and generate comprehensive response
  async processUserInput(userInput, preferredLanguage = 'en') {
    // Detect the language of user input
    const detectedLanguage = this.detectLanguage(userInput);
    
    // Use detected language or preferred language
    const responseLanguage = detectedLanguage !== 'en' ? detectedLanguage : preferredLanguage;
    
    // Generate contextual response
    const response = this.generateContextualResponse(userInput, responseLanguage);
    
    // Get medical term explanations if applicable
    let medicalTerms = null;
    if (response.condition !== 'general') {
      medicalTerms = await this.getMedicalTermExplanation(userInput, responseLanguage);
    }
    
    return {
      ...response,
      detectedLanguage: detectedLanguage,
      medicalTerms: medicalTerms,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new MLService();

