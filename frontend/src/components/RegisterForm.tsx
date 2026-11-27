import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Modal.css';
import { API_BASE } from '../config';

type Props = {
  onClose: () => void;
  onRegisterSuccess?: (username: string) => void;
};

const RegisterForm: React.FC<Props> = ({ onClose, onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Register
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(text || 'Register failed');
        return;
      }

      // Auto-login after successful registration
      const loginRes = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const loginText = await loginRes.text();

      if (loginRes.ok && loginText.startsWith('jwt ')) {
        const token = loginText.substring(4);
        localStorage.setItem('token', token);
        setSuccess(true);
        setTimeout(() => {
          onRegisterSuccess?.(username);
          onClose();
        }, 1000);
      } else {
        // Registration successful but auto-login failed
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Create Account</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {success ? (
          <motion.div
            className="modal-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="success-icon">✓</span>
            <p>Account created successfully!</p>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="modal-form">
            <label>
              <span className="label-text">Username</span>
              <div className="input-wrapper">
                <span className="input-icon">@</span>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="your_username"
                  required
                />
              </div>
            </label>
            <label>
              <span className="label-text">Email</span>
              <div className="input-wrapper">
                <span className="input-icon">@</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>
            <label>
              <span className="label-text">Password</span>
              <div className="input-wrapper">
                <span className="input-icon">*</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </label>
            {error && (
              <motion.div
                className="modal-error"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {error}
              </motion.div>
            )}
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="modal-secondary">Cancel</button>
              <button type="submit" className="modal-primary" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : 'Create Account'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default RegisterForm;
