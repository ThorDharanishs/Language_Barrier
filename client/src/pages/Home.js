import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import QuickSpeech from '../components/QuickSpeech';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showQuickSpeech, setShowQuickSpeech] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: 'Fast Translation',
      description: 'Get instant translations with our advanced AI-powered translation engine.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Accurate Results',
      description: 'Healthcare-specific translations with medical terminology accuracy.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Medical Focus',
      description: 'Specialized for healthcare conversations between doctors and patients.'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Select Language',
      description: 'Choose your target language from our supported languages including English, Hindi, Tamil, French, and more.'
    },
    {
      number: '2',
      title: 'Speak or Type',
      description: 'Input your text by typing or using our voice recognition feature for hands-free communication.'
    },
    {
      number: '3',
      title: 'Translate & Understand',
      description: 'Get instant translation with medical term explanations to ensure clear understanding.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute w-96 h-96 bg-blue-200 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${mousePosition.x * 0.02}px`,
              top: `${mousePosition.y * 0.02}px`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.3s ease-out'
            }}
          ></div>
          <div 
            className="absolute w-64 h-64 bg-teal-200 rounded-full opacity-30 animate-bounce"
            style={{
              right: `${mousePosition.x * 0.01}px`,
              bottom: `${mousePosition.y * 0.01}px`,
              transform: 'translate(50%, 50%)',
              transition: 'all 0.4s ease-out'
            }}
          ></div>
          <div 
            className="absolute w-48 h-48 bg-purple-200 rounded-full opacity-25 animate-ping"
            style={{
              left: `${mousePosition.x * 0.015}px`,
              bottom: `${mousePosition.y * 0.015}px`,
              transform: 'translate(-50%, 50%)',
              transition: 'all 0.5s ease-out'
            }}
          ></div>
          <div 
            className="absolute w-32 h-32 bg-pink-200 rounded-full opacity-30 animate-pulse"
            style={{
              right: `${mousePosition.x * 0.01}px`,
              bottom: `${mousePosition.y * 0.01}px`,
              transform: 'translate(50%, 50%)',
              transition: 'all 0.6s ease-out'
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-gray-900 mb-8">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent animate-pulse drop-shadow-lg">
                  MediLingo
                </span>
                <div className="inline-block ml-4">
                  <span className="text-4xl md:text-6xl lg:text-7xl animate-bounce">🌍</span>
                </div>
              </h1>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <p className="text-2xl md:text-3xl lg:text-4xl text-gray-700 mb-12 max-w-5xl mx-auto leading-relaxed font-medium">
                <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                  {t('home.subtitle')}
                </span>
              </p>
            </div>
            
            {!isAuthenticated && (
              <div className={`transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    to="/signup"
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover-lift relative overflow-hidden"
                  >
                    <span className="relative z-10">{t('home.get_started')}</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </Link>
                  <Link
                    to="/translate"
                    className="group border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all duration-300 relative overflow-hidden"
                  >
                    <span className="relative z-10">{t('home.try_demo')}</span>
                    <div className="absolute inset-0 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </Link>
                </div>
              </div>
            )}

            {/* Interactive Stats */}
            <div className={`mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="text-center group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                  12+
                </div>
                <div className="text-lg text-gray-700 font-medium">Languages Supported</div>
              </div>
              <div className="text-center group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                  1000+
                </div>
                <div className="text-lg text-gray-700 font-medium">Medical Terms</div>
              </div>
              <div className="text-center group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                  24/7
                </div>
                <div className="text-lg text-gray-700 font-medium">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.how_it_works')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to bridge the communication gap in healthcare
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-300 to-transparent transform translate-x-8"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use MediLingo Section */}
      <section className="py-20 bg-gradient-medical-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.why_choose')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering healthcare communication with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl p-8 shadow-lg hover-lift group transform transition-all duration-500 ${
                  currentFeature === index ? 'scale-105 shadow-2xl' : 'scale-100'
                }`}
                onMouseEnter={() => setCurrentFeature(index)}
              >
                <div className={`flex items-center justify-center w-16 h-16 rounded-lg mb-6 transition-all duration-300 ${
                  currentFeature === index 
                    ? 'bg-gradient-medical text-white scale-110' 
                    : 'bg-primary-100 group-hover:bg-primary-200'
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${
                  currentFeature === index ? 'text-primary-600' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Progress indicator */}
                <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-medical transition-all duration-1000 ${
                      currentFeature === index ? 'w-full' : 'w-0'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.new_features')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced tools to break down language barriers in healthcare
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg hover-lift">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{t('home.quick_speech')}</h3>
              </div>
              <p className="text-gray-600 mb-4">
                {t('home.quick_speech_desc')}
              </p>
              <button
                onClick={() => setShowQuickSpeech(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                {t('home.try_quick_speech')}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                🏥 Medical Term Dictionary
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Common Symptoms</h4>
                    <p className="text-sm text-blue-700">Headache, Fever, Cough, Cold, Stomach pain</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Medicines</h4>
                    <p className="text-sm text-green-700">Paracetamol, Ibuprofen, Aspirin, Amoxicillin</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Body Parts</h4>
                    <p className="text-sm text-purple-700">Head, Chest, Stomach, Heart, Lungs</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">Emergency</h4>
                    <p className="text-sm text-orange-700">Call ambulance, Help needed, Emergency</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Voice Recognition</h4>
              <p className="text-gray-600 text-sm">Speak in your native language and get instant translations</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Text-to-Speech</h4>
              <p className="text-gray-600 text-sm">Listen to translations in natural-sounding voices</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Medical Terms</h4>
              <p className="text-gray-600 text-sm">Comprehensive medical terminology database</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-medical">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Break Language Barriers?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of healthcare professionals using MediLingo for better patient communication
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover-lift shadow-lg"
              >
                Start Free Trial
              </Link>
              <Link
                to="/chatbot"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Try ChatBot
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="transform transition-all duration-1000 hover:scale-105">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Join thousands of healthcare professionals
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              using MediLingo for better patient communication
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:bg-blue-50"
              >
                Get Started Now
              </Link>
              <Link
                to="/translate"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105"
              >
                Try Demo
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">5000+</div>
                <div className="text-blue-100">Healthcare Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">50K+</div>
                <div className="text-blue-100">Successful Translations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">99%</div>
                <div className="text-blue-100">User Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 left-4 flex flex-col space-y-3 z-40">
        <button
          onClick={() => setShowQuickSpeech(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
          title="Quick Speech"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
        <button
          onClick={() => alert('Language Learning feature coming soon!')}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
          title="Learn Languages"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </button>
      </div>

      {/* Modals */}
      <QuickSpeech 
        isOpen={showQuickSpeech} 
        onClose={() => setShowQuickSpeech(false)} 
      />
      
    </div>
  );
};

export default Home;
