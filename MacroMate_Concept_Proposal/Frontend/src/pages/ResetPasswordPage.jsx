import { useState } from 'react';
import { supabase } from '../supabase/client';

export default function ResetPasswordPage({ onDone }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  const logoUrl = new URL('../assets/MacroMate Assets/MacroMate Icon and Assets/MacroMate Logo.png', import.meta.url).href;

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('password') !== form.get('confirm')) { setMessage('The passwords do not match.'); return; }
    setBusy(true); setMessage('');
    try {
      const { error } = await supabase.auth.updateUser({ password: form.get('password') });
      if (error) throw error;
      setSaved(true); setMessage('Password updated.');
    } catch (error) { setMessage(error.message || 'Could not update your password.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="mm-fullscreen-auth">
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(8deg); }
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

        .mm-auth-left-panel {
          padding: 40px 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #d4f3d2;
          z-index: 10;
          animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mm-auth-logo-header {
          text-align: center;
          margin-top: 10px;
          margin-bottom: 24px;
        }

        .mm-auth-logo-img {
          height: 56px;
          width: auto;
          transition: transform 0.3s ease;
        }
        .mm-auth-logo-img:hover { transform: scale(1.08) rotate(-3deg); }

        .mm-auth-head-title {
          font-size: 2.2rem;
          font-weight: 900;
          color: #0a1f13;
          margin: 6px 0 0 0;
          letter-spacing: -0.8px;
        }

        .mm-auth-sub-title {
          font-size: 0.9rem;
          color: #2c4a38;
          font-weight: 800;
          margin-top: 4px;
        }

        .mm-field-group {
          margin-bottom: 16px;
        }

        .mm-field-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 800;
          color: #0a1f13;
          margin-bottom: 6px;
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
          margin-top: 8px;
          box-shadow: 0 6px 18px rgba(16, 138, 67, 0.28);
          transition: all 0.25s ease;
        }
        .mm-btn-green-submit:hover {
          background: #0c6e35;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(16, 138, 67, 0.38);
        }

        .mm-auth-right-waves {
          background: linear-gradient(135deg, #104229, #1e7e48);
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mm-icon-float-1 { position: absolute; top: 18%; left: 18%; font-size: 4rem; animation: floatIcon 5s infinite ease-in-out; }
        .mm-icon-float-2 { position: absolute; top: 22%; right: 20%; font-size: 3.5rem; animation: floatIcon 6s infinite ease-in-out 1s; }
        .mm-icon-float-3 { position: absolute; bottom: 22%; left: 22%; font-size: 3.8rem; animation: floatIcon 5.5s infinite ease-in-out 0.5s; }
        .mm-icon-float-4 { position: absolute; bottom: 18%; right: 24%; font-size: 4.2rem; animation: floatIcon 7s infinite ease-in-out 1.5s; }

        .mm-center-brand-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          padding: 32px 48px;
          border-radius: 32px;
          text-align: center;
          color: #102a1c;
          animation: pulseLogoGlow 6s ease-in-out infinite;
          z-index: 5;
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
      `}</style>

      {/* Left Form Panel */}
      <div className="mm-auth-left-panel">
        <div />

        <div>
          <div className="mm-auth-logo-header">
            <img src={logoUrl} alt="MacroMate Logo" className="mm-auth-logo-img" />
            <h1 className="mm-auth-head-title">Reset Password</h1>
            <p className="mm-auth-sub-title">Set your new security credentials</p>
          </div>

          <form onSubmit={submit}>
            {message && <p className="auth-error" style={{ background: saved ? '#e8f5e9' : '#fff2f2', color: saved ? '#1b5e20' : '#9c2020' }} role="status">{message}</p>}
            
            {!saved && (
              <>
                <div className="mm-field-group">
                  <label className="mm-field-label">New Password</label>
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength="8"
                    maxLength="128"
                    disabled={busy}
                    className="mm-form-input"
                    placeholder="••••••••••"
                  />
                </div>

                <div className="mm-field-group">
                  <label className="mm-field-label">Confirm Password</label>
                  <input
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength="8"
                    maxLength="128"
                    disabled={busy}
                    className="mm-form-input"
                    placeholder="••••••••••"
                  />
                </div>

                <button type="submit" className="mm-btn-green-submit" disabled={busy}>
                  {busy ? 'Updating…' : 'Update password'}
                </button>
              </>
            )}

            {saved && (
              <button type="button" className="mm-btn-green-submit" onClick={onDone}>
                Continue to dashboard
              </button>
            )}
          </form>
        </div>

        <div style={{ fontSize: '0.78rem', color: '#385c46', textAlign: 'center' }}>
          MacroMate © 2026 • Group 8
        </div>
      </div>

      {/* Right Visual Showcase Panel */}
      <div className="mm-auth-right-waves">
        <span className="mm-icon-float-1">🔒</span>
        <span className="mm-icon-float-2">🔑</span>
        <span className="mm-icon-float-3">🛡️</span>
        <span className="mm-icon-float-4">✨</span>

        <div className="mm-center-brand-card">
          <img src={logoUrl} alt="MacroMate Logo" className="mm-center-logo-img" />
          <h2 className="mm-center-brand-title">MacroMate</h2>
          <p className="mm-center-brand-sub">Secure Account Access</p>
        </div>
      </div>
    </div>
  );
}