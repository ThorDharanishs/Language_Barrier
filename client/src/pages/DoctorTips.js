import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const DoctorTips = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTip, setNewTip] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    { value: 'general', label: t('category.general') },
    { value: 'emergency', label: t('category.emergency') },
    { value: 'medication', label: t('category.medication') },
    { value: 'nutrition', label: t('category.nutrition') },
    { value: 'exercise', label: t('category.exercise') },
    { value: 'mental_health', label: t('category.mental_health') },
    { value: 'pediatrics', label: t('category.pediatrics') },
    { value: 'geriatrics', label: t('category.geriatrics') },
    { value: 'women_health', label: t('category.women_health') },
    { value: 'men_health', label: t('category.men_health') }
  ];

  useEffect(() => {
    loadTips();
  }, []);

  const loadTips = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tips');
      setTips(response.data.tips || []);
    } catch (error) {
      console.error('Error loading tips:', error);
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || user?.role !== 'doctor') {
      setMessage('Only doctors can add tips');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const response = await axios.post('/api/tips', {
        ...newTip,
        doctorId: user.id,
        doctorName: user.username,
        doctorSpecialization: user.profile?.specialization || 'General Practice',
        doctorExperience: user.profile?.experience || 0
      });

      setTips(prev => [response.data.tip, ...prev]);
      setNewTip({ title: '', content: '', category: 'general' });
      setShowAddForm(false);
      setMessage('Tip added successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding tip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTip(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const translateText = async (text, targetLang) => {
    if (targetLang === 'en') return text;
    
    try {
      const response = await axios.post('/api/translate', {
        text: text,
        targetLang: targetLang
      });
      return response.data.translated_text;
    } catch (error) {
      console.error('Error translating text:', error);
      return text;
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'ta' ? 'ta-IN' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('nav.login')} Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to view medical tips and advice.
            </p>
            <a
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
            >
              Go to {t('nav.login')}
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
            {t('tips.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('tips.subtitle')}
          </p>
        </div>

        {/* Add Tip Button for Doctors */}
        {user?.role === 'doctor' && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
            >
              {showAddForm ? 'Cancel' : t('tips.add_tip')}
            </button>
          </div>
        )}

        {/* Add Tip Form */}
        {showAddForm && user?.role === 'doctor' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('tips.add_tip')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tips.tip_title')} *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newTip.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter tip title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tips.category')} *
                  </label>
                  <select
                    name="category"
                    value={newTip.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('tips.tip_content')} *
                </label>
                <textarea
                  name="content"
                  value={newTip.content}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter detailed medical tip and advice..."
                />
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${
                  message.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? t('common.loading') : t('tips.submit')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tips List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : tips.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tips.no_tips')}</h3>
            <p className="text-gray-600">Check back later for medical tips and advice.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <div key={tip.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tip.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categories.find(cat => cat.value === tip.category)?.label || tip.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => speakText(tip.content)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="Speak content"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  {tip.content}
                </p>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                      <p className="font-medium text-gray-900">
                        {t('tips.by_doctor')} {tip.doctorName}
                      </p>
                      <p className="text-xs">
                        {tip.doctorSpecialization} • {tip.doctorExperience} years experience
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs">
                        {t('tips.published')}: {new Date(tip.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorTips;

