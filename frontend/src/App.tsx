import React, { useState, useEffect } from 'react';
import WelcomeMessage from './components/WelcomeMessage';
import Header from './components/Header';
import CustomCalendar from './components/Calendar';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { useTheme } from './hooks/useTheme';
import { USE_BACKEND } from './config';

// Helper to decode JWT payload
const decodeToken = (token: string): { sub?: string; exp?: number } | null => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// Check if token is expired
const isTokenValid = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;
  return decoded.exp * 1000 > Date.now();
};

function App() {
  const [showHeader, setShowHeader] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  // Restore session from localStorage on mount
  useEffect(() => {
    if (!USE_BACKEND) return;

    const token = localStorage.getItem('token');
    if (token && isTokenValid(token)) {
      const decoded = decodeToken(token);
      if (decoded?.sub) {
        setUsername(decoded.sub);
      }
    } else if (token) {
      // Token expired, remove it
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowHeader(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const openLogin = () => setShowLogin(true);
  const openRegister = () => setShowRegister(true);
  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLoginSuccess = (user: string) => {
    setUsername(user);
    closeModals();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername(null);
  };

  return (
    <div className="App">
      <AnimatePresence>
        {!showHeader && (
          <motion.div
            key="welcome"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeMessage />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHeader && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Header
              onOpenLogin={USE_BACKEND && !username ? openLogin : undefined}
              onOpenRegister={USE_BACKEND && !username ? openRegister : undefined}
              onLogout={handleLogout}
              username={username}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
            <CustomCalendar username={username} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogin && (
          <LoginForm onClose={closeModals} onLoginSuccess={handleLoginSuccess} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegister && (
          <RegisterForm onClose={closeModals} onRegisterSuccess={handleLoginSuccess} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
