import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentLanguage, languages, changeLanguage, t } = useLanguage();
  const [profile, setProfile] = useState({
    role: 'patient',
    specialization: '',
    experience: 0,
    medicalHistory: '',
    emergencyContact: '',
    bloodType: '',
    allergies: '',
    medications: '',
    insuranceProvider: '',
    preferredLanguage: 'en'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [stats, setStats] = useState({
    translations: 0,
    medicines: 0,
    routines: 0,
    lastLogin: null
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        role: user.role || 'patient',
        specialization: user.profile?.specialization || '',
        experience: user.profile?.experience || 0,
        medicalHistory: user.profile?.medicalHistory || '',
        emergencyContact: user.profile?.emergencyContact || '',
        bloodType: user.profile?.bloodType || '',
        allergies: user.profile?.allergies || '',
        medications: user.profile?.medications || '',
        insuranceProvider: user.profile?.insuranceProvider || '',
        preferredLanguage: user.preferredLanguage || 'en'
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [historyRes, medicineRes, routineRes] = await Promise.all([
          axios.get('/api/history'),
          axios.get('/api/medicine'),
          axios.get('/api/routine')
        ]);
        
        setStats({
          translations: historyRes.data.history?.length || 0,
          medicines: medicineRes.data.medicines?.length || 0,
          routines: routineRes.data.routines?.length || 0,
          lastLogin: user?.lastLogin || new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.put('/api/auth/profile', profile);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
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
              Please log in to view and edit your profile.
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
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              {t('profile.title')}
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            {t('profile.subtitle')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Translations</p>
                <p className="text-3xl font-bold">{stats.translations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Medicines</p>
                <p className="text-3xl font-bold">{stats.medicines}</p>
              </div>
              <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Routines</p>
                <p className="text-3xl font-bold">{stats.routines}</p>
              </div>
              <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Last Login</p>
                <p className="text-sm font-bold">
                  {stats.lastLogin ? new Date(stats.lastLogin).toLocaleDateString() : 'Today'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'personal', name: 'Personal Info', icon: '👤' },
                { id: 'medical', name: 'Medical Info', icon: '🏥' },
                { id: 'preferences', name: 'Preferences', icon: '⚙️' },
                { id: 'security', name: 'Security', icon: '🔒' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'personal' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.username')}
                    </label>
                    <input
                      type="text"
                      value={user?.username || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.email')}
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

            {/* Language Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t('profile.language_preference')}
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('profile.select_language')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Choose your preferred language for the entire website interface
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">🌐</span>
                    <select
                      value={currentLanguage}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This will change the language of all interface elements including navigation, buttons, and form labels across the entire website.
                  </p>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                I am a:
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <label className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${
                  profile.role === 'patient' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={profile.role === 'patient'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏥</div>
                    <div className="text-lg font-semibold text-gray-900">{t('profile.role_patient')}</div>
                    <div className="text-sm text-gray-600">I need medical translation services</div>
                  </div>
                </label>

                <label className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${
                  profile.role === 'doctor' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={profile.role === 'doctor'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-4xl mb-2">👨‍⚕️</div>
                    <div className="text-lg font-semibold text-gray-900">{t('profile.role_doctor')}</div>
                    <div className="text-sm text-gray-600">I provide medical care to patients</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Doctor-specific fields */}
            {profile.role === 'doctor' && (
              <div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Professional Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.specialization')}
                  </label>
                  <select
                    name="specialization"
                    value={profile.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select your specialization</option>
                    <option value="general">General Practice</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="neurology">Neurology</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="surgery">Surgery</option>
                    <option value="emergency">Emergency Medicine</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.experience')}
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={profile.experience}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Patient-specific fields */}
            {profile.role === 'patient' && (
              <div className="space-y-4 p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.medical_history')}
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={profile.medicalHistory}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Briefly describe any relevant medical history, allergies, or conditions..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </div>
                ) : (
                  t('profile.update')
                )}
              </button>
            </div>
              </form>
            )}

            {activeTab === 'medical' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Medical Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type
                    </label>
                    <select
                      value={profile.bloodType}
                      onChange={handleChange}
                      name="bloodType"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      value={profile.emergencyContact}
                      onChange={handleChange}
                      name="emergencyContact"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Emergency contact number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies
                  </label>
                  <textarea
                    value={profile.allergies}
                    onChange={handleChange}
                    name="allergies"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="List any allergies you have"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Medications
                  </label>
                  <textarea
                    value={profile.medications}
                    onChange={handleChange}
                    name="medications"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="List current medications"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical History
                  </label>
                  <textarea
                    value={profile.medicalHistory}
                    onChange={handleChange}
                    name="medicalHistory"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your medical history"
                  />
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    value={profile.insuranceProvider}
                    onChange={handleChange}
                    name="insuranceProvider"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your insurance provider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language
                  </label>
                  <select
                    value={profile.preferredLanguage}
                    onChange={handleChange}
                    name="preferredLanguage"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ta">Tamil</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Security Notice
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>For security reasons, password changes and account deletion must be done through our support team. Contact us if you need assistance.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={user?.mobileNumber || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <input
                      type="text"
                      value={user?.role || 'patient'}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            {activeTab === 'personal' && (
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    t('profile.update')
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
