import { useState } from 'react';
import { cloudEnabled, supabase } from '../supabase/client';

export default function LoginPage({ onNavigate, onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const logoUrl = new URL('../assets/MacroMate Assets/MacroMate Icon and Assets/MacroMate Logo.png', import.meta.url).href;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setError(''); setMessage('');
    try { await onLogin({ email: formData.email.trim(), password: formData.password }); }
    catch (err) { setError(err.message || 'Could not log in. Check your details and connection.'); }
    finally { setLoading(false); }
  };

  async function requestPasswordReset(event) {
    event.preventDefault();
    if (loading) return;
    if (!formData.email.trim()) { setError('Enter your email first, then choose Forgot Password.'); return; }
    if (!cloudEnabled) { setError('Password reset requires Supabase mode.'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email.trim(), { redirectTo: window.location.origin });
      if (resetError) throw resetError;
      setMessage('If an account exists for that email, a password reset link has been sent.');
    } catch (err) { setError(err.message || 'Could not request a reset link.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="mm-fullscreen-auth">
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(8deg); }
        }
        @keyframes foodDriftA {
          0%, 100% { transform: translate(0, 0) rotate(-4deg); }
          35% { transform: translate(13px, -10px) rotate(3deg); }
          70% { transform: translate(-8px, -17px) rotate(7deg); }
        }
        @keyframes foodDriftB {
          0%, 100% { transform: translate(0, 0) rotate(5deg); }
          30% { transform: translate(-12px, -15px) rotate(-3deg); }
          65% { transform: translate(9px, -7px) rotate(-8deg); }
        }
        @keyframes foodDriftC {
          0%, 100% { transform: translate(0, 0) rotate(2deg); }
          40% { transform: translate(10px, 13px) rotate(-6deg); }
          75% { transform: translate(-12px, 5px) rotate(5deg); }
        }
        @keyframes foodDriftD {
          0%, 100% { transform: translate(0, 0) rotate(-5deg); }
          32% { transform: translate(-9px, 12px) rotate(5deg); }
          68% { transform: translate(14px, 4px) rotate(9deg); }
        }
        @keyframes pulseLogoGlow {
          0%, 100% { box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18); }
          50% { box-shadow: 0 24px 50px rgba(0, 0, 0, 0.28); transform: translateY(-4px); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .mm-fullscreen-auth {
          width: 100%;
          min-height: 100vh;
          min-height: 100svh;
          margin: 0;
          padding: 24px;
          overflow-x: hidden;
          overflow-y: auto;
          background: radial-gradient(circle at 8% 8%, #eff9ee 0, transparent 34%), #e4f2e5;
          display: grid;
          grid-template-columns: minmax(390px, 0.88fr) minmax(0, 1.12fr);
          gap: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
        }

        .mm-auth-left-panel {
          position: relative;
          min-height: calc(100svh - 48px);
          padding: clamp(20px, 3vw, 40px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 24px;
          background: rgba(255, 255, 255, 0.42);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 30px;
          z-index: 10;
          animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mm-btn-back {
          position: absolute;
          top: 24px;
          left: 24px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid #d5e8d8;
          border-radius: 50%;
          font-size: 1.25rem;
          cursor: pointer;
          color: #102a1c;
          padding: 0;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        .mm-btn-back:hover { transform: translateX(-3px); background: #ffffff; }

        .mm-auth-form-card {
          width: min(100%, 440px);
          margin: auto;
          padding: clamp(24px, 3vw, 38px);
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(190, 218, 196, 0.8);
          border-radius: 28px;
          box-shadow: 0 24px 70px rgba(18, 68, 40, 0.12);
        }

        .mm-auth-logo-header {
          text-align: center;
          margin: 0 0 28px;
        }

        .mm-auth-logo-img {
          height: 62px;
          width: auto;
          transition: transform 0.3s ease;
        }
        .mm-auth-logo-img:hover { transform: scale(1.08) rotate(-3deg); }

        .mm-auth-head-title {
          font-size: clamp(2rem, 3.2vw, 2.5rem);
          font-weight: 900;
          color: #0a1f13;
          margin: 10px 0 0;
          letter-spacing: -0.8px;
          line-height: 1.1;
        }

        .mm-auth-sub-title {
          font-size: 0.9rem;
          color: #607767;
          font-weight: 500;
          margin-top: 8px;
        }

        .mm-field-group {
          margin-bottom: 18px;
        }

        .mm-field-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 800;
          color: #294435;
          margin-bottom: 8px;
        }

        .mm-input-box {
          position: relative;
        }

        .mm-form-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1.5px solid #d6e6d9;
          background: #f7fbf7;
          font-size: 0.92rem;
          color: #0a1f13;
          outline: none;
          box-sizing: border-box;
          transition: all 0.25s ease;
        }

        .mm-form-input:focus {
          border-color: #108a43;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(16, 138, 67, 0.15);
        }

        .mm-eye-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          cursor: pointer;
          color: #45634e;
          font-size: 1rem;
          padding: 6px;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .mm-eye-icon:hover {
          color: #108a43;
          transform: translateY(-50%) scale(1.15);
        }

        .mm-forgot-link {
          display: block;
          text-align: right;
          font-size: 0.78rem;
          color: #108a43;
          text-decoration: none;
          font-weight: 800;
          margin-top: 8px;
        }
        .mm-forgot-link:hover { text-decoration: underline; }

        .mm-btn-green-submit {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, #118c4a, #08733b);
          color: #ffffff;
          font-weight: 900;
          font-size: 1.02rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(16, 138, 67, 0.22);
          transition: all 0.25s ease;
        }
        .mm-btn-green-submit:hover {
          background: #0c6e35;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(16, 138, 67, 0.38);
        }

        .mm-btn-white-alt {
          width: 100%;
          padding: 12px;
          border-radius: 14px;
          background: #ffffff;
          color: #0a1f13;
          font-weight: 800;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          margin-top: 12px;
          border: 1px solid #e1ece3;
          transition: all 0.25s ease;
        }
        .mm-btn-white-alt:hover {
          background: #f4fbf5;
          transform: translateY(-1px);
        }

        .mm-auth-right-waves {
          background:
            radial-gradient(circle at 18% 18%, rgba(161, 218, 171, 0.24), transparent 28%),
            radial-gradient(circle at 84% 78%, rgba(241, 207, 142, 0.2), transparent 30%),
            linear-gradient(145deg, #0d3821, #1e7e48);
          position: relative;
          width: 100%;
          min-height: calc(100svh - 48px);
          border-radius: 30px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 26px;
          padding: 48px;
          box-sizing: border-box;
        }

        .mm-icon-float {
          position: absolute;
          z-index: 2;
          display: block;
          width: auto;
          height: auto;
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          backdrop-filter: none;
          font-size: clamp(2.4rem, 3.2vw, 4rem);
          line-height: 1;
          pointer-events: none;
          animation: foodDriftA 6s infinite ease-in-out;
          filter: drop-shadow(0 8px 10px rgba(0,0,0,0.16));
        }
        .mm-icon-float-1 { top: 18%; left: 15%; font-size: clamp(3rem, 3.8vw, 4.5rem); animation: foodDriftA 5.2s infinite ease-in-out; }
        .mm-icon-float-2 { top: 25%; right: 14%; font-size: clamp(2.8rem, 3.5vw, 4rem); animation: foodDriftB 6s infinite ease-in-out 0.7s; }
        .mm-icon-float-3 { bottom: 25%; left: 22%; font-size: clamp(2.8rem, 3.7vw, 4.2rem); animation: foodDriftC 5.7s infinite ease-in-out 0.3s; }
        .mm-icon-float-4 { bottom: 17%; right: 17%; font-size: clamp(3rem, 3.9vw, 4.5rem); animation: foodDriftD 6.5s infinite ease-in-out 1s; }
        .mm-icon-float-5,
        .mm-icon-float-6,
        .mm-icon-float-7,
        .mm-icon-float-8,
        .mm-icon-float-9,
        .mm-icon-float-10,
        .mm-icon-float-11 {
          font-size: clamp(2rem, 2.5vw, 3rem);
        }
        .mm-icon-float-5 { top: 6%; left: 51%; font-size: clamp(2.2rem, 2.8vw, 3.2rem); animation: foodDriftC 6.4s infinite ease-in-out 0.4s; }
        .mm-icon-float-6 { top: 59%; left: 5%; font-size: clamp(2.5rem, 3vw, 3.5rem); animation: foodDriftD 5.8s infinite ease-in-out 1.1s; }
        .mm-icon-float-7 { top: 42%; right: 4%; font-size: clamp(2rem, 2.5vw, 3rem); animation: foodDriftA 6.8s infinite ease-in-out 0.7s; }
        .mm-icon-float-8 { bottom: 5%; left: 44%; font-size: clamp(2.2rem, 2.8vw, 3.2rem); animation: foodDriftB 5.4s infinite ease-in-out 1.4s; }
        .mm-icon-float-9 { top: 10%; right: 32%; font-size: clamp(2rem, 2.5vw, 3rem); animation: foodDriftD 6.1s infinite ease-in-out 0.3s; }
        .mm-icon-float-10 { bottom: 5%; right: 36%; font-size: clamp(2rem, 2.5vw, 3rem); animation: foodDriftC 7s infinite ease-in-out 1.7s; }
        .mm-icon-float-11 { top: 37%; left: 5%; font-size: clamp(2rem, 2.4vw, 2.8rem); animation: foodDriftC 6.6s infinite ease-in-out 0.9s; }

        .mm-center-brand-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          padding: 42px 54px;
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 32px;
          text-align: center;
          color: #102a1c;
          animation: pulseLogoGlow 6s ease-in-out infinite;
          z-index: 3;
          box-shadow: 0 24px 70px rgba(0,0,0,0.2);
        }

        .mm-center-logo-img {
          height: 64px;
          width: auto;
          margin-bottom: 8px;
        }

        .mm-center-brand-title {
          font-size: 2.2rem;
          font-weight: 900;
          margin: 0;
          color: #0a1f13;
          letter-spacing: -0.5px;
        }

        .mm-center-brand-sub {
          margin: 6px 0 0 0;
          font-size: 0.95rem;
          color: #1e7e48;
          font-weight: 800;
        }

        .mm-auth-promo-caption {
          z-index: 4;
          max-width: 430px;
          color: rgba(255,255,255,0.88);
          text-align: center;
          font-size: 1rem;
          line-height: 1.6;
        }

        .mm-auth-promo-points {
          z-index: 4;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }
        .mm-auth-promo-points span {
          padding: 9px 13px;
          border: 1px solid rgba(255,255,255,0.24);
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 700;
          backdrop-filter: blur(8px);
        }

        .mm-auth-footer {
          color: #587261;
          font-size: 0.78rem;
          text-align: center;
        }

        .mm-auth-error {
          margin: 0 0 16px;
          padding: 11px 13px;
          border: 1px solid #f1c7c7;
          border-radius: 12px;
          color: #8d2424;
          background: #fff3f3;
          font-size: 0.84rem;
        }

        .mm-auth-message {
          margin: 0 0 16px;
          padding: 11px 13px;
          border: 1px solid #c5e3cc;
          border-radius: 12px;
          color: #1d6035;
          background: #eff9f1;
          font-size: 0.84rem;
        }

        .mm-btn-green-submit:focus-visible,
        .mm-btn-white-alt:focus-visible,
        .mm-btn-back:focus-visible,
        .mm-eye-icon:focus-visible,
        .mm-forgot-link:focus-visible {
          outline: 3px solid #0b7840;
          outline-offset: 3px;
        }

        @media (max-width: 900px) {
          .mm-fullscreen-auth {
            grid-template-columns: minmax(340px, 0.95fr) minmax(0, 1.05fr);
            padding: 16px;
            gap: 14px;
          }
          .mm-auth-left-panel, .mm-auth-right-waves {
            min-height: calc(100svh - 32px);
          }
          .mm-center-brand-card { padding: 34px 32px; }
        }

        @media (max-width: 700px) {
          .mm-fullscreen-auth {
            display: flex;
            flex-direction: column;
            padding: 12px;
            gap: 12px;
          }
          .mm-auth-left-panel {
            min-height: auto;
            padding: 68px 12px 16px;
            border-radius: 24px;
          }
          .mm-btn-back { top: 16px; left: 16px; }
          .mm-auth-form-card { padding: 26px 22px; border-radius: 22px; }
          .mm-auth-right-waves {
            min-height: 340px;
            border-radius: 24px;
            padding: 28px 18px;
          }
          .mm-center-brand-card { padding: 24px 32px; border-radius: 24px; }
          .mm-center-logo-img { height: 48px; }
          .mm-center-brand-title { font-size: 1.8rem; }
          .mm-auth-promo-caption { font-size: 0.9rem; }
          .mm-icon-float-1, .mm-icon-float-2, .mm-icon-float-3, .mm-icon-float-4 { font-size: 2.4rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mm-fullscreen-auth *, .mm-fullscreen-auth *::before, .mm-fullscreen-auth *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Keep the original split-screen form; reserve added decoration for the showcase. */
        .mm-fullscreen-auth {
          min-height: 100vh;
          min-height: 100svh;
          padding: 0;
          overflow: hidden;
          background: #d4f3d2;
          grid-template-columns: 480px minmax(0, 1fr);
          gap: 0;
        }
        .mm-auth-left-panel {
          position: static;
          min-height: 0;
          padding: 40px 48px;
          justify-content: space-between;
          gap: 0;
          background: #d4f3d2;
          border: 0;
          border-radius: 0;
        }
        .mm-btn-back {
          position: static;
          background: none;
          border: 0;
          border-radius: 0;
          font-size: 1.6rem;
          width: 36px;
          height: 36px;
          justify-content: flex-start;
        }
        .mm-btn-back:hover { background: none; }
        .mm-auth-form-card {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 0;
          background: transparent;
          border: 0;
          border-radius: 0;
          box-shadow: none;
        }
        .mm-auth-logo-header { margin: -6px 0 24px; }
        .mm-auth-logo-img { height: 56px; }
        .mm-auth-head-title {
          font-size: 2.5rem;
          margin: 6px 0 0;
          line-height: normal;
        }
        .mm-auth-sub-title {
          color: #2c4a38;
          font-weight: 800;
          margin-top: 2px;
        }
        .mm-field-group { margin-bottom: 16px; }
        .mm-field-label { color: #0a1f13; margin-bottom: 6px; }
        .mm-form-input {
          padding: 12px 16px;
          border-radius: 18px;
          border-color: #bce1c3;
          background: #edf8ee;
        }
        .mm-eye-icon { color: inherit; opacity: 0.75; }
        .mm-eye-icon:hover { color: inherit; opacity: 1; }
        .mm-forgot-link { margin-top: 6px; }
        .mm-btn-green-submit {
          padding: 13px;
          border-radius: 22px;
          background: #108a43;
          box-shadow: 0 6px 18px rgba(16, 138, 67, 0.28);
        }
        .mm-btn-white-alt {
          padding: 12px;
          border-radius: 22px;
          border: 0;
          margin-top: 10px;
        }
        .mm-auth-right-waves {
          min-height: 0;
          border-radius: 0;
          flex-direction: column;
          gap: 26px;
          padding: 48px;
        }
        .mm-center-brand-card { padding: 32px 48px; border-radius: 32px; }
        @media (max-width: 900px) {
          .mm-fullscreen-auth { grid-template-columns: minmax(340px, 42%) minmax(0, 1fr); padding: 0; gap: 0; }
          .mm-auth-left-panel, .mm-auth-right-waves { min-height: 100svh; }
          .mm-auth-left-panel { padding: 32px 28px; }
        }
        @media (max-width: 700px) {
          .mm-fullscreen-auth { display: flex; flex-direction: column; padding: 0; gap: 0; }
          .mm-auth-left-panel { min-height: 100svh; padding: 24px; }
          .mm-btn-back { position: static; width: 36px; height: 36px; }
          .mm-auth-right-waves { min-height: 420px; padding: 28px 18px; }
          .mm-icon-float { font-size: 2.25rem; }
          .mm-icon-float-1 { top: 18%; left: 8%; }
          .mm-icon-float-2 { top: 25%; right: 8%; }
          .mm-icon-float-3 { bottom: 24%; left: 12%; }
          .mm-icon-float-4 { bottom: 17%; right: 10%; }
          .mm-icon-float-5 { top: 5%; left: 52%; }
          .mm-icon-float-6 { top: 58%; left: 3%; }
          .mm-icon-float-7 { top: 43%; right: 3%; }
          .mm-icon-float-8 { bottom: 4%; left: 43%; }
          .mm-icon-float-9 { top: 8%; right: 29%; }
          .mm-icon-float-10 { bottom: 4%; right: 34%; }
          .mm-icon-float-11 { top: 36%; left: 2%; }
        }
      `}</style>

      {/* Left Form Panel */}
      <div className="mm-auth-left-panel">
        <button className="mm-btn-back" onClick={() => onNavigate && onNavigate('welcome')} title="Back to Welcome">
          ←
        </button>

        <div className="mm-auth-form-card">
          <div className="mm-auth-logo-header">
            <img src={logoUrl} alt="MacroMate Logo" className="mm-auth-logo-img" />
            <h2 className="mm-auth-head-title">Log in</h2>
            <p className="mm-auth-sub-title">Welcome to MacroMate</p>
          </div>

          <form onSubmit={handleLogin}>
            {error && <p className="mm-auth-error" role="alert">{error}</p>}
            {message && <p className="mm-auth-message" role="status">{message}</p>}
            <div className="mm-field-group">
              <label className="mm-field-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                aria-label="Email" autoComplete="email" disabled={loading}
                className="mm-form-input"
                placeholder="you@gmail.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="mm-field-group">
              <label className="mm-field-label" htmlFor="login-password">Password</label>
              <div className="mm-input-box">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  aria-label="Password" autoComplete="current-password" disabled={loading}
                  className="mm-form-input"
                  placeholder="••••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button type="button" className="mm-eye-icon" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>👁️</button>
              </div>
              <a href="#forgot" className="mm-forgot-link" onClick={requestPasswordReset}>
                Forgot Password
              </a>
            </div>

            <button type="submit" className="mm-btn-green-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <button className="mm-btn-white-alt" onClick={() => onNavigate && onNavigate('signup')}>
            I don't have an account
          </button>
        </div>

        <div className="mm-auth-footer">
          MacroMate © 2026 • Group 8
        </div>
      </div>

      <div className="mm-auth-right-waves">
        <span className="mm-icon-float mm-icon-float-1" aria-hidden="true">🥑</span>
        <span className="mm-icon-float mm-icon-float-2" aria-hidden="true">🍎</span>
        <span className="mm-icon-float mm-icon-float-3" aria-hidden="true">🥒</span>
        <span className="mm-icon-float mm-icon-float-4" aria-hidden="true">🫐</span>
        <span className="mm-icon-float mm-icon-float-5" aria-hidden="true">🍌</span>
        <span className="mm-icon-float mm-icon-float-6" aria-hidden="true">🥦</span>
        <span className="mm-icon-float mm-icon-float-7" aria-hidden="true">🍓</span>
        <span className="mm-icon-float mm-icon-float-8" aria-hidden="true">🥕</span>
        <span className="mm-icon-float mm-icon-float-9" aria-hidden="true">🍊</span>
        <span className="mm-icon-float mm-icon-float-10" aria-hidden="true">🍉</span>
        <span className="mm-icon-float mm-icon-float-11" aria-hidden="true">🍇</span>

        <div className="mm-center-brand-card">
          <img src={logoUrl} alt="MacroMate Logo" className="mm-center-logo-img" />
          <h2 className="mm-center-brand-title">MacroMate</h2>
          <p className="mm-center-brand-sub">Your macros, mastered.</p>
        </div>
        <p className="mm-auth-promo-caption">A calmer way to build healthy habits, one small check-in at a time.</p>
        <div className="mm-auth-promo-points" aria-label="MacroMate benefits">
          <span>🥗 Nutrition tracking</span>
          <span>💚 Wellness journal</span>
          <span>📈 Progress insights</span>
        </div>
      </div>
    </div>
  );
}