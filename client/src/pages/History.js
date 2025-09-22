import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const History = () => {
  const { isAuthenticated } = useAuth();
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTranslations();
      loadLanguages();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, currentPage]);

  const loadLanguages = async () => {
    try {
      const response = await axios.get('/api/translate/languages');
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const loadTranslations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/history?page=${currentPage}&limit=10`);
      setTranslations(response.data.translations);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      setError('Failed to load translation history');
      console.error('Error loading translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this translation?')) {
      try {
        await axios.delete(`/api/history/${id}`);
        loadTranslations();
      } catch (error) {
        setError('Failed to delete translation');
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all translation history?')) {
      try {
        await axios.delete('/api/history');
        setTranslations([]);
        setCurrentPage(1);
      } catch (error) {
        setError('Failed to clear history');
      }
    }
  };

  const handleReTranslate = (translation) => {
    // This would redirect to translate page with pre-filled data
    // For now, we'll just show an alert
    alert(`Re-translating: "${translation.originalText}"`);
  };

  const handleSpeak = (text, targetLang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang === 'hi' ? 'hi-IN' : targetLang === 'ta' ? 'ta-IN' : targetLang;
      speechSynthesis.speak(utterance);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageName = (code) => {
    return languages.find(lang => lang.code === code)?.name || code;
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
              Please log in to view your translation history.
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Translation History
            </h1>
            <p className="text-xl text-gray-600">
              View and manage your past translations
            </p>
          </div>
          
          {translations.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
            >
              Clear All
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Loading translations...</span>
            </div>
          </div>
        ) : translations.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No translations yet</h3>
            <p className="text-gray-600 mb-6">Start translating to see your history here</p>
            <a
              href="/translate"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
            >
              Go to Translation
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {translations.map((translation) => (
              <div key={translation._id} className="bg-white rounded-xl shadow-lg p-6 hover-lift">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                        {getLanguageName(translation.detectedLanguage)} → {getLanguageName(translation.targetLanguage)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(translation.createdAt)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Original Text</h4>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {translation.originalText}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Translated Text</h4>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {translation.translatedText}
                        </p>
                      </div>
                    </div>
                    
                    {/* Medical Terms Section */}
                    {translation.medicalTerms && translation.medicalTerms.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Medical Terms Found
                        </h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {translation.medicalTerms.map((term, index) => (
                              <div key={index} className="bg-white p-2 rounded border border-blue-300">
                                <div className="font-medium text-sm text-blue-800">
                                  {term.translatedTerm}
                                </div>
                                <div className="text-xs text-blue-600 mt-1 line-clamp-2">
                                  {term.translatedDefinition.length > 60 
                                    ? term.translatedDefinition.substring(0, 60) + '...' 
                                    : term.translatedDefinition
                                  }
                                </div>
                                <div className="text-xs text-gray-500 mt-1 italic">
                                  ({term.originalTerm})
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleSpeak(translation.translatedText, translation.targetLanguage)}
                      className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                      title="Play audio"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleReTranslate(translation)}
                      className="p-2 text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors duration-200"
                      title="Re-translate"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(translation._id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
