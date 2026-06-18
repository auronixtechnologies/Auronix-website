/**
 * AdminLogin.jsx — Hidden admin login page
 * Accessible only at /auronix-admin (not linked from nav)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuth, saveToken, isLoggedIn } from '../../services/adminApi';
import './Admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn()) navigate('/auronix-admin/dashboard');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await adminAuth.login(email, password);
      saveToken(data.access_token);
      navigate('/auronix-admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-page">
      {/* Animated background */}
      <div className="al-bg">
        <div className="al-orb al-orb-1" />
        <div className="al-orb al-orb-2" />
        <div className="al-grid-lines" />
      </div>

      <div className="al-card">
        {/* Logo area */}
        <div className="al-logo">
          <div className="al-logo-icon">⬡</div>
          <div className="al-logo-text">
            <span className="al-brand">Auronix</span>
            <span className="al-admin-label">Admin Portal</span>
          </div>
        </div>

        <h1 className="al-title">Welcome back</h1>
        <p className="al-subtitle">Sign in to manage your portfolio</p>

        <form className="al-form" onSubmit={handleSubmit}>
          <div className="al-field">
            <label htmlFor="admin-email">Email Address</label>
            <div className="al-input-wrap">
              <svg className="al-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="al-input"
              />
            </div>
          </div>

          <div className="al-field">
            <label htmlFor="admin-password">Password</label>
            <div className="al-input-wrap">
              <svg className="al-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="al-input"
              />
              <button
                type="button"
                className="al-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="al-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <button
            id="admin-login-btn"
            type="submit"
            className="al-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="al-spinner" />
            ) : (
              <>
                Sign In
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="al-footer-note">
          🔒 Restricted access — authorized personnel only
        </p>
      </div>
    </div>
  );
}
