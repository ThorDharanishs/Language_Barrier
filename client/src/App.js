import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Translate from './pages/Translate';
import History from './pages/History';
import ChatBot from './pages/ChatBot';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import DoctorTips from './pages/DoctorTips';
import Footer from './components/Footer';
import LanguageHelper from './components/LanguageHelper';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-medical-soft">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/translate" element={<Translate />} />
                <Route path="/history" element={<History />} />
                <Route path="/chatbot" element={<ChatBot />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/doctor-tips" element={<DoctorTips />} />
              </Routes>
            </main>
            <Footer />
            <LanguageHelper />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
