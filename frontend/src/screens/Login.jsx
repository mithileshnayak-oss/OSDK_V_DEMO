import { useState } from 'react';
import Button from '../components/Button.jsx';
import { api, setToken } from '../api/client.js';

const DEMO_ROLES = [
  { role: 'participant', label: 'Participant Demo', screen: 'dashboard',          color: '#b87333' },
  { role: 'admin',       label: 'Admin Demo',       screen: 'admin-dashboard',    color: '#e74c3c' },
  { role: 'instructor',  label: 'Instructor Demo',  screen: 'instructor-tracks',  color: '#f0b429' },
  { role: 'judge',       label: 'Judge Demo',       screen: 'judge-events',       color: '#9d7de8' },
  { role: 'org_manager', label: 'Org Manager Demo', screen: 'org-events',         color: '#27ae60' },
];

const emailInputStyle = {
  padding: '11px 12px',
  background: 'var(--ch)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: 'var(--white)',
  fontSize: '0.88em',
  fontFamily: "'DM Mono', monospace",
  outline: 'none',
};

export default function Login({ onLogin }) {
  const [hoveredRole, setHoveredRole] = useState(null);
  const [busyRole, setBusyRole] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Email flow: null = show provider buttons, 'signin' | 'signup' = show form
  const [emailMode, setEmailMode] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState(null);

  const startDemo = async (role, screen) => {
    setBusyRole(role);
    setAuthError(null);
    try {
      const { token, userId, name, email } = await api.demoLogin(role);
      setToken(token);
      onLogin(role, { userId, name, email }, screen);
    } catch (e) {
      setAuthError(e.message || 'Demo login failed — is the backend running?');
      setBusyRole(null);
    }
  };

  const openEmail = (mode) => {
    setEmailMode(mode);
    setEmailError(null);
    setForm({ name: '', email: '', password: '' });
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setEmailBusy(true);
    setEmailError(null);
    try {
      const payload = emailMode === 'signup'
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const fn = emailMode === 'signup' ? api.register : api.login;
      const { token, userId, name, role } = await fn(payload);
      setToken(token);
      // defaultScreen=undefined lets App.jsx pick the role's default landing screen
      onLogin(role, { userId, name, email: form.email }, undefined);
    } catch (err) {
      setEmailError(err.message || 'Authentication failed');
      setEmailBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--black)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Radial copper glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background: 'radial-gradient(ellipse at center, rgba(184,115,51,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: 300,
          height: 300,
          background: 'radial-gradient(ellipse at center, rgba(157,125,232,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              background: 'var(--off)',
              border: '1px solid rgba(184,115,51,0.4)',
              borderRadius: 16,
              marginBottom: 20,
              boxShadow: '0 0 40px rgba(184,115,51,0.12)',
            }}
          >
            <span
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: '2.8em',
                color: 'var(--copper)',
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
            >
              V
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: '2.6em',
              letterSpacing: '0.18em',
              color: 'var(--white)',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            VANYAR
          </div>
          <div style={{ color: 'var(--gl)', fontSize: '0.82em', letterSpacing: '0.08em' }}>
            Training + Hackathon Platform
          </div>
        </div>

        {/* Auth buttons */}
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 16,
            padding: '28px 24px',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: '0.8em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {emailMode === 'signup' ? 'Sign Up' : 'Sign In'}
            </div>
            {emailMode && (
              <button
                onClick={() => { setEmailMode(null); setEmailError(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--gl)', cursor: 'pointer', fontSize: '0.78em' }}
              >
                ← back
              </button>
            )}
          </div>

          {!emailMode && (
            <>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: 'var(--white)',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  marginBottom: 10,
                  fontFamily: "'DM Mono', monospace",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M43.611 20.083H42V20H24V28H35.303C33.654 32.657 29.223 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24C4 35.045 12.955 44 24 44C35.045 44 44 35.045 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#FFC107"/>
                  <path d="M6.306 14.691L12.877 19.51C14.655 15.108 18.961 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691Z" fill="#FF3D00"/>
                  <path d="M24 44C29.166 44 33.86 42.023 37.409 38.808L31.219 33.57C29.211 35.091 26.715 36 24 36C18.798 36 14.381 32.683 12.717 28.054L6.195 33.079C9.505 39.556 16.227 44 24 44Z" fill="#4CAF50"/>
                  <path d="M43.611 20.083H42V20H24V28H35.303C34.511 30.237 33.072 32.166 31.216 33.571C31.217 33.57 31.218 33.57 31.219 33.569L37.409 38.807C36.971 39.205 44 34 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#1976D2"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => openEmail('signin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(184,115,51,0.08)',
                  border: '1px solid rgba(184,115,51,0.25)',
                  borderRadius: 8,
                  color: 'var(--copper)',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  fontFamily: "'DM Mono', monospace",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,115,51,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(184,115,51,0.08)'; }}
              >
                ✉ Continue with Email
              </button>
            </>
          )}

          {emailMode && (
            <form onSubmit={submitEmail} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {emailMode === 'signup' && (
                <input
                  type="text"
                  placeholder="Full name"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={emailInputStyle}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={emailInputStyle}
              />
              <input
                type="password"
                placeholder="Password"
                autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={emailInputStyle}
              />

              {emailError && (
                <div style={{ fontSize: '0.78em', color: 'var(--danger)' }}>{emailError}</div>
              )}

              <button
                type="submit"
                disabled={emailBusy}
                style={{
                  padding: '11px 12px',
                  background: 'var(--copper)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'var(--black)',
                  fontWeight: 600,
                  fontSize: '0.88em',
                  fontFamily: "'DM Mono', monospace",
                  cursor: emailBusy ? 'wait' : 'pointer',
                  opacity: emailBusy ? 0.7 : 1,
                }}
              >
                {emailBusy ? '…' : emailMode === 'signup' ? 'Create account' : 'Sign in'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.78em', color: 'var(--gl)', marginTop: 4 }}>
                {emailMode === 'signin' ? (
                  <>New here?{' '}
                    <button type="button" onClick={() => openEmail('signup')}
                      style={{ background: 'none', border: 'none', color: 'var(--copper)', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
                      Create an account
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button type="button" onClick={() => openEmail('signin')}
                      style={{ background: 'none', border: 'none', color: 'var(--copper)', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Demo quick access */}
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 16,
            padding: '24px',
          }}
        >
          <div style={{ fontSize: '0.78em', color: 'var(--gl)', marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Demo Access — Select Role
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DEMO_ROLES.map(({ role, label, screen, color }) => (
              <button
                key={role}
                onClick={() => startDemo(role, screen)}
                disabled={busyRole !== null}
                onMouseEnter={() => setHoveredRole(role)}
                onMouseLeave={() => setHoveredRole(null)}
                style={{
                  padding: '10px 14px',
                  background: hoveredRole === role ? `${color}22` : 'transparent',
                  border: `1px solid ${hoveredRole === role ? color + '60' : color + '30'}`,
                  borderRadius: 8,
                  color: color,
                  cursor: busyRole ? 'wait' : 'pointer',
                  opacity: busyRole && busyRole !== role ? 0.5 : 1,
                  fontSize: '0.78em',
                  fontFamily: "'DM Mono', monospace",
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  letterSpacing: '0.03em',
                }}
              >
                {busyRole === role ? 'Signing in…' : label}
              </button>
            ))}
          </div>
          {authError && (
            <div style={{ marginTop: 12, fontSize: '0.76em', color: 'var(--danger)' }}>
              {authError}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--gm)', fontSize: '0.75em' }}>
          Foundry Platform · Palantir OSDK
        </div>
      </div>
    </div>
  );
}
