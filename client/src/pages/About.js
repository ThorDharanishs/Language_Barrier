import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleScroll = () => {
    const sections = document.querySelectorAll('.animate-section');
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        setVisibleSections(prev => new Set([...prev, index]));
      }
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent animate-pulse">
              {t('about.title')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-20 animate-section">
          <div className={`bg-gradient-medical rounded-2xl p-8 md:p-12 text-white transform transition-all duration-1000 delay-200 ${visibleSections.has(0) ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
            <h2 className="text-3xl font-bold mb-6 text-center">{t('about.mission')}</h2>
            <p className="text-lg text-blue-100 leading-relaxed text-center max-w-4xl mx-auto">
              {t('about.mission_desc')}
            </p>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="mb-20 animate-section">
          <h2 className={`text-3xl font-bold text-gray-900 mb-8 text-center transform transition-all duration-1000 delay-300 ${visibleSections.has(1) ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>What We Do</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className={`bg-white rounded-xl p-8 shadow-lg hover-lift transform transition-all duration-1000 delay-400 ${visibleSections.has(1) ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Translation</h3>
              <p className="text-gray-600 leading-relaxed">
                Instant translation of medical conversations between doctors and patients in over 12 languages, ensuring clear communication during critical healthcare moments.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover-lift">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Medical Term Explanation</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced AI-powered medical terminology detection with layman explanations, helping patients understand complex medical terms in their native language.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover-lift">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Voice Integration</h3>
              <p className="text-gray-600 leading-relaxed">
                Speech-to-text and text-to-speech capabilities in multiple languages, making healthcare communication accessible for patients with different abilities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover-lift">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Health Assistant</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered chatbot that helps patients with medical doubts, medicine tracking, and health routine management in their preferred language.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover-lift">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure & Private</h3>
              <p className="text-gray-600 leading-relaxed">
                HIPAA-compliant platform with end-to-end encryption, ensuring patient data privacy and security in all medical communications.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover-lift">
              <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Fast & Reliable</h3>
              <p className="text-gray-600 leading-relaxed">
                Lightning-fast translation with 99.9% uptime, ensuring healthcare providers can rely on our service during critical medical situations.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Input Text</h3>
              <p className="text-gray-600 text-sm">
                Enter medical text or use voice input in any supported language
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Processing</h3>
              <p className="text-gray-600 text-sm">
                Our AI detects medical terms and translates content accurately
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Explanation</h3>
              <p className="text-gray-600 text-sm">
                Medical terms are highlighted with easy-to-understand explanations
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear Communication</h3>
              <p className="text-gray-600 text-sm">
                Both parties understand each other perfectly in their preferred language
              </p>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="mb-20">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Impact</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
                <div className="text-gray-600">Translations Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">12+</div>
                <div className="text-gray-600">Languages Supported</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
                <div className="text-gray-600">Healthcare Providers</div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Vision</h2>
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <p className="text-lg text-gray-600 leading-relaxed text-center max-w-4xl mx-auto">
              We envision a world where language is never a barrier to receiving quality healthcare. 
              Our goal is to make medical communication seamless, accurate, and accessible to everyone, 
              regardless of their linguistic background. Through continuous innovation and AI advancement, 
              we're building the future of inclusive healthcare communication.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gradient-medical rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Healthcare Communication?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of healthcare providers who are already using MediLingo to break down language barriers and provide better care to their patients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover-lift shadow-lg"
              >
                Get Started Free
              </a>
              <a
                href="/translate"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Try Demo
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;


