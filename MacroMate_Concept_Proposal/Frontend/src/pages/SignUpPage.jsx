import { useState } from 'react';

export default function SignUpPage({ onNavigate, onSignUp }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', agreed: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const logoUrl = new URL('../assets/MacroMate Assets/MacroMate Icon and Assets/MacroMate Logo.png', import.meta.url).href;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!formData.agreed) {
      setError('Please review and agree to the terms before creating an account.');
      return;
    }
    if (!formData.name.trim()) { setError('Enter your name.'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      const result = await onSignUp({ name: formData.name.trim(), email: formData.email.trim(), password: formData.password });
      setMessage(result || 'Account created.');
      setFormData((current) => ({ ...current, password: '' }));
    } catch (err) { setError(err.message || 'Could not create your account. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mm-fullscreen-auth">
      <style>{`
        @keyframes floatCard1 {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(0deg); }
        }
        @keyframes floatCard2 {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-16px) rotate(1deg); }
        }
        @keyframes pulseGlowOrb {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.18); opacity: 0.65; }
        }
        @keyframes foodDriftA {
          0%, 100% { transform: translate(0, 0) rotate(-4deg); }
          35% { transform: translate(12px, -10px) rotate(3deg); }
          70% { transform: translate(-7px, -15px) rotate(7deg); }
        }
        @keyframes foodDriftB {
          0%, 100% { transform: translate(0, 0) rotate(5deg); }
          30% { transform: translate(-11px, -13px) rotate(-3deg); }
          65% { transform: translate(8px, -6px) rotate(-8deg); }
        }
        @keyframes foodDriftC {
          0%, 100% { transform: translate(0, 0) rotate(2deg); }
          40% { transform: translate(9px, 11px) rotate(-6deg); }
          75% { transform: translate(-10px, 4px) rotate(5deg); }
        }
        @keyframes foodDriftD {
          0%, 100% { transform: translate(0, 0) rotate(-5deg); }
          32% { transform: translate(-8px, 10px) rotate(5deg); }
          68% { transform: translate(12px, 3px) rotate(9deg); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .mm-fullscreen-auth {
          width: 100%;
          min-width: 0;
          min-height: 100vh;
          min-height: 100svh;
          margin: 0;
          padding: 24px;
          overflow-x: hidden;
          overflow-y: auto;
          background: radial-gradient(circle at 8% 8%, #eff9ee 0, transparent 34%), #e4f2e5;
          display: grid;
          grid-template-columns: minmax(410px, 0.9fr) minmax(0, 1.1fr);
          gap: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
        }

        .mm-auth-left-panel {
          position: relative;
          min-width: 0;
          min-height: calc(100svh - 48px);
          padding: 68px clamp(18px, 3vw, 40px) 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 20px;
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
          width: min(100%, 480px);
          box-sizing: border-box;
          margin: auto;
          padding: clamp(24px, 3vw, 36px);
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(190, 218, 196, 0.8);
          border-radius: 28px;
          box-shadow: 0 24px 70px rgba(18, 68, 40, 0.12);
        }

        .mm-auth-logo-header {
          text-align: center;
          margin: 0 0 22px;
        }

        .mm-auth-logo-img {
          height: 58px;
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
          margin-bottom: 16px;
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
          padding: 13px 16px;
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
          color: #45634e;
          cursor: pointer;
          font-size: 1rem;
          padding: 6px;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .mm-eye-icon:hover {
          color: #108a43;
          transform: translateY(-50%) scale(1.15);
        }

        .mm-terms-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: #0a1f13;
          font-weight: 800;
          margin: 14px 0 18px;
          line-height: 1.45;
        }

        .mm-terms-line a {
          color: #108a43;
          text-decoration: none;
          font-weight: 900;
        }
        .mm-terms-line a:hover { text-decoration: underline; }

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

        .mm-auth-right-showcase {
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
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          box-sizing: border-box;
        }

        .mm-signup-food {
          position: absolute;
          z-index: 1;
          font-size: clamp(2rem, 3vw, 3.4rem);
          line-height: 1;
          pointer-events: none;
          filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.16));
        }
        .mm-signup-food-1 { top: 8%; left: 16%; animation: foodDriftA 5.4s infinite ease-in-out; }
        .mm-signup-food-2 { top: 21%; right: 7%; animation: foodDriftB 6.1s infinite ease-in-out 0.6s; }
        .mm-signup-food-3 { top: 48%; left: 6%; animation: foodDriftC 5.8s infinite ease-in-out 0.2s; }
        .mm-signup-food-4 { top: 38%; right: 5%; animation: foodDriftD 6.5s infinite ease-in-out 1s; }
        .mm-signup-food-5 { bottom: 8%; left: 18%; animation: foodDriftB 5.7s infinite ease-in-out 0.8s; }
        .mm-signup-food-6 { bottom: 5%; right: 42%; animation: foodDriftC 6.8s infinite ease-in-out 1.2s; }
        .mm-signup-food-7 { top: 68%; right: 12%; animation: foodDriftA 6.3s infinite ease-in-out 0.4s; }

        .mm-glow-orb-1 {
          position: absolute;
          top: 12%;
          right: 15%;
          width: 320px;
          height: 320px;
          background: rgba(165, 214, 167, 0.22);
          filter: blur(60px);
          border-radius: 50%;
          animation: pulseGlowOrb 8s infinite ease-in-out;
        }

        .mm-glow-orb-2 {
          position: absolute;
          bottom: 12%;
          left: 10%;
          width: 280px;
          height: 280px;
          background: rgba(226, 190, 130, 0.18);
          filter: blur(50px);
          border-radius: 50%;
          animation: pulseGlowOrb 10s infinite ease-in-out reverse;
        }

        .mm-showcase-glass-card {
          background: rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 28px;
          padding: 40px;
          width: min(440px, 100%);
          color: #ffffff;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
          animation: floatCard1 6s ease-in-out infinite;
          z-index: 2;
        }

        .mm-showcase-badge {
          display: inline-block;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.22);
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 18px;
        }

        .mm-showcase-title {
          font-size: 1.75rem;
          font-weight: 900;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        .mm-showcase-sub {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 28px;
          line-height: 1.45;
        }

        .mm-macro-preview-row {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .mm-preview-bar-group label {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .mm-preview-track {
          height: 10px;
          background: rgba(255, 255, 255, 0.22);
          border-radius: 10px;
          overflow: hidden;
        }

        .mm-preview-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 1s ease;
        }

        .mm-floating-sticker {
          position: absolute;
          bottom: 100px;
          right: 80px;
          background: #ffffff;
          color: #102a1c;
          padding: 16px 24px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.28);
          animation: floatCard2 7s ease-in-out infinite;
          z-index: 3;
        }

        .mm-sticker-icon { font-size: 2rem; }
        .mm-sticker-text strong { display: block; font-size: 1rem; font-weight: 900; }
        .mm-sticker-text span { font-size: 0.78rem; color: #557361; font-weight: 700; }
        .mm-signup-promo-caption {
          position: absolute;
          z-index: 3;
          right: 24px;
          bottom: 28px;
          left: 24px;
          margin: 0;
          color: rgba(255, 255, 255, 0.94);
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1.45;
          text-align: center;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .mm-auth-footer {
          color: #587261;
          font-size: 0.78rem;
          text-align: center;
        }
        .mm-auth-error {
          margin: 0 0 14px;
          padding: 11px 13px;
          border: 1px solid #f1c7c7;
          border-radius: 12px;
          color: #8d2424;
          background: #fff3f3;
          font-size: 0.84rem;
        }
        .mm-auth-message {
          margin: 0 0 14px;
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
        .mm-eye-icon:focus-visible {
          outline: 3px solid #0b7840;
          outline-offset: 3px;
        }

        @media (max-width: 900px) {
          .mm-fullscreen-auth {
            grid-template-columns: minmax(370px, 0.95fr) minmax(0, 1.05fr);
            padding: 16px;
            gap: 14px;
          }
          .mm-auth-left-panel, .mm-auth-right-showcase {
            min-height: calc(100svh - 32px);
          }
          .mm-showcase-glass-card { padding: 30px; }
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
          .mm-auth-form-card { padding: 24px 20px; border-radius: 22px; }
          .mm-auth-right-showcase {
            min-height: 420px;
            border-radius: 24px;
            padding: 26px 18px 90px;
          }
          .mm-showcase-glass-card { padding: 26px; border-radius: 22px; }
          .mm-floating-sticker { right: 16px; bottom: 16px; padding: 11px 15px; }
          .mm-sticker-icon { font-size: 1.5rem; }
          .mm-signup-promo-caption { right: 12px; bottom: 10px; left: 12px; font-size: 0.76rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mm-fullscreen-auth *, .mm-fullscreen-auth *::before, .mm-fullscreen-auth *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }

        .mm-fullscreen-auth {
          width: 100%;
          min-height: 100vh;
          min-height: 100svh;
          padding: 0;
          overflow: hidden;
          background: #d3f2d2;
          grid-template-columns: minmax(420px, 33%) minmax(0, 1fr);
          gap: 0;
        }
        .mm-auth-left-panel {
          min-height: 100vh;
          min-height: 100svh;
          padding: 36px clamp(28px, 3.1vw, 52px);
          justify-content: center;
          gap: 0;
          background: #d3f2d2;
          border: 0;
          border-radius: 0;
        }
        .mm-btn-back {
          top: 42px;
          left: 48px;
          width: 36px;
          height: 36px;
          background: transparent;
          border: 0;
          border-radius: 0;
          font-size: 1.6rem;
        }
        .mm-btn-back:hover { background: transparent; }
        .mm-auth-form-card {
          width: 100%;
          max-width: 480px;
          margin: auto;
          padding: 0;
          background: transparent;
          border: 0;
          border-radius: 0;
          box-shadow: none;
        }
        .mm-auth-logo-header { margin: 0 0 24px; }
        .mm-auth-logo-img { height: 50px; }
        .mm-auth-head-title { margin-top: 16px; font-size: 2.8rem; }
        .mm-auth-sub-title { color: #234a31; font-weight: 800; }
        .mm-field-label { color: #071b0e; }
        .mm-form-input {
          padding: 13px 16px;
          border-color: #b7dfbc;
          border-radius: 20px;
          background: #edf8ee;
        }
        .mm-terms-line { margin: 14px 0 18px; }
        .mm-terms-line a { color: #e53935; }
        .mm-btn-green-submit,
        .mm-btn-white-alt { border-radius: 24px; }
        .mm-btn-white-alt {
          border: 0;
          margin-top: 10px;
        }
        .mm-auth-footer { margin-top: 20px; }
        .mm-auth-right-showcase {
          min-height: 100vh;
          min-height: 100svh;
          padding: 40px;
          border-radius: 0;
        }
        .mm-showcase-glass-card { width: min(394px, 100%); padding: 32px; }
        .mm-floating-sticker { right: 6%; bottom: 10%; }
        .mm-signup-promo-caption { display: none; }

        @media (max-width: 760px) {
          .mm-fullscreen-auth {
            display: flex;
            flex-direction: column;
            min-height: 100svh;
            overflow-y: auto;
          }
          .mm-auth-left-panel {
            min-height: 100svh;
            padding: 72px 28px 28px;
          }
          .mm-btn-back { top: 24px; left: 28px; }
          .mm-auth-form-card { margin: auto; }
          .mm-auth-right-showcase {
            min-height: 76svh;
            padding: 36px 20px 88px;
          }
          .mm-showcase-glass-card { width: min(360px, 100%); padding: 26px; }
          .mm-floating-sticker { right: 16px; bottom: 28px; padding: 11px 15px; }
          .mm-signup-food-1 { top: 8%; left: 8%; }
          .mm-signup-food-2 { top: 18%; right: 7%; }
          .mm-signup-food-3 { top: 48%; left: 4%; }
          .mm-signup-food-4 { top: 40%; right: 4%; }
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
            <h2 className="mm-auth-head-title">Sign Up</h2>
            <p className="mm-auth-sub-title">Welcome to MacroMate - Let's create account</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <p className="mm-auth-error" role="alert">{error}</p>}
            {message && <p className="mm-auth-message" role="status">{message}</p>}
            <div className="mm-field-group">
              <label className="mm-field-label" htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                aria-label="Name" maxLength="120" autoComplete="name" disabled={loading}
                className="mm-form-input"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="mm-field-group">
              <label className="mm-field-label" htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
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
              <label className="mm-field-label" htmlFor="signup-password">Password</label>
              <div className="mm-input-box">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  aria-label="Password" minLength="8" maxLength="128" autoComplete="new-password" disabled={loading}
                  className="mm-form-input"
                  placeholder="••••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button type="button" className="mm-eye-icon" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
                  👁️
                </button>
              </div>
            </div>

            <div className="mm-terms-line">
              <input
                type="checkbox"
                id="chkTerms"
                checked={formData.agreed}
                onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
              />
              <label htmlFor="chkTerms">
                By signing up, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="mm-btn-green-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <button className="mm-btn-white-alt" onClick={() => onNavigate && onNavigate('login')}>
            Already have an account
          </button>
        </div>

        <div className="mm-auth-footer">
          MacroMate © 2026 • Group 8
        </div>
      </div>

      <div className="mm-auth-right-showcase">
        <div className="mm-glow-orb-1" />
        <div className="mm-glow-orb-2" />
        <span className="mm-signup-food mm-signup-food-1" aria-hidden="true">🍓</span>
        <span className="mm-signup-food mm-signup-food-2" aria-hidden="true">🥑</span>
        <span className="mm-signup-food mm-signup-food-3" aria-hidden="true">🍊</span>
        <span className="mm-signup-food mm-signup-food-4" aria-hidden="true">🥕</span>
        <span className="mm-signup-food mm-signup-food-5" aria-hidden="true">🫐</span>
        <span className="mm-signup-food mm-signup-food-6" aria-hidden="true">🍌</span>
        <span className="mm-signup-food mm-signup-food-7" aria-hidden="true">🥦</span>

        <div className="mm-showcase-glass-card">
          <span className="mm-showcase-badge">✨ REAL-TIME TRACKING</span>
          <h3 className="mm-showcase-title">Fuel Your Day</h3>
          <p className="mm-showcase-sub">Balanced nutrition and accessible logging built for your lifestyle.</p>

          <div className="mm-macro-preview-row">
            <div className="mm-preview-bar-group">
              <label><span>Calories</span><span>1,842 / 2,200 kcal</span></label>
              <div className="mm-preview-track"><div className="mm-preview-fill" style={{ width: '83%', background: '#81c784' }} /></div>
            </div>

            <div className="mm-preview-bar-group">
              <label><span>Protein</span><span>98 / 150 g</span></label>
              <div className="mm-preview-track"><div className="mm-preview-fill" style={{ width: '65%', background: '#64b5f6' }} /></div>
            </div>

            <div className="mm-preview-bar-group">
              <label><span>Carbs</span><span>210 / 270 g</span></label>
              <div className="mm-preview-track"><div className="mm-preview-fill" style={{ width: '77%', background: '#ffb74d' }} /></div>
            </div>
          </div>
        </div>

        <div className="mm-floating-sticker">
          <span className="mm-sticker-icon">🥗</span>
          <div className="mm-sticker-text">
            <strong>Healthy Rhythm</strong>
            <span>+250 kcal Logged</span>
          </div>
        </div>
        <p className="mm-signup-promo-caption">Start with one simple check-in. Build a routine that feels good.</p>
      </div>
    </div>
  );
}