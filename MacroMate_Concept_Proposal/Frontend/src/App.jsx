import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('health-journal'); // 'overview' | 'food-journal' | 'health-journal' | 'my-goals' | 'profile' | 'accessibility'
  const [foodSubTab, setFoodSubTab] = useState('hub'); // 'hub' | 'daily' | 'overall'
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [mood, setMood] = useState('Good');
  const [energyLevel, setEnergyLevel] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foodJournalMenuOpen, setFoodJournalMenuOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '⊞' },
    { id: 'food-journal', label: 'Food Journal', icon: '🍴', hasSub: true },
    { id: 'health-journal', label: 'Health Journal', icon: '🩺' },
    { id: 'my-goals', label: 'My Goals', icon: '🎯' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
  ];

  return (
    <div className="app-shell">
      {/* TOP HEADER BAR */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-logo">
            <img 
              src={new URL('./assets/MacroMate Assets/MacroMate Icon and Assets/MacroMate Logo.png', import.meta.url).href} 
              alt="MacroMate Logo" 
              className="brand-icon-img" 
            />
            <span className="brand-text">MacroMate</span>
          </div>
          <div className="dashboard-title">
            <span className="title-icon">📊</span>
            <span>Personal Dashboard</span>
          </div>
        </div>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search activities..." />
        </div>

        <div className="topbar-right">
          <div className="notification-bell">
            🔔
            <span className="bell-badge">3</span>
          </div>

          <div className="user-profile">
            <div className="user-info">
              <div className="user-handle">@AaronLayman</div>
              <div className="user-role">Wellness member</div>
            </div>
            <div className="user-avatar">
              <img src="https://i.pravatar.cc/100?img=12" alt="Aaron Layman" />
            </div>
          </div>

          <button className="log-food-btn" onClick={() => setIsModalOpen(true)}>
            + Log Food
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER (SIDEBAR + CONTENT) */}
      <div className="app-body">
        {/* LEFT NAVIGATION SIDEBAR */}
        <aside className="sidebar">
          <span className="menu-header">MENU</span>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <React.Fragment key={item.id}>
                <button
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'food-journal') {
                      setFoodJournalMenuOpen(!foodJournalMenuOpen);
                      setFoodSubTab('hub');
                    }
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.hasSub && <span className="chevron">{foodJournalMenuOpen ? '˅' : '˃'}</span>}
                </button>

                {/* Submenu for Food Journal */}
                {item.id === 'food-journal' && (foodJournalMenuOpen || activeTab === 'food-journal') && (
                  <div className="submenu">
                    <button
                      className={`submenu-item ${foodSubTab === 'daily' ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTab('food-journal');
                        setFoodSubTab('daily');
                      }}
                    >
                      📓 Daily Food Journal
                    </button>
                    <button
                      className={`submenu-item ${foodSubTab === 'overall' ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTab('food-journal');
                        setFoodSubTab('overall');
                      }}
                    >
                      📖 Overall Food Journal
                    </button>
                  </div>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* INSPIRATION CARD */}
          <div className="sidebar-inspo-card">
            <strong>Small steps matter</strong>
            <p>Keep logging. Your healthy rhythm grows one day at a time.</p>
            <div className="footprints">👣 👣 👣 👣</div>
          </div>

          {/* TODAY'S MACROS WIDGET */}
          <div className="sidebar-macros">
            <span className="macros-title">TODAY'S MACROS</span>

            <div className="macro-row">
              <div className="macro-label">
                <span>Calories</span>
                <b>1091 / 2200 kcal</b>
              </div>
              <div className="progress-bar green"><span style={{ width: '49.5%' }}></span></div>
            </div>

            <div className="macro-row">
              <div className="macro-label">
                <span>Protein</span>
                <b>91 / 150 g</b>
              </div>
              <div className="progress-bar blue"><span style={{ width: '60.6%' }}></span></div>
            </div>

            <div className="macro-row">
              <div className="macro-label">
                <span>Carbs</span>
                <b>124 / 270 g</b>
              </div>
              <div className="progress-bar orange"><span style={{ width: '45.9%' }}></span></div>
            </div>

            <div className="macro-row">
              <div className="macro-label">
                <span>Fat</span>
                <b>23 / 65 g</b>
              </div>
              <div className="progress-bar pink"><span style={{ width: '35.3%' }}></span></div>
            </div>
          </div>

          {/* LOG OUT BUTTON */}
          <button className="logout-btn">
            🚪 Log out
          </button>
        </aside>

        {/* MAIN VIEW CONTENT AREA */}
        <main className="main-content">
          
          {/* IMAGE 1: HEALTH JOURNAL PAGE VIEW */}
          {activeTab === 'health-journal' && (
            <div className="page-view">
              <div className="page-header-block">
                <span className="sub-heading">Whole-person-wellness</span>
                <div className="page-title-row">
                  <h1 className="page-title">Health Journal</h1>
                  <div className="date-badge">
                    <span>📅</span> Saturday, October 03
                  </div>
                </div>
                <p className="page-description">Notice how your daily habits shape the way you feel.</p>
              </div>

              <div className="health-grid-top">
                {/* Check-In Card */}
                <div className="card checkin-card">
                  <h2>Today's check-in</h2>
                  <p className="card-subtext">A quick reflection takes less than a minute</p>

                  <div className="mood-selector">
                    {['Low', 'Okay', 'Good', 'Great'].map((m) => (
                      <button
                        key={m}
                        className={`mood-btn ${mood === m ? 'selected' : ''}`}
                        onClick={() => setMood(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <div className="mood-slider-bar">
                    <div className="slider-fill" style={{ width: mood === 'Good' ? '70%' : '50%' }}></div>
                  </div>
                  <div className="slider-labels">
                    <span>Drained</span>
                    <span>Energized</span>
                  </div>
                  
                  <div className="checkin-metrics">
                    <div className="metric-box">
                      <div className="metric-header">🌙 Sleep</div>
                      <div className="time-select-group">
                        {/* Hours Dropdown (1 - 12) */}
                        <select defaultValue="6" className="metric-select">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((hr) => (
                            <option key={hr} value={hr}>
                              {hr} {hr === 1 ? 'hr' : 'hrs'}
                            </option>
                          ))}
                        </select>

                        {/* Minutes Dropdown (0 - 59) */}
                        <select defaultValue="30" className="metric-select">
                          {Array.from({ length: 60 }, (_, i) => (
                            <option key={i} value={i}>
                              {i.toString().padStart(2, '0')} mins
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="metric-box">
                      <div className="metric-header">💧 Water</div>
                      <div className="water-counter">
                        <button onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}>-</button>
                        <span>{waterGlasses} Glasses</span>
                        <button onClick={() => setWaterGlasses(waterGlasses + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Latest Snapshot Card */}
                <div className="card snapshot-card">
                  <span className="snapshot-tag">LATEST SNAPSHOT</span>
                  <div className="snapshot-main">
                    <div>
                      <h2 className="snapshot-value">{mood}</h2>
                      <p className="snapshot-sub">Overall Mood</p>
                    </div>
                    <div className="heart-circle">💚</div>
                  </div>

                  <div className="snapshot-stats">
                    <div className="snap-box">
                      <div className="snap-num">4/5</div>
                      <div className="snap-lbl">Energy</div>
                    </div>
                    <div className="snap-box">
                      <div className="snap-num">7.5 h</div>
                      <div className="snap-lbl">Sleep</div>
                    </div>
                    <div className="snap-box">
                      <div className="snap-num">{waterGlasses}</div>
                      <div className="snap-lbl">Water</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mood Calendar & Average Mood Section */}
              <div className="health-grid-bottom">
                <div className="card mood-history-card">
                  <h2 className="section-title-center">MOOD</h2>
                  <div className="timeframe-tabs">
                    <button>Week</button>
                    <button className="active">Month</button>
                    <button>Year</button>
                  </div>

                  <div className="month-tabs">
                    <button>January</button>
                    <button>February</button>
                    <button className="active">March</button>
                    <button>April</button>
                  </div>

                  <div className="dots-grid">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} className={`mood-dot ${i === 6 ? 'neutral' : ''}`}>
                        {i === 6 ? '😐' : ''}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card avg-mood-card">
                  <h2 className="avg-title">Average Mood</h2>
                  <p className="avg-sub">Your average mood by day</p>

                  <div className="days-header">
                    <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                  </div>

                  <div className="calendar-grid">
                    {Array.from({ length: 26 }).map((_, i) => (
                      <div key={i} className={`calendar-day-dot ${i === 2 || i === 8 || i === 15 ? 'green-face' : i === 3 || i === 9 || i === 14 ? 'yellow-face' : ''}`}>
                        {i === 2 || i === 8 || i === 15 ? '😐' : i === 3 || i === 9 || i === 14 ? '😄' : ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IMAGE 5: OVERVIEW VIEW */}
          {activeTab === 'overview' && (
            <div className="page-view">
              <span className="sub-heading">Track your daily progress</span>
              <h1 className="page-title">Welcome Back, Aaron</h1>

              <div className="overview-stats">
                <div className="card overview-stat-card">
                  <span className="stat-label">Daily calories</span>
                  <div className="stat-val">1,091 / 2,200 kcal</div>
                  <span className="stat-sub green-txt">1,109 kcal remaining</span>
                  <span className="floating-badge">🔥 kcal</span>
                </div>

                <div className="card overview-stat-card">
                  <span className="stat-label">Mood Score</span>
                  <div className="stat-val">{mood}</div>
                  <span className="stat-sub">{energyLevel}/5 energy today</span>
                  <span className="floating-badge">😊</span>
                </div>

                <div className="card overview-stat-card">
                  <span className="stat-label">Water intake</span>
                  <div className="stat-val">{waterGlasses} glasses</div>
                  <span className="stat-sub">7.5 hrs of Sleep</span>
                  <span className="floating-badge">💧</span>
                </div>
              </div>

              <div className="overview-middle-grid">
                <div className="card chart-card">
                  <div className="chart-header">
                    <div>
                      <strong>Weekly Progress</strong>
                      <div className="stat-sub">Calories logged over the past seven days</div>
                    </div>
                    <span className="pill-badge">This Week</span>
                  </div>
                  <svg className="chart-svg" viewBox="0 0 500 120">
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#d5ebd7" strokeDasharray="4" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#d5ebd7" strokeDasharray="4" />
                    <line x1="0" y1="90" x2="500" y2="90" stroke="#d5ebd7" strokeDasharray="4" />
                    <polyline points="20,70 90,95 160,60 230,80 300,45 370,85 440,25" fill="none" stroke="#0b9b56" strokeWidth="3" />
                  </svg>
                  <div className="chart-days">
                    <span>Sunday</span><span>Monday</span><span>Tuesday</span><span>Wednesday</span><span>Thursday</span><span>Friday</span><span>Saturday</span>
                  </div>
                </div>

                <div className="card goals-checklist-card">
                  <strong className="card-heading">Today's goals</strong>
                  <div className="goal-item done">
                    <span className="chk">✓</span>
                    <div>
                      <div>Log breakfast</div>
                      <span className="goal-sub">7.5 hrs of Sleep</span>
                    </div>
                  </div>
                  <div className="goal-item">
                    <span className="chk"></span>
                    <div>
                      <div>Drink 8 glasses of water</div>
                      <span className="goal-sub">All day</span>
                    </div>
                  </div>
                  <div className="goal-item done">
                    <span className="chk">✓</span>
                    <div>
                      <div>30 min activity</div>
                      <span className="goal-sub">05:30 PM</span>
                    </div>
                  </div>
                  <div className="goal-item">
                    <span className="chk"></span>
                    <div>
                      <div>Evening reflection</div>
                      <span className="goal-sub">09:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card recent-activity-card">
                <div className="recent-header">
                  <strong>Recent activity</strong>
                  <span className="link-green">View All</span>
                </div>
                {[
                  { name: 'Oatmeal with banana', meal: 'Breakfast', icon: '🥣', time: '07:35' },
                  { name: 'Black Coffee', meal: 'Breakfast', icon: '☕', time: '07:35' },
                  { name: 'Grilled Chicken Breast', meal: 'Lunch', icon: '🍗', time: '12:15' },
                  { name: 'Brown rice (1 cup)', meal: 'Lunch', icon: '🍚', time: '12:15' },
                ].map((act, i) => (
                  <div key={i} className="activity-row">
                    <div className="act-left">
                      <span className="act-icon">{act.icon}</span>
                      <div>
                        <strong>{act.name}</strong>
                        <div className="stat-sub">{act.meal}</div>
                      </div>
                    </div>
                    <div className="act-right">
                      <span>{act.time}</span>
                      <span className="logged-tag">Logged</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMAGE 6: FOOD JOURNAL CATEGORIES HUB */}
          {activeTab === 'food-journal' && foodSubTab === 'hub' && (
            <div className="page-view">
              <h1 className="giant-title">Food Journal Categories</h1>
              <div className="hub-categories-grid">
                <div className="hub-card crimson-hub" onClick={() => setFoodSubTab('daily')}>
                  <div className="hub-icons">
                    <span>📅</span>
                    <span>🍴</span>
                  </div>
                  <h2>Daily<br />Food Journal</h2>
                  <p>Log today's Meals & Snacks</p>
                </div>

                <div className="hub-card gold-hub" onClick={() => setFoodSubTab('overall')}>
                  <div className="hub-icons">
                    <span>📖</span>
                    <span>🍴</span>
                  </div>
                  <h2>Overall<br />Food Journal</h2>
                  <p>Review History & Track Progress</p>
                </div>
              </div>
            </div>
          )}

          {/* IMAGE 8: DAILY FOOD JOURNAL VIEW */}
          {activeTab === 'food-journal' && foodSubTab === 'daily' && (
            <div className="page-view">
              <span className="sub-heading">Track your daily journal</span>
              <h1 className="page-title">Daily Food Journal</h1>

              {/* Date Navigation Bar */}
              <div className="date-strip-card">
                <button className="arrow-btn">‹</button>
                <span className="date-center">10/03/26</span>
                <div className="days-strip">
                  {['WED 30', 'THU 01', 'FRI 02', 'SAT 03', 'SUN 04', 'MON 05', 'TUE 06'].map((d, i) => (
                    <div key={i} className={`strip-day ${i === 3 ? 'active' : ''}`}>
                      <span className="day-name">{d.split(' ')[0]}</span>
                      <span className="day-num">{d.split(' ')[1]}</span>
                      {i === 3 && <span className="active-dot">•</span>}
                    </div>
                  ))}
                </div>
                <button className="arrow-btn">›</button>
              </div>

              <div className="daily-journal-grid">
                <div className="meal-tables-column">
                  {[
                    { meal: 'Breakfast', icon: '🥐', items: [{ name: 'Hashbrowns', cal: '272 kcal', p: '2g', f: '10g', c: '20g' }, { name: 'Black Coffee (240mL)', cal: '2.4 kcal', p: '0.1g', f: '0g', c: '0g' }] },
                    { meal: 'Lunch', icon: '⏰', items: [] },
                    { meal: 'Dinner', icon: '🍽️', items: [] },
                    { meal: 'Snacks', icon: '🍿', items: [] },
                  ].map((m, idx) => (
                    <div key={idx} className="meal-block">
                      <div className="meal-sidebar-tab">
                        <span className="tab-icon">{m.icon}</span>
                        <span className="tab-text">{m.meal}</span>
                      </div>
                      <div className="meal-table-wrap">
                        <table className="daily-table">
                          <thead>
                            <tr>
                              <th>Food</th><th>CALORIES</th><th>PROTEIN</th><th>FAT</th><th>CARBS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {m.items.length > 0 ? (
                              m.items.map((it, i) => (
                                <tr key={i}>
                                  <td>{it.name}</td><td>{it.cal}</td><td>{it.p}</td><td>{it.f}</td><td>{it.c}</td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan="5" className="empty-td">&nbsp;</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  <div className="daily-total-bar">
                    <div className="total-label">📋 Daily Total</div>
                    <div className="total-cell">CALORIES</div>
                    <div className="total-cell">PROTEIN</div>
                    <div className="total-cell">FAT</div>
                    <div className="total-cell">CARBS</div>
                  </div>
                </div>

                <div className="widgets-column">
                  <div className="card right-widget">
                    <div className="widget-title">TODAY'S GOALS 🎯</div>
                    <div className="goals-mini-grid">
                      <div>CALORIES</div><div>PROTEIN</div><div>FAT</div><div>CARBS</div>
                    </div>
                  </div>

                  <div className="card right-widget">
                    <div className="widget-title">WATER INTAKE 💧</div>
                    <div className="droplets-row">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                        <span key={g} className={`droplet ${g <= waterGlasses ? 'filled' : ''}`} onClick={() => setWaterGlasses(g)}>💧</span>
                      ))}
                    </div>
                  </div>

                  <div className="card right-widget">
                    <div className="widget-title">ENERGY LEVEL ⚡</div>
                    <div className="energy-boxes">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button key={lvl} className={`energy-num ${energyLevel === lvl ? 'active' : ''}`} onClick={() => setEnergyLevel(lvl)}>{lvl}</button>
                      ))}
                    </div>
                  </div>

                  <div className="card right-widget motivation-box">
                    <div className="widget-title red-txt">MOTIVATION ⚡</div>
                    <p>Keeping a health, wellness, and food journal transforms vague intentions into clear, empowering habits that connect your daily choices to how you feel.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IMAGE 7: OVERALL FOOD JOURNAL VIEW */}
          {activeTab === 'food-journal' && foodSubTab === 'overall' && (
            <div className="page-view">
              <div className="overall-header">
                <div>
                  <h1 className="page-title">Food Journal</h1>
                  <div className="stat-sub">Saturday, October 03, 2026</div>
                </div>
                <button className="primary-green-btn" onClick={() => setIsModalOpen(true)}>+ Add Food</button>
              </div>

              {/* Date Bar */}
              <div className="date-strip-card" style={{ margin: '16px 0' }}>
                <button className="arrow-btn">‹</button>
                <span className="date-center">10/03/26</span>
                <div className="days-strip">
                  {['WED 30', 'THU 01', 'FRI 02', 'SAT 03', 'SUN 04', 'MON 05', 'TUE 06'].map((d, i) => (
                    <div key={i} className={`strip-day ${i === 3 ? 'active' : ''}`}>
                      <span className="day-name">{d.split(' ')[0]}</span>
                      <span className="day-num">{d.split(' ')[1]}</span>
                      {i === 3 && <span className="active-dot">•</span>}
                    </div>
                  ))}
                </div>
                <button className="arrow-btn">›</button>
              </div>

              {/* Top Macros Progress Cards */}
              <div className="overall-macros-grid">
                <div className="card macro-stat-box">
                  <span className="stat-label">Calories</span>
                  <div className="progress-bar green"><span style={{ width: '49.5%' }}></span></div>
                  <span className="stat-sub align-right">1091 / 2200 kcal</span>
                </div>
                <div className="card macro-stat-box">
                  <span className="stat-label">Protein</span>
                  <div className="progress-bar blue"><span style={{ width: '60.6%' }}></span></div>
                  <span className="stat-sub align-right">91 / 150 g</span>
                </div>
                <div className="card macro-stat-box">
                  <span className="stat-label">Carbs</span>
                  <div className="progress-bar orange"><span style={{ width: '45.9%' }}></span></div>
                  <span className="stat-sub align-right">124 / 240 g</span>
                </div>
                <div className="card macro-stat-box">
                  <span className="stat-label">Fat</span>
                  <div className="progress-bar pink"><span style={{ width: '35.3%' }}></span></div>
                  <span className="stat-sub align-right">23 / 65 g</span>
                </div>
              </div>

              {/* Meal Column Cards */}
              <div className="overall-columns-grid">
                {[
                  { title: 'Breakfast', icon: '🥐', items: [{ name: 'Hashbrowns', val: '272 kcal' }, { name: 'Black Coffee (240mL)', val: '2.4 kcal' }] },
                  { title: 'Lunch', icon: '🍱', items: [] },
                  { title: 'Dinner', icon: '🍽️', items: [] },
                  { title: 'Snacks', icon: '⏰', items: [] },
                ].map((col, idx) => (
                  <div key={idx} className="card column-card">
                    <div className="column-header-banner">
                      <span>{col.title}</span>
                      <span>{col.icon}</span>
                    </div>
                    <div className="column-body">
                      {col.items.map((it, i) => (
                        <div key={i} className="column-item-row">
                          <span>{it.name}</span>
                          <b>{it.val}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMAGE 2: MY GOALS VIEW */}
          {activeTab === 'my-goals' && (
            <div className="page-view">
              <h1 className="giant-title">Your Goals, Your Future!</h1>

              <div className="goals-grid">
                <div className="card workout-card">
                  <h3 className="section-green-title">➕ Your Recent Workout</h3>
                  {[
                    { type: 'Outdoor Running', dist: '2.24km', date: 'Oct 3, 2026' },
                    { type: 'Outdoor Running', dist: '5.43km', date: 'Oct 1, 2026' },
                    { type: 'Outdoor Running', dist: '3.21km', date: 'Sep 29, 2026' },
                    { type: 'Outdoor Running', dist: '892m', date: 'Sep 27, 2026' },
                    { type: 'Outdoor Running', dist: '2.94km', date: 'Sep 26, 2026' },
                  ].map((w, i) => (
                    <div key={i} className="workout-row">
                      <div>
                        <div className="stat-sub">{w.type}</div>
                        <strong className="dist-num">{w.dist}</strong>
                      </div>
                      <span className="stat-sub">{w.date}</span>
                    </div>
                  ))}
                </div>

                <div className="goals-right-col">
                  <div className="card bar-chart-card">
                    <div className="days-bars-container">
                      {[
                        { day: 'Sun', height: '25%', val: '892m' },
                        { day: 'Mon', height: '0%', val: '0' },
                        { day: 'Tue', height: '60%', val: '3.21km' },
                        { day: 'Wed', height: '0%', val: '0' },
                        { day: 'Thu', height: '95%', val: '5.43km' },
                        { day: 'Fri', height: '0%', val: '0' },
                        { day: 'Sat', height: '45%', val: '2.24km' },
                      ].map((b, i) => (
                        <div key={i} className="bar-col">
                          <span className="bar-day">{b.day}</span>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ height: b.height }}></div>
                          </div>
                          <span className="bar-val">{b.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card best-day-card">
                    <span className="stat-sub">Your Best Day of the week</span>
                    <h2 className="best-day-title">Thursday</h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IMAGE 3: PROFILE VIEW */}
          {activeTab === 'profile' && (
            <div className="page-view">
              <span className="sub-heading">Manage your personal wellness details</span>
              <h1 className="page-title">My Profile</h1>

              <div className="profile-grid">
                <div className="profile-left-col">
                  <div className="card profile-badge-card">
                    <div className="avatar-circle">
                      AL
                      <span className="cam-icon">📷</span>
                    </div>
                    <h2>Aaron Layman</h2>
                    <span className="stat-sub">Wellness Member</span>
                    <div className="complete-pill">Profile Complete</div>
                  </div>

                  <div className="card goal-highlight-card">
                    <div className="heart-icon-badge">🤍</div>
                    <h3>Your Wellness Goal</h3>
                    <p className="stat-sub">Maintain a balanced lifestyle</p>
                  </div>
                </div>

                <div className="card profile-form-card">
                  <h3>Personal Information</h3>
                  <p className="stat-sub">Used to personalize your nutrition and wellness targets.</p>

                  <div className="form-group">
                    <label>FULL NAME</label>
                    <input type="text" defaultValue="Aaron Layman" className="grey-input" />
                  </div>

                  <div className="form-group">
                    <label>EMAIL ADDRESS</label>
                    <input type="email" defaultValue="aaronlayman@gmail.com" className="grey-input" />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>AGE</label>
                      <input type="text" defaultValue="23" className="grey-input" />
                    </div>
                    <div className="form-group">
                      <label>HEIGHT</label>
                      <input type="text" defaultValue="154cm" className="grey-input" />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>WEIGHT (KG)</label>
                      <input type="text" defaultValue="51" className="grey-input" />
                    </div>
                    <div className="form-group">
                      <label>ACTIVITY LEVEL</label>
                      <select defaultValue="Moderately Active" className="grey-input">
                        <option>Moderately Active</option>
                        <option>Very Active</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>PRIMARY WELLNESS GOAL</label>
                    <input type="text" defaultValue="Maintain a balanced lifestyle" className="grey-input" />
                  </div>

                  <div className="reminders-banner">
                    <strong>Daily Reminders</strong>
                    <p className="stat-sub">Receive gentle prompts to log meals and wellness.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IMAGE 4: ACCESSIBILITY VIEW */}
          {activeTab === 'accessibility' && (
            <div className="page-view">
              <h1 className="page-title" style={{ marginBottom: '20px' }}>Settings and Accesibility</h1>

              <div className="settings-grid">
                <div className="card settings-sidebar-card">
                  <button className="settings-nav-item">My Details</button>
                  <button className="settings-nav-item">Profile</button>
                  <button className="settings-nav-item">Password</button>
                  <button className="settings-nav-item">Team</button>
                  <button className="settings-nav-item">Notification</button>
                  <button className="settings-nav-item active">Accessibility</button>
                </div>

                <div className="card settings-content-card">
                  <h2 className="settings-heading">Accessibility</h2>

                  {[
                    { title: 'High Contrast Mode', desc: 'Increase the visual difference between text, controls, and background.' },
                    { title: 'Reduce Motion', desc: 'Minimize animations and smooth scrolling throughout the application.' },
                    { title: 'Enhanced keyboard focus', desc: 'Show a stronger focus outline when navigation with a keyboard.' },
                    { title: 'Screen-reader announcements', desc: 'Provide additional spoken confirmation when accessibility settings change.' },
                  ].map((opt, i) => (
                    <div key={i} className="toggle-row">
                      <div>
                        <strong>{opt.title}</strong>
                        <p className="stat-sub">{opt.desc}</p>
                      </div>
                      <label className="switch">
                        <input type="checkbox" defaultChecked={i === 0} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* LOG FOOD MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log Food Item</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <input type="text" placeholder="Food name (e.g. Avocado Toast)" className="grey-input" />
            
            {/* MEAL CATEGORY SELECT */}
            <select className="grey-input" defaultValue="Breakfast">
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snacks">Snacks</option>
            </select>

            <input type="number" placeholder="Calories (kcal)" className="grey-input" />
            <input type="number" placeholder="Protein (g)" className="grey-input" min="0" step="0.1" />
            <input type="number" placeholder="Carbs (g)" className="grey-input" min="0" step="0.1" />
            <input type="number" placeholder="Fats (g)" className="grey-input" min="0" step="0.1" />
            <button className="primary-green-btn" onClick={() => setIsModalOpen(false)}>Add Entry</button>
          </div>
        </div>
      )}
    </div>
  );
}