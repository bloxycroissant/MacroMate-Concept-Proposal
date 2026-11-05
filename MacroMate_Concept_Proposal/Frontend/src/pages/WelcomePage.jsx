export default function WelcomePage({ onNavigate, allowDemo = false }) {
  const getAsset = (fileName) => 
    new URL(`../assets/MacroMate Assets/MacroMate Icon and Assets/${fileName}`, import.meta.url).href;
  
  const getPfp = (fileName) => 
    new URL(`../assets/MacroMate Assets/The Team PFP/${fileName}`, import.meta.url).href;

  const handleSmoothScroll = (event, id) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mm-welcome-page">
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        /* Continuous Looping Animations */
        @keyframes floatHeroCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes floatCardRow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes swayBadge {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(6deg) scale(1.06); }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 4px 14px rgba(20, 156, 77, 0.15); }
          50% { box-shadow: 0 8px 22px rgba(20, 156, 77, 0.35); }
        }

        @keyframes iconBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.1); }
        }

        @keyframes fadeInWelcome {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mm-welcome-page {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background-color: #f6fbf7;
          color: #122b1c;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
          animation: fadeInWelcome 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Top Navigation Header */
        .mm-welcome-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 64px;
          width: 100%;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid #e1eee4;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          transition: all 0.3s ease;
        }

        .mm-header-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .mm-header-brand:hover {
          transform: scale(1.03);
        }

        .mm-header-logo-img {
          height: 32px;
          width: auto;
          transition: transform 0.3s ease;
        }

        .mm-header-brand:hover .mm-header-logo-img {
          transform: rotate(-6deg) scale(1.08);
        }

        .mm-header-brand-title {
          font-weight: 800;
          font-size: 1.45rem;
          color: #102a1c;
          letter-spacing: -0.5px;
        }

        .mm-header-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .mm-nav-link {
          color: #2e4a3b;
          font-weight: 600;
          text-decoration: none;
          font-size: 0.92rem;
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
          padding: 4px 0;
          transition: color 0.25s ease, transform 0.2s ease;
        }

        .mm-nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 2px;
          background-color: #1e7e48;
          border-radius: 2px;
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mm-nav-link:hover {
          color: #1e7e48;
          transform: translateY(-1px);
        }

        .mm-nav-link:hover::after {
          width: 100%;
        }

        .mm-nav-link:active {
          transform: translateY(0) scale(0.96);
        }

        .mm-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mm-btn-header-signup {
          padding: 9px 22px;
          border-radius: 20px;
          border: 1.5px solid #d1e7d5;
          background: #ffffff;
          color: #102a1c;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mm-btn-header-signup:hover {
          background: #f4faf5;
          border-color: #1e7e48;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(30, 126, 72, 0.1);
        }

        .mm-btn-header-signup:active {
          transform: translateY(0) scale(0.97);
        }

        .mm-btn-header-login {
          padding: 9px 24px;
          border-radius: 20px;
          border: none;
          background: #1e7e48;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(30, 126, 72, 0.2);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          animation: pulseGlow 4s ease-in-out infinite;
        }

        .mm-btn-header-login:hover {
          background: #145a32;
          transform: translateY(-2px);
        }

        .mm-btn-header-login:active {
          transform: translateY(0) scale(0.97);
        }

        /* Hero Container */
        .mm-hero-section {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 24px 32px 24px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 40px;
          align-items: center;
          animation: slideUpFade 0.6s ease-out;
        }

        .mm-hero-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #cce5d2;
          font-size: 0.82rem;
          font-weight: 700;
          color: #1e7e48;
          margin-bottom: 18px;
          box-shadow: 0 2px 8px rgba(30, 126, 72, 0.05);
          animation: floatCardRow 5s ease-in-out infinite;
          transition: transform 0.2s ease;
        }

        .mm-hero-pill-badge:hover {
          transform: translateY(-1px);
        }

        .mm-hero-heading {
          font-size: 3.2rem;
          font-weight: 900;
          line-height: 1.1;
          color: #0c2115;
          margin: 0 0 16px 0;
          letter-spacing: -1px;
        }

        .mm-hero-heading span {
          color: #1e7e48;
          display: block;
        }

        .mm-hero-subtext {
          font-size: 0.98rem;
          color: #3b5747;
          line-height: 1.6;
          margin-bottom: 28px;
          max-width: 520px;
        }

        .mm-hero-cta-group {
          display: flex;
          gap: 14px;
          margin-bottom: 36px;
        }

        .mm-btn-cta-explore {
          padding: 12px 26px;
          border-radius: 24px;
          background: #ffffff;
          border: 1.5px solid #bce1c3;
          color: #102a1c;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .mm-btn-cta-explore:hover {
          background: #f2faf4;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .mm-btn-cta-explore:active {
          transform: translateY(0) scale(0.97);
        }

        .mm-btn-cta-start {
          padding: 12px 32px;
          border-radius: 24px;
          background: #1e7e48;
          border: none;
          color: #ffffff;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          animation: pulseGlow 3.5s ease-in-out infinite;
          transition: all 0.25s ease;
        }

        .mm-btn-cta-start:hover {
          background: #145a32;
          transform: translateY(-3px);
        }

        .mm-btn-cta-start:active {
          transform: translateY(0) scale(0.97);
        }

        .mm-stats-strip {
          display: flex;
          gap: 36px;
        }

        .mm-stat-item {
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease;
        }

        .mm-stat-item:hover {
          transform: translateY(-2px);
        }

        .mm-stat-val {
          font-size: 1.3rem;
          font-weight: 900;
          color: #0c2115;
        }

        .mm-stat-lbl {
          font-size: 0.75rem;
          color: #557361;
          font-weight: 600;
        }

        /* Hero Preview Visual */
        .mm-hero-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 14px;
          border: 1px solid #d8ebd9;
          box-shadow: 0 16px 40px rgba(16, 42, 28, 0.08);
          animation: floatHeroCard 5s ease-in-out infinite;
          transition: box-shadow 0.3s ease;
        }

        .mm-hero-card:hover {
          box-shadow: 0 20px 48px rgba(16, 42, 28, 0.14);
        }

        .mm-hero-card-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          border-radius: 14px;
        }

        .mm-hero-card-footer {
          margin-top: 12px;
          background: #f6fbf7;
          border-radius: 12px;
          padding: 12px 14px;
        }

        .mm-card-footer-lbl {
          font-size: 0.72rem;
          font-weight: 800;
          color: #1e7e48;
          display: block;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .mm-card-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          text-align: center;
        }

        .mm-metric-col span {
          display: block;
          font-size: 0.68rem;
          color: #6a8876;
        }

        .mm-metric-col strong {
          font-size: 0.95rem;
          color: #102a1c;
          font-weight: 800;
        }

        /* Looping Accent Cards Row (Placed Before Core Modules) */
        .mm-accent-bar-section {
          width: 100%;
          max-width: 1200px;
          margin: 16px auto 24px auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        .mm-accent-bar-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
        }

        .mm-accent-card {
          background: #ffffff;
          border: 1px solid #e1eee4;
          border-radius: 16px;
          padding: 14px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 14px rgba(18, 43, 28, 0.03);
          animation: floatCardRow 4.8s ease-in-out infinite;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Offset Loop Delays for Wave Effect */
        .mm-accent-card:nth-child(1) { animation-delay: 0s; }
        .mm-accent-card:nth-child(2) { animation-delay: 0.4s; }
        .mm-accent-card:nth-child(3) { animation-delay: 0.8s; }
        .mm-accent-card:nth-child(4) { animation-delay: 1.2s; }
        .mm-accent-card:nth-child(5) { animation-delay: 1.6s; }
        .mm-accent-card:nth-child(6) { animation-delay: 2.0s; }

        .mm-accent-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 12px 26px rgba(30, 126, 72, 0.1);
          border-color: #cce5d2;
        }

        .mm-accent-icon {
          font-size: 1.4rem;
          flex-shrink: 0;
          animation: iconBounce 3.5s ease-in-out infinite;
        }

        .mm-accent-meta {
          display: flex;
          flex-direction: column;
        }

        .mm-accent-title {
          font-size: 0.78rem;
          font-weight: 800;
          color: #102a1c;
          line-height: 1.15;
        }

        .mm-accent-sub {
          font-size: 0.66rem;
          color: #557361;
          font-weight: 600;
        }

        /* Core Modules Section */
        .mm-section {
          width: 100%;
          max-width: 1200px;
          margin: 32px auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        .mm-section-label {
          font-size: 0.85rem;
          font-weight: 900;
          color: #1e7e48;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .mm-section-title {
          font-size: 2.2rem;
          font-weight: 900;
          color: #0c2115;
          margin: 6px 0 32px 0;
          letter-spacing: -0.5px;
        }

        .mm-grid-modules {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .mm-card-module {
          background: #ffffff;
          border-radius: 18px;
          padding: 22px;
          border: 1px solid #e1eee4;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mm-card-module::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: #1e7e48;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .mm-card-module:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(30, 126, 72, 0.08);
          border-color: #cce5d2;
        }

        .mm-card-module:hover::before {
          opacity: 1;
        }

        .mm-module-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mm-module-icon {
          width: 36px;
          height: 36px;
          object-fit: contain;
          animation: swayBadge 6s ease-in-out infinite;
          transition: transform 0.3s ease;
        }

        .mm-card-module:hover .mm-module-icon {
          transform: scale(1.15) rotate(6deg);
        }

        .mm-module-tag {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 10px;
          background: #e8f5e9;
          color: #1e7e48;
          text-transform: uppercase;
        }

        .mm-module-title {
          font-size: 1.08rem;
          font-weight: 800;
          color: #102a1c;
          margin: 0;
        }

        .mm-module-desc {
          font-size: 0.85rem;
          color: #4f6d5c;
          line-height: 1.5;
          margin: 0;
        }

        /* How it Works Grid */
        .mm-grid-how-it-works {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .mm-card-step {
          background: #ffffff;
          border-radius: 18px;
          padding: 26px 20px;
          border: 1px solid #e1eee4;
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mm-card-step:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(30, 126, 72, 0.08);
          border-color: #cce5d2;
        }

        .mm-step-num {
          font-size: 0.75rem;
          font-weight: 900;
          color: #1e7e48;
          background: #e8f5e9;
          padding: 4px 12px;
          border-radius: 12px;
          align-self: flex-start;
          transition: all 0.3s ease;
        }

        .mm-card-step:hover .mm-step-num {
          background: #1e7e48;
          color: #ffffff;
        }

        .mm-step-title {
          font-size: 1.12rem;
          font-weight: 800;
          color: #102a1c;
          margin: 0;
        }

        .mm-step-desc {
          font-size: 0.85rem;
          color: #4f6d5c;
          line-height: 1.5;
          margin: 0;
        }

        /* Team Section */
        .mm-grid-team {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .mm-card-team {
          background: #ffffff;
          border-radius: 18px;
          padding: 18px 20px;
          border: 1px solid #e1eee4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mm-card-team:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(30, 126, 72, 0.08);
          border-color: #cce5d2;
        }

        .mm-team-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mm-team-pfp {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #1e7e48;
          transition: transform 0.3s ease;
        }

        .mm-card-team:hover .mm-team-pfp {
          transform: scale(1.08);
        }

        .mm-team-meta h4 {
          margin: 0 0 4px 0;
          font-size: 0.98rem;
          color: #102a1c;
          font-weight: 800;
        }

        .mm-team-meta p {
          margin: 0;
          font-size: 0.74rem;
          color: #557361;
          line-height: 1.4;
        }

        .mm-team-badge-icon {
          width: 44px;
          height: 44px;
          object-fit: contain;
          animation: swayBadge 5.5s ease-in-out infinite;
          transition: transform 0.3s ease;
        }

        .mm-card-team:hover .mm-team-badge-icon {
          transform: rotate(8deg) scale(1.12);
        }

        /* Full Width Bottom Banner */
        .mm-bottom-banner {
          background: #149c4d;
          width: 100%;
          margin: 64px 0 0 0;
          padding: 60px 24px;
          text-align: center;
          color: #ffffff;
          box-sizing: border-box;
          transition: background 0.3s ease;
        }

        .mm-banner-tag {
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 1.8px;
          color: #ffffff;
          text-transform: uppercase;
          display: block;
          margin-bottom: 12px;
        }

        .mm-banner-title {
          font-size: 2.6rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0 0 14px 0;
          letter-spacing: -0.8px;
          line-height: 1.15;
        }

        .mm-banner-desc {
          font-size: 0.98rem;
          color: #ffffff;
          max-width: 640px;
          margin: 0 auto 32px auto;
          line-height: 1.45;
          font-weight: 400;
          opacity: 0.95;
        }

        .mm-btn-banner-start {
          padding: 13px 34px;
          border-radius: 30px;
          background: #ffffff;
          color: #149c4d;
          font-weight: 800;
          font-size: 1.05rem;
          border: none;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        }

        .mm-btn-banner-start:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        }

        .mm-btn-banner-start:active {
          transform: translateY(0) scale(0.97);
        }

        /* Footer Container */
        .mm-welcome-footer-container {
          width: 100%;
          background: #ffffff;
          border-top: 1px solid #e1eee4;
          padding: 32px 64px;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mm-welcome-footer-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mm-welcome-footer-right {
          font-size: 0.92rem;
          color: #122b1c;
          text-align: right;
          line-height: 1.5;
          font-weight: 500;
        }

        @media (max-width: 1024px) {
          .mm-accent-bar-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 992px) {
          .mm-welcome-header { padding: 18px 24px; }
          .mm-hero-section, .mm-section, .mm-accent-bar-section { padding-left: 24px; padding-right: 24px; }
          .mm-bottom-banner { padding: 40px 20px; }
          .mm-banner-title { font-size: 2rem; }
          .mm-hero-section { grid-template-columns: 1fr; }
          .mm-grid-modules { grid-template-columns: 1fr; }
          .mm-grid-how-it-works { grid-template-columns: 1fr 1fr; }
          .mm-grid-team { grid-template-columns: 1fr; }
          .mm-welcome-footer-container { padding: 24px 24px; flex-direction: column; gap: 16px; text-align: center; }
          .mm-welcome-footer-right { text-align: center; }
        }

        @media (max-width: 640px) {
          .mm-accent-bar-grid { grid-template-columns: repeat(2, 1fr); }
          .mm-grid-how-it-works { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header Bar */}
      <header className="mm-welcome-header">
        <div className="mm-header-brand" onClick={() => onNavigate && onNavigate('welcome')}>
          <img src={getAsset('MacroMate Logo.png')} alt="MacroMate Logo" className="mm-header-logo-img" />
          <span className="mm-header-brand-title">MacroMate</span>
        </div>
        <nav className="mm-header-nav">
          <a href="#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="mm-nav-link">Features 📋</a>
          <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, 'how-it-works')} className="mm-nav-link">How it Works ⚙️</a>
          <a href="#team" onClick={(e) => handleSmoothScroll(e, 'team')} className="mm-nav-link">Team 👥</a>
        </nav>
        <div className="mm-header-actions">
          {allowDemo && <button className="mm-btn-header-login" onClick={() => onNavigate && onNavigate('dashboard')}>Open local demo</button>}
          <button className="mm-btn-header-signup" onClick={() => onNavigate && onNavigate('signup')}>Sign Up</button>
          <button className="mm-btn-header-login" onClick={() => onNavigate && onNavigate('login')}>Log In</button>
        </div>
      </header>

      {/* Hero Body */}
      <section className="mm-hero-section">
        <div>
          <div className="mm-hero-pill-badge">
            <span>🥗 Web-Based Food Journal & Wellness Tracker</span>
          </div>
          <h1 className="mm-hero-heading">
            Your macros,
            <span>mastered.</span>
          </h1>
          <p className="mm-hero-subtext">
            MacroMate is an accessible, inclusive nutrition tracker that helps everyone—including persons with disabilities—log food, monitor macros, and build lasting wellness habits without complexity.
          </p>
          <div className="mm-hero-cta-group">
            <button className="mm-btn-cta-explore" onClick={(e) => handleSmoothScroll(e, 'features')}>Explore Features</button>
            <button className="mm-btn-cta-start" onClick={() => onNavigate && onNavigate('signup')}>Get Started</button>
          </div>
          <div className="mm-stats-strip">
            <div className="mm-stat-item">
              <span className="mm-stat-val">100%</span>
              <span className="mm-stat-lbl">Accessible Design</span>
            </div>
            <div className="mm-stat-item">
              <span className="mm-stat-val">SDG 3</span>
              <span className="mm-stat-lbl">Good Health & Well-Being</span>
            </div>
            <div className="mm-stat-item">
              <span className="mm-stat-val">PWD</span>
              <span className="mm-stat-lbl">Inclusive by Design</span>
            </div>
          </div>
        </div>

        <div className="mm-hero-card">
          <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80" alt="Healthy Summary Meal" className="mm-hero-card-img" />
          <div className="mm-hero-card-footer">
            <span className="mm-card-footer-lbl">Today's Summary</span>
            <div className="mm-card-metrics">
              <div className="mm-metric-col">
                <span>Calories</span>
                <strong>1,842</strong>
              </div>
              <div className="mm-metric-col">
                <span>Protein</span>
                <strong>98g</strong>
              </div>
              <div className="mm-metric-col">
                <span>Carbs</span>
                <strong>210g</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Looping Accent Cards Row - Placed BEFORE Core Modules */}
      <section className="mm-accent-bar-section">
        <div className="mm-accent-bar-grid">
          <div className="mm-accent-card">
            <span className="mm-accent-icon">🥗</span>
            <div className="mm-accent-meta">
              <span className="mm-accent-title">Balanced Macros</span>
              <span className="mm-accent-sub">Real-time breakdown</span>
            </div>
          </div>

          <div className="mm-accent-card">
            <span className="mm-accent-icon">💧</span>
            <div className="mm-accent-meta">
              <span className="mm-accent-title">Hydration Sync</span>
              <span className="mm-accent-sub">Daily water targets</span>
            </div>
          </div>

          <div className="mm-accent-card">
            <span className="mm-accent-icon">🥑</span>
            <div className="mm-accent-meta">
              <span className="mm-accent-title">Nutrient Dense</span>
              <span className="mm-accent-sub">Healthy fat check</span>
            </div>
          </div>

          <div className="mm-accent-card">
            <span className="mm-accent-icon">🏋️</span>
            <div className="mm-accent-meta">
              <span className="mm-accent-title">Active Fitness</span>
              <span className="mm-accent-sub">Energy burn tracking</span>
            </div>
          </div>

          <div className="mm-accent-card">
            <span className="mm-accent-icon">🥦</span>
            <div className="mm-accent-meta">
              <span className="mm-accent-title">Vitamins & Fiber</span>
              <span className="mm-accent-sub">Micro nutrition</span>
            </div>
          </div>

          <div className="mm-accent-card">
            <span className="mm-accent-icon">⏱️</span>
            <div className="mm-accent-meta">
              <span className="mm-accent-title">Fast Meal Logging</span>
              <span className="mm-accent-sub">Instant visual feedback</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section id="features" className="mm-section">
        <span className="mm-section-label">CORE MODULES</span>
        <h2 className="mm-section-title">Everything you need to track your nutrition</h2>

        <div className="mm-grid-modules">
          <div className="mm-card-module">
            <div className="mm-module-top">
              <img src={getAsset('Calories Icon.png')} alt="Calories" className="mm-module-icon" />
              <span className="mm-module-tag">CORE</span>
            </div>
            <h3 className="mm-module-title">Macro & Calorie Tracking</h3>
            <p className="mm-module-desc">Log meals in seconds. Track protein, carbs, fat and calories with instant visual feedback.</p>
          </div>

          <div className="mm-card-module">
            <div className="mm-module-top">
              <img src={getAsset('Line Graph Icon.png')} alt="Analytics" className="mm-module-icon" />
              <span className="mm-module-tag">ANALYTICS</span>
            </div>
            <h3 className="mm-module-title">Visual Dashboard</h3>
            <p className="mm-module-desc">Intuitive charts and progress reports give you a clear picture of your nutritional trends.</p>
          </div>

          <div className="mm-card-module">
            <div className="mm-module-top">
              <img src={getAsset('User Icon.png')} alt="Account" className="mm-module-icon" />
              <span className="mm-module-tag">ACCOUNT</span>
            </div>
            <h3 className="mm-module-title">User Profile & Auth</h3>
            <p className="mm-module-desc">Secure accounts with personalized nutrition targets, dietary preferences, and health history.</p>
          </div>

          <div className="mm-card-module">
            <div className="mm-module-top">
              <img src={getAsset('PWD Icon.png')} alt="Inclusive" className="mm-module-icon" />
              <span className="mm-module-tag">INCLUSIVE</span>
            </div>
            <h3 className="mm-module-title">Accessibility First</h3>
            <p className="mm-module-desc">Screen reader support, adjustable text sizing, high-contrast mode and keyboard navigation.</p>
          </div>

          <div className="mm-card-module">
            <div className="mm-module-top">
              <img src={getAsset('Journal Icon.png')} alt="Wellness" className="mm-module-icon" />
              <span className="mm-module-tag">WELLNESS</span>
            </div>
            <h3 className="mm-module-title">Wellness Journal</h3>
            <p className="mm-module-desc">Record energy, hydration, mood, and activity alongside your daily food log.</p>
          </div>

          <div className="mm-card-module">
            <div className="mm-module-top">
              <img src={getAsset('Goal Icon.png')} alt="Goals" className="mm-module-icon" />
              <span className="mm-module-tag">GOALS</span>
            </div>
            <h3 className="mm-module-title">Goal Setting</h3>
            <p className="mm-module-desc">Set personalized nutrition targets. MacroMate guides you with clear, actionable feedback.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mm-section">
        <span className="mm-section-label">HOW IT WORKS</span>
        <h2 className="mm-section-title">Build a healthy rhythm in 4 simple steps</h2>

        <div className="mm-grid-how-it-works">
          <div className="mm-card-step">
            <span className="mm-step-num">STEP 01</span>
            <h3 className="mm-step-title">Set Your Targets</h3>
            <p className="mm-step-desc">Establish your personalized daily calories, macronutrient targets (protein, carbs, fats), and wellness goals upon sign-up.</p>
          </div>

          <div className="mm-card-step">
            <span className="mm-step-num">STEP 02</span>
            <h3 className="mm-step-title">Log Meals & Check-ins</h3>
            <p className="mm-step-desc">Log your breakfast, lunch, dinner, and snacks while doing quick daily check-ins for water, sleep, and mood.</p>
          </div>

          <div className="mm-card-step">
            <span className="mm-step-num">STEP 03</span>
            <h3 className="mm-step-title">Track Real-Time Progress</h3>
            <p className="mm-step-desc">Watch your progress bars update instantly on your dashboard with complete offline local storage support.</p>
          </div>

          <div className="mm-card-step">
            <span className="mm-step-num">STEP 04</span>
            <h3 className="mm-step-title">Grow One Day at a Time</h3>
            <p className="mm-step-desc">Review 7-day weekly charts to stay motivated and sustain healthy lifestyle habits effortlessly.</p>
          </div>
        </div>
      </section>

      {/* Team Roster Section */}
      <section id="team" className="mm-section">
        <span className="mm-section-label">The Team</span>
        <h2 className="mm-section-title">Meet the Team of MacroMate</h2>

        <div className="mm-grid-team">
          <div className="mm-card-team">
            <div className="mm-team-left">
              <img src={getPfp('Denise PFP.jpg')} alt="Denise" className="mm-team-pfp" />
              <div className="mm-team-meta">
                <h4>Sabando, Christianne Denise S.</h4>
                <p>Project Owner of MacroMate, Project Leader of MacroMate, UX/UI Designer, Main Front-End Developer, Back-End Developer, Programmer</p>
              </div>
            </div>
            <img src={getAsset('Leader Icon.png')} alt="Leader Badge" className="mm-team-badge-icon" />
          </div>

          <div className="mm-card-team">
            <div className="mm-team-left">
              <img src={getPfp('Cedric PFP.jpg')} alt="Cedric" className="mm-team-pfp" />
              <div className="mm-team-meta">
                <h4>Fetalvero, Cedric Wayne F.</h4>
                <p>Project Leader of MacroMate, System Analyst, Front-End Developer, Back-End Developer, Programmer</p>
              </div>
            </div>
            <img src={getAsset('System Analyst Icon.png')} alt="System Analyst Badge" className="mm-team-badge-icon" />
          </div>

          <div className="mm-card-team">
            <div className="mm-team-left">
              <img src={getPfp('Aaron PFP.jpg')} alt="Aaron" className="mm-team-pfp" />
              <div className="mm-team-meta">
                <h4>Layman, Aaron A.</h4>
                <p>Main Back-End Developer, Front-End Developer, Programmer</p>
              </div>
            </div>
            <img src={getAsset('Backend Icon.png')} alt="Backend Badge" className="mm-team-badge-icon" />
          </div>

          <div className="mm-card-team">
            <div className="mm-team-left">
              <img src={getPfp('Sammy PFP.jpg')} alt="Samantha" className="mm-team-pfp" />
              <div className="mm-team-meta">
                <h4>Mayuga, Samantha Nicole P.</h4>
                <p>Front-End Developer, Back-End Developer, Programmer</p>
              </div>
            </div>
            <img src={getAsset('Frontend Icon.png')} alt="Frontend Badge" className="mm-team-badge-icon" />
          </div>
        </div>
      </section>

      {/* Full Width Banner Matching Reference */}
      <div className="mm-bottom-banner">
        <span className="mm-banner-tag">START TODAY</span>
        <h2 className="mm-banner-title">Take control of your nutritional health</h2>
        <p className="mm-banner-desc">
          MacroMate is designed for everyone. Whether you're a fitness beginner or have specific accessibility needs, your wellness journey starts here.
        </p>
        <button className="mm-btn-banner-start" onClick={() => onNavigate && onNavigate('signup')}>Get Started Free →</button>
      </div>

      {/* Footer Area Preserving Logo Icon */}
      <footer className="mm-welcome-footer-container">
        <div className="mm-welcome-footer-left">
          <img src={getAsset('MacroMate Logo.png')} alt="MacroMate Logo" className="mm-header-logo-img" />
          <span className="mm-header-brand-title" style={{ color: '#149c4d' }}>MacroMate</span>
        </div>
        <div className="mm-welcome-footer-right">
          Technological Institute of the Philippines · Quezon City
          <br />
          Group 8 · CS 002 · CS21S4 · S.Y. 2026-2027
        </div>
      </footer>
    </div>
  );
}