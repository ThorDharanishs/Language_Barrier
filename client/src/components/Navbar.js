import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { currentLanguage, languages, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.translate'), path: '/translate' },
    { name: t('nav.history'), path: '/history' },
    { name: t('nav.chatbot'), path: '/chatbot' },
    { name: t('nav.about'), path: '/about' },
  ];

  // Add doctor tips link if user is a doctor
  if (isAuthenticated && user?.role === 'doctor') {
    navLinks.push({ name: t('nav.doctor_tips'), path: '/doctor-tips' });
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-teal-700 transition-all duration-300">
              MediLingo
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-10 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="relative text-gray-700 hover:text-primary-600 font-semibold text-lg transition-colors duration-200 group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            ))}
          </div>

          {/* Language Selector and Profile - Right aligned */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <span className="text-lg">
                  {languages.find(lang => lang.code === currentLanguage)?.flag || '🌐'}
                </span>
                <span className="text-sm font-medium">
                  {languages.find(lang => lang.code === currentLanguage)?.name || 'English'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isLanguageOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Language Dropdown */}
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center space-x-3 ${
                        currentLanguage === lang.code
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                      {currentLanguage === lang.code && (
                        <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{user?.username}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      {t('nav.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{user?.username}</span>
                    </div>
                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                      >
                        {t('nav.profile')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                      >
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-center"
                  >
                    {t('nav.signup')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
