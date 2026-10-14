import React, { useState } from 'react';
import useFoodEntries from './hooks/useFoodEntries';
import FoodEntryForm from './components/FoodEntryForm';
import JournalDateSelector from './components/JournalDateSelector';
import { localDate, shiftDate } from './utils/journalDates';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('health-journal'); // 'overview' | 'food-journal' | 'health-journal' | 'my-goals' | 'profile' | 'accessibility'
  const [foodSubTab, setFoodSubTab] = useState('hub'); // 'hub' | 'daily' | 'overall'
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [mood, setMood] = useState('Good');
  const [energyLevel, setEnergyLevel] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foodJournalMenuOpen, setFoodJournalMenuOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(localDate);
  const journal = useFoodEntries();
  const entries = journal.entries.filter((entry) => entry.entryDate === selectedDate);
  const totals = entries.reduce((sum, entry) => ({
    calories: sum.calories + entry.calories, protein: sum.protein + entry.protein,
    carbs: sum.carbs + entry.carbs, fat: sum.fat + entry.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const goals = { calories: 2200, protein: 150, carbs: 270, fat: 65 };
  const meals = [
    { meal: 'Breakfast', icon: '🥐' }, { meal: 'Lunch', icon: '🍱' },
    { meal: 'Dinner', icon: '🍽️' }, { meal: 'Snacks', icon: '🍿' },
  ].map((meal) => ({ ...meal, items: entries.filter((entry) => entry.meal === meal.meal) }));
  const number = (value) => journal.loading ? '…' : journal.error ? '—' : Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
  const progress = (key) => `${Math.min(100, totals[key] / goals[key] * 100)}%`;
  const dateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(selectedDate, index - 6);
    return { date, calories: journal.entries.filter((entry) => entry.entryDate === date)
      .reduce((sum, entry) => sum + entry.calories, 0) };
  });
  const chartMax = Math.max(goals.calories, ...week.map((day) => day.calories));
  const chartPoints = week.map((day, index) => `${20 + index * 70},${100 - day.calories / chartMax * 90}`).join(' ');

  async function saveFood(entry) {
    const saved = await journal.save(entry);
    setSelectedDate(saved.entryDate);
  }

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

          <button className="log-food-btn" disabled={journal.loading || !!journal.error || journal.busy} onClick={() => setIsModalOpen(true)}>
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

          {/* SELECTED DAY'S MACROS WIDGET */}
          <div className="sidebar-macros">
            <span className="macros-title">SELECTED DAY'S MACROS</span>

            <div className="macro-row">
              <div className="macro-label">
                <span>Calories</span>
                <b>{number(totals.calories)} / {goals.calories} kcal</b>
              </div>
              <div className="progress-bar green"><span style={{ width: journal.loading || journal.error ? '0%' : progress('calories') }}></span></div>
            </div>

            <div className="macro-row">
              <div className="macro-label">
                <span>Protein</span>
                <b>{number(totals.protein)} / {goals.protein} g</b>
              </div>
              <div className="progress-bar blue"><span style={{ width: journal.loading || journal.error ? '0%' : progress('protein') }}></span></div>
            </div>

            <div className="macro-row">
              <div className="macro-label">
                <span>Carbs</span>
                <b>{number(totals.carbs)} / {goals.carbs} g</b>
              </div>
              <div className="progress-bar orange"><span style={{ width: journal.loading || journal.error ? '0%' : progress('carbs') }}></span></div>
            </div>

            <div className="macro-row">
              <div className="macro-label">
                <span>Fat</span>
                <b>{number(totals.fat)} / {goals.fat} g</b>
              </div>
              <div className="progress-bar pink"><span style={{ width: journal.loading || journal.error ? '0%' : progress('fat') }}></span></div>
            </div>
          </div>

          {/* LOG OUT BUTTON */}
          <button className="logout-btn">
            🚪 Log out
          </button>
        </aside>

        {/* MAIN VIEW CONTENT AREA */}
        <main className="main-content">
          {journal.loading && <p className="journal-notice" role="status">Loading saved food entries…</p>}
          {journal.error && <div className="journal-notice journal-error" role="alert">
            <p>{journal.error}</p><button type="button" disabled={journal.loading || journal.busy} onClick={journal.reload}>Retry</button>
          </div>}
          <p className="journal-selected-date">Food journal: {dateLabel}</p>
          
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
                  <span className="stat-label">Selected day calories</span>
                  <div className="stat-val">{number(totals.calories)} / {goals.calories} kcal</div>
                  <span className="stat-sub green-txt">{number(Math.max(0, goals.calories - totals.calories))} kcal remaining</span>
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
                    <span className="pill-badge">7 days ending {selectedDate}</span>
                  </div>
                  <svg className="chart-svg" viewBox="0 0 500 120">
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#d5ebd7" strokeDasharray="4" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#d5ebd7" strokeDasharray="4" />
                    <line x1="0" y1="90" x2="500" y2="90" stroke="#d5ebd7" strokeDasharray="4" />
                    <polyline points={journal.loading || journal.error ? '' : chartPoints} fill="none" stroke="#0b9b56" strokeWidth="3" />
                  </svg>
                  <div className="chart-days">
                    {week.map((day) => <span key={day.date} title={`${day.date}: ${number(day.calories)} kcal`}>{new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}<br />{number(day.calories)} kcal</span>)}
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
                  <button className="entry-delete-btn" onClick={() => { setActiveTab('food-journal'); setFoodSubTab('daily'); }}>View journal</button>
                </div>
                {entries.length === 0 && <p className="stat-sub">{journal.loading ? 'Loading…' : journal.error ? 'Journal unavailable' : 'No food logged for this date yet.'}</p>}
                {entries.slice(-4).reverse().map((act) => (
                  <div key={act.id} className="activity-row">
                    <div className="act-left">
                      <span className="act-icon">🍴</span>
                      <div>
                        <strong>{act.foodName}</strong>
                        <div className="stat-sub">{act.meal}</div>
                      </div>
                    </div>
                    <div className="act-right">
                      <span>{number(act.calories)} kcal</span>
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
              <JournalDateSelector value={selectedDate} onChange={setSelectedDate} />

              <div className="daily-journal-grid">
                <div className="meal-tables-column">
                  {meals.map((m, idx) => (
                    <div key={idx} className="meal-block">
                      <div className="meal-sidebar-tab">
                        <span className="tab-icon">{m.icon}</span>
                        <span className="tab-text">{m.meal}</span>
                      </div>
                      <div className="meal-table-wrap">
                        <table className="daily-table">
                          <thead>
                            <tr>
                              <th>Food</th><th>CALORIES</th><th>PROTEIN</th><th>FAT</th><th>CARBS</th><th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {m.items.length > 0 ? (
                              m.items.map((it) => (
                                <tr key={it.id}>
                                  <td>{it.foodName}</td><td>{number(it.calories)} kcal</td><td>{number(it.protein)} g</td><td>{number(it.fat)} g</td><td>{number(it.carbs)} g</td>
                                  <td><button className="entry-delete-btn" disabled={journal.busy} onClick={() => journal.remove(it.id)} aria-label={`Delete ${it.foodName}`}>Delete</button></td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan="6" className="empty-td">{journal.loading ? 'Loading…' : journal.error ? 'Journal unavailable' : 'No entries for this meal'}</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  <div className="daily-total-bar">
                    <div className="total-label">📋 Daily Total</div>
                    <div className="total-cell">CALORIES<br />{number(totals.calories)} kcal</div>
                    <div className="total-cell">PROTEIN<br />{number(totals.protein)} g</div>
                    <div className="total-cell">FAT<br />{number(totals.fat)} g</div>
                    <div className="total-cell">CARBS<br />{number(totals.carbs)} g</div>
                  </div>
                </div>

                <div className="widgets-column">
                  <div className="card right-widget">
                    <div className="widget-title">TODAY'S GOALS 🎯</div>
                    <div className="goals-mini-grid">
                      <div>{goals.calories} kcal</div><div>{goals.protein} g protein</div><div>{goals.fat} g fat</div><div>{goals.carbs} g carbs</div>
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
                  <div className="stat-sub">{dateLabel}</div>
                </div>
                <button className="primary-green-btn" disabled={journal.loading || !!journal.error || journal.busy} onClick={() => setIsModalOpen(true)}>+ Add Food</button>
              </div>

              {/* Date Bar */}
              <JournalDateSelector value={selectedDate} onChange={setSelectedDate} />

              {/* Top Macros Progress Cards */}
              <div className="overall-macros-grid">
                <div className="card macro-stat-box">
                  <span className="stat-label">Calories</span>
                  <div className="progress-bar green"><span style={{ width: journal.loading || journal.error ? '0%' : progress('calories') }}></span></div>
                  <span className="stat-sub align-right">{number(totals.calories)} / {goals.calories} kcal</span>
                </div>
                <div className="card macro-stat-box">
                  <span className="stat-label">Protein</span>
                  <div className="progress-bar blue"><span style={{ width: journal.loading || journal.error ? '0%' : progress('protein') }}></span></div>
                  <span className="stat-sub align-right">{number(totals.protein)} / {goals.protein} g</span>
                </div>
                <div className="card macro-stat-box">
                  <span className="stat-label">Carbs</span>
                  <div className="progress-bar orange"><span style={{ width: journal.loading || journal.error ? '0%' : progress('carbs') }}></span></div>
                  <span className="stat-sub align-right">{number(totals.carbs)} / {goals.carbs} g</span>
                </div>
                <div className="card macro-stat-box">
                  <span className="stat-label">Fat</span>
                  <div className="progress-bar pink"><span style={{ width: journal.loading || journal.error ? '0%' : progress('fat') }}></span></div>
                  <span className="stat-sub align-right">{number(totals.fat)} / {goals.fat} g</span>
                </div>
              </div>

              {/* Meal Column Cards */}
              <div className="overall-columns-grid">
                {meals.map((col, idx) => (
                  <div key={idx} className="card column-card">
                    <div className="column-header-banner">
                      <span>{col.meal}</span>
                      <span>{col.icon}</span>
                    </div>
                    <div className="column-body">
                      {col.items.length === 0 && <p className="stat-sub">{journal.loading ? 'Loading…' : journal.error ? 'Journal unavailable' : 'No entries for this meal'}</p>}
                      {col.items.map((it) => (
                        <div key={it.id} className="column-item-row">
                          <span>{it.foodName}</span>
                          <b>{number(it.calories)} kcal</b>
                          <button className="entry-delete-btn" disabled={journal.busy} onClick={() => journal.remove(it.id)} aria-label={`Delete ${it.foodName}`}>Delete</button>
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
      {isModalOpen && <FoodEntryForm date={selectedDate} busy={journal.busy} onSave={saveFood} onClose={() => setIsModalOpen(false)} />}

    </div>
  );
}