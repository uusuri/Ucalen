import React from 'react';
import { motion } from 'framer-motion';
import './WelcomeMessage.css';

const WelcomeMessage: React.FC = () => {
  return (
    <motion.div
      className="welcome-message"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.span
        className="welcome-text"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        Welcome
      </motion.span>
      <motion.div
        className="welcome-underline"
        initial={{ width: 0 }}
        animate={{ width: 'min(300px, 50vw)' }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
      />
    </motion.div>
  );
};

export default WelcomeMessage;
