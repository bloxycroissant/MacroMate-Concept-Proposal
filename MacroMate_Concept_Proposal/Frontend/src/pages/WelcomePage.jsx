export default function WelcomePage({ onNavigate }) {
  // Vite-compatible asset URL resolvers
  const getAsset = (fileName) => 
    new URL(`../assets/MacroMate Assets/MacroMate Icon and Assets/${fileName}`, import.meta.url).href;
  
  const getPfp = (fileName) => 
    new URL(`../assets/MacroMate Assets/The Team PFP/${fileName}`, import.meta.url).href;

  return (
    <div className="mm-welcome-page">
      <style>{`
        @keyframes floatHeroCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeInWelcome {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mm-welcome-page {
          min-height: 100vh;
          background-color: #f2faf4;
          color: #122b1c;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          animation: fadeInWelcome 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Top Navigation Header */
        .mm-welcome-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 64px;
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid #e1eee4;
        }

        .mm-header-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .mm-header-logo-img {
          height: 32px;
          width: auto;
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
          transition: color 0.2s ease;
        }
        .mm-nav-link:hover { color: #1e7e48; }

        .mm-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mm-btn-header-signup {
          padding: 8px 20px;
          border-radius: 20px;
          border: 1.5px solid #d1e7d5;
          background: #ffffff;
          color: #102a1c;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mm-btn-header-signup:hover {
          background: #f4faf5;
          border-color: #1e7e48;
        }

        .mm-btn-header-login {
          padding: 8px 22px;
          border-radius: 20px;
          border: none;
          background: #1e7e48;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(30, 126, 72, 0.2);
          transition: all 0.2s ease;
        }
        .mm-btn-header-login:hover {
          background: #145a32;
          transform: translateY(-1px);
        }

        /* Hero Container */
        .mm-hero-section {
          max-width: 1140px;
          margin: 0 auto;
          padding: 48px 24px 32px 24px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 40px;
          align-items: center;
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
        }

        .mm-hero-heading {
          font-size: 3.1rem;
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
          font-size: 0.95rem;
          color: #3b5747;
          line-height: 1.55;
          margin-bottom: 28px;
          max-width: 520px;
        }

        .mm-hero-cta-group {
          display: flex;
          gap: 14px;
          margin-bottom: 36px;
        }

        .mm-btn-cta-explore {
          padding: 12px 24px;
          border-radius: 24px;
          background: #ffffff;
          border: 1.5px solid #bce1c3;
          color: #102a1c;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .mm-btn-cta-explore:hover { background: #f2faf4; }

        .mm-btn-cta-start {
          padding: 12px 30px;
          border-radius: 24px;
          background: #1e7e48;
          border: none;
          color: #ffffff;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(30, 126, 72, 0.25);
          transition: all 0.2s ease;
        }
        .mm-btn-cta-start:hover {
          background: #145a32;
          transform: translateY(-2px);
        }

        .mm-stats-strip {
          display: flex;
          gap: 32px;
        }

        .mm-stat-item {
          display: flex;
          flex-direction: column;
        }

        .mm-stat-val {
          font-size: 1.25rem;
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
          padding: 12px;
          border: 1px solid #d8ebd9;
          box-shadow: 0 12px 32px rgba(16, 42, 28, 0.08);
          animation: floatHeroCard 5s ease-in-out infinite;
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
          padding: 10px 14px;
        }

        .mm-card-footer-lbl {
          font-size: 0.72rem;
          font-weight: 800;
          color: #1e7e48;
          display: block;
          margin-bottom: 6px;
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

        /* Core Modules Section */
        .mm-section {
          max-width: 1140px;
          margin: 32px auto;
          padding: 0 24px;
        }

        .mm-section-label {
          font-size: 0.8rem;
          font-weight: 900;
          color: #1e7e48;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .mm-section-title {
          font-size: 2.1rem;
          font-weight: 900;
          color: #0c2115;
          margin: 4px 0 28px 0;
          letter-spacing: -0.5px;
        }

        .mm-grid-modules {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .mm-card-module {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e1eee4;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .mm-card-module:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
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
          font-size: 1.05rem;
          font-weight: 800;
          color: #102a1c;
          margin: 0;
        }

        .mm-module-desc {
          font-size: 0.82rem;
          color: #4f6d5c;
          line-height: 1.45;
          margin: 0;
        }

        /* Team Section */
        .mm-grid-team {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .mm-card-team {
          background: #ffffff;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #e1eee4;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .mm-team-pfp {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #1e7e48;
        }

        .mm-team-meta h4 {
          margin: 0 0 2px 0;
          font-size: 0.95rem;
          color: #102a1c;
          font-weight: 800;
        }

        .mm-team-meta p {
          margin: 0;
          font-size: 0.72rem;
          color: #557361;
          line-height: 1.35;
        }

        /* Callout Bottom Banner */
        .mm-bottom-banner {
          background: #145a32;
          margin: 48px 24px 24px 24px;
          border-radius: 24px;
          padding: 40px 24px;
          text-align: center;
          color: #ffffff;
        }

        .mm-banner-tag {
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 1px;
          opacity: 0.85;
          text-transform: uppercase;
        }

        .mm-banner-title {
          font-size: 2rem;
          font-weight: 900;
          margin: 8px 0;
        }

        .mm-banner-desc {
          font-size: 0.88rem;
          opacity: 0.9;
          max-width: 540px;
          margin: 0 auto 24px auto;
          line-height: 1.5;
        }

        .mm-btn-banner-start {
          padding: 12px 32px;
          border-radius: 24px;
          background: #ffffff;
          color: #145a32;
          font-weight: 900;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .mm-btn-banner-start:hover { transform: scale(1.04); }

        .mm-welcome-footer {
          text-align: center;
          padding: 20px;
          font-size: 0.78rem;
          color: #617d70;
          background: #e5f2e8;
        }
      `}</style>

      {/* Header Bar */}
      <header className="mm-welcome-header">
        <div className="mm-header-brand" onClick={() => onNavigate && onNavigate('welcome')}>
          <img src={getAsset('MacroMate Logo.png')} alt="MacroMate Logo" className="mm-header-logo-img" />
          <span className="mm-header-brand-title">MacroMate</span>
        </div>
        <nav className="mm-header-nav">
          <a href="#features" className="mm-nav-link">Features 📋</a>
          <a href="#how-it-works" className="mm-nav-link">How it Works ⚙️</a>
          <a href="#team" className="mm-nav-link">Team 👥</a>
        </nav>
        <div className="mm-header-actions">
          <button className="mm-btn-header-login" onClick={() => onNavigate && onNavigate('dashboard')}>Open local demo</button>
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
            <button className="mm-btn-cta-explore" onClick={() => onNavigate && onNavigate('signup')}>Explore Features</button>
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

      {/* Team Roster Section */}
      <section id="team" className="mm-section">
        <span className="mm-section-label">The Team</span>
        <h2 className="mm-section-title">Meet the Team of MacroMate</h2>

        <div className="mm-grid-team">
          <div className="mm-card-team">
            <img src={getPfp('Denise PFP.jpg')} alt="Denise" className="mm-team-pfp" />
            <div className="mm-team-meta">
              <h4>Sabando, Christianne Denise S.</h4>
              <p>Project Owner of MacroMate, Project Leader of MacroMate, UX/UI Designer, Main Front-End Developer, Back-End Developer, Programmer</p>
            </div>
          </div>

          <div className="mm-card-team">
            <img src={getPfp('Cedric PFP.jpg')} alt="Cedric" className="mm-team-pfp" />
            <div className="mm-team-meta">
              <h4>Fetalvero, Cedric Wayne F.</h4>
              <p>Project Leader of MacroMate, System Analyst, Front-End Developer, Back-End Developer, Programmer</p>
            </div>
          </div>

          <div className="mm-card-team">
            <img src={getPfp('Aaron PFP.jpg')} alt="Aaron" className="mm-team-pfp" />
            <div className="mm-team-meta">
              <h4>Layman, Aaron A.</h4>
              <p>Main Back-End Developer, Front-End Developer, Programmer</p>
            </div>
          </div>

          <div className="mm-card-team">
            <img src={getPfp('Sammy PFP.jpg')} alt="Samantha" className="mm-team-pfp" />
            <div className="mm-team-meta">
              <h4>Mayuga, Samantha Nicole P.</h4>
              <p>Front-End Developer, Back-End Developer, Programmer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Callout */}
      <div className="mm-bottom-banner">
        <span className="mm-banner-tag">START TODAY</span>
        <h2 className="mm-banner-title">Take control of your nutritional health</h2>
        <p className="mm-banner-desc">
          MacroMate is designed for everyone. Whether you're a fitness beginner or have specific accessibility needs, your wellness journey starts here.
        </p>
        <button className="mm-btn-banner-start" onClick={() => onNavigate && onNavigate('signup')}>Get Started Free →</button>
      </div>

      <footer className="mm-welcome-footer">
        Technological Institute of the Philippines - Quezon City
        <br />
        Group 8 • CS 002 - CS21S4 • S.Y. 2026–2027
      </footer>
    </div>
  );
}
