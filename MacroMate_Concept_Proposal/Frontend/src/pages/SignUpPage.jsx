import { useState } from 'react';

export default function SignUpPage({ onNavigate }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', agreed: true });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const logoUrl = new URL('../assets/MacroMate Assets/MacroMate Icon and Assets/MacroMate Logo.png', import.meta.url).href;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreed) {
      alert('Please agree to our Terms and Privacy Policy to continue.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onNavigate) onNavigate('login');
    }, 600);
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
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* 100% Full Screen Container */
        .mm-fullscreen-auth {
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: #d4f3d2;
          display: grid;
          grid-template-columns: 480px 1fr;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
        }

        /* Left Form Panel */
        .mm-auth-left-panel {
          padding: 40px 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #d4f3d2;
          z-index: 10;
          animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mm-btn-back {
          background: none;
          border: none;
          font-size: 1.6rem;
          cursor: pointer;
          color: #102a1c;
          padding: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          transition: transform 0.2s ease;
        }
        .mm-btn-back:hover { transform: translateX(-4px); }

        .mm-auth-logo-header {
          text-align: center;
          margin-top: -10px;
          margin-bottom: 18px;
        }

        .mm-auth-logo-img {
          height: 52px;
          width: auto;
          transition: transform 0.3s ease;
        }
        .mm-auth-logo-img:hover { transform: scale(1.08) rotate(-3deg); }

        .mm-auth-head-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: #0a1f13;
          margin: 6px 0 0 0;
          letter-spacing: -0.8px;
        }

        .mm-auth-sub-title {
          font-size: 0.9rem;
          color: #2c4a38;
          font-weight: 800;
          margin-top: 2px;
        }

        .mm-field-group {
          margin-bottom: 14px;
        }

        .mm-field-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 800;
          color: #0a1f13;
          margin-bottom: 6px;
        }

        .mm-input-box {
          position: relative;
        }

        .mm-form-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 18px;
          border: 1.5px solid #bce1c3;
          background: #edf8ee;
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
          cursor: pointer;
          opacity: 0.75;
          font-size: 1rem;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .mm-eye-icon:hover {
          opacity: 1;
          transform: translateY(-50%) scale(1.15);
        }

        .mm-terms-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: #0a1f13;
          font-weight: 800;
          margin: 16px 0;
        }

        .mm-terms-line a {
          color: #e53935;
          text-decoration: none;
          font-weight: 900;
        }

        .mm-btn-green-submit {
          width: 100%;
          padding: 13px;
          border-radius: 22px;
          background: #108a43;
          color: #ffffff;
          font-weight: 900;
          font-size: 1.02rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(16, 138, 67, 0.28);
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
          border-radius: 22px;
          background: #ffffff;
          color: #0a1f13;
          font-weight: 800;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.25s ease;
        }
        .mm-btn-white-alt:hover {
          background: #f4fbf5;
          transform: translateY(-1px);
        }

        /* Option 1: Right Glassmorphic Showcase Canvas */
        .mm-auth-right-showcase {
          background: linear-gradient(145deg, #0d3821, #1e7e48);
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          box-sizing: border-box;
        }

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
          padding: 36px;
          width: 360px;
          color: #ffffff;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
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
      `}</style>

      <div className="mm-auth-left-panel">
        <button className="mm-btn-back" onClick={() => onNavigate && onNavigate('welcome')} title="Back to Welcome">
          ←
        </button>

        <div>
          <div className="mm-auth-logo-header">
            <img src={logoUrl} alt="MacroMate Logo" className="mm-auth-logo-img" />
            <h2 className="mm-auth-head-title">Sign Up</h2>
            <p className="mm-auth-sub-title">Welcome to MacroMate - Let's create account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mm-field-group">
              <label className="mm-field-label">Name</label>
              <input
                type="text"
                className="mm-form-input"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="mm-field-group">
              <label className="mm-field-label">Email</label>
              <input
                type="email"
                className="mm-form-input"
                placeholder="you@gmail.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="mm-field-group">
              <label className="mm-field-label">Password</label>
              <div className="mm-input-box">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="mm-form-input"
                  placeholder="••••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <span className="mm-eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  👁️
                </span>
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

        <div style={{ fontSize: '0.78rem', color: '#385c46', textAlign: 'center' }}>
          MacroMate © 2026 • Group 8
        </div>
      </div>

      <div className="mm-auth-right-showcase">
        <div className="mm-glow-orb-1" />
        <div className="mm-glow-orb-2" />

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
      </div>
    </div>
  );
}
