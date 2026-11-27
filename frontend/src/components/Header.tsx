import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

type Props = {
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onLogout?: () => void;
  username?: string | null;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
};

const Header: React.FC<Props> = ({ onOpenLogin, onOpenRegister, onLogout, username, theme, onToggleTheme }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <motion.header
      className="header"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="header-logo">
        UCALEN
      </div>
      <nav className="header-nav">
        {/* Theme toggle button */}
        <motion.button
          className="theme-toggle"
          onClick={onToggleTheme}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="theme-toggle-text">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </motion.button>

        {username ? (
          <div className="user-menu">
            <motion.button
              className="user-avatar-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="user-avatar">
                {getInitial(username)}
              </div>
              <span className="user-name">{username}</span>
              <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
            </motion.button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  className="user-dropdown"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{getInitial(username)}</div>
                    <div className="dropdown-info">
                      <span className="dropdown-username">@{username}</span>
                      <span className="dropdown-status">Active</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => { onLogout?.(); setShowDropdown(false); }}>
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            {onOpenLogin && (
              <motion.button
                className="header-button"
                onClick={onOpenLogin}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Login</span>
              </motion.button>
            )}
            {onOpenRegister && (
              <motion.button
                className="header-button header-button--primary"
                onClick={onOpenRegister}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Sign Up</span>
              </motion.button>
            )}
          </>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;
