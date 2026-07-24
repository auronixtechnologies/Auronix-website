/**
 * AdminLogin.jsx — Premium split-panel admin login
 * Left: brand panel with feature highlights
 * Right: animated glassmorphism login form
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuth, saveToken, isLoggedIn } from '../../services/adminApi';
import './Admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="al-mesh" />
        <div className="al-grid" />
        <div className="al-orb al-orb-1" />
        <div className="al-orb al-orb-2" />
        <div className="al-orb al-orb-3" />
      </div>

      <div className="al-split">
        {/* ── Left Brand Panel ── */}
        <div className="al-brand-panel">
          <div className="al-logo-wrap">
            <div className="al-hex-icon">⬡</div>
            <div className="al-logo-text">
              <span className="al-brand-name">Auronix</span>
              <span className="al-brand-tag">Admin Portal</span>
            </div>
          </div>

          <h2 className="al-panel-headline">
            Manage your<br />
            <span>digital presence</span>
          </h2>

          <p className="al-panel-desc">
            Your secure command center for managing portfolio projects, team members,
            client case studies, and contact leads — all in one place.
          </p>

          <div className="al-panel-features">
            {[
              'Manage portfolio projects & team',
              'Track client case studies',
              'View & respond to contact leads',
              'Publish & edit blog posts',
            ].map((feat) => (
              <div className="al-feature-item" key={feat}>
                <div className="al-feature-dot" />
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="al-form-panel">
          <div className="al-card">
            <div className="al-card-header">
              <div className="al-welcome">Welcome back</div>
              <h1 className="al-title">Sign in to<br />your dashboard</h1>
              <p className="al-subtitle">Enter your credentials to access the admin portal.</p>
            </div>

            <form className="al-form" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="al-field">
                <label htmlFor="admin-email">Email Address</label>
                <div className="al-input-wrap">
                  <svg className="al-input-icon" width="17" height="17" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
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

              {/* Password */}
              <div className="al-field">
                <label htmlFor="admin-password">Password</label>
                <div className="al-input-wrap">
                  <svg className="al-input-icon" width="17" height="17" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="al-error">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
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
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="al-footer-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Restricted access — authorized personnel only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
