import React, { useState } from 'react';
import useFoodEntries from './hooks/useFoodEntries';
import FoodEntryForm from './components/FoodEntryForm';
import DailyFoodJournalPage from './pages/DailyFoodJournalPage';
import HealthJournalPage from './pages/HealthJournalPage';
import OverviewPage from './pages/OverviewPage';
import FoodJournalHubPage from './pages/FoodJournalHubPage';
import OverallFoodJournalPage from './pages/OverallFoodJournalPage';
import GoalsPage from './pages/GoalsPage';
import ProfilePage from './pages/ProfilePage';
import AccessibilityPage from './pages/AccessibilityPage';
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
          
          {activeTab === 'health-journal' && (
            <HealthJournalPage
              mood={mood}
              onMoodChange={setMood}
              waterGlasses={waterGlasses}
              onWaterGlassesChange={setWaterGlasses}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewPage
              totals={totals}
              goals={goals}
              mood={mood}
              energyLevel={energyLevel}
              waterGlasses={waterGlasses}
              selectedDate={selectedDate}
              week={week}
              chartPoints={chartPoints}
              loading={journal.loading}
              error={journal.error}
              entries={entries}
              formatNumber={number}
              onViewJournal={() => { setActiveTab('food-journal'); setFoodSubTab('daily'); }}
            />
          )}

          {activeTab === 'food-journal' && foodSubTab === 'hub' && (
            <FoodJournalHubPage
              onSelectDaily={() => setFoodSubTab('daily')}
              onSelectOverall={() => setFoodSubTab('overall')}
            />
          )}

          {/* DAILY FOOD JOURNAL VIEW */}
          {activeTab === 'food-journal' && foodSubTab === 'daily' && (
            <DailyFoodJournalPage
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              meals={meals}
              totals={totals}
              goals={goals}
              loading={journal.loading}
              error={journal.error}
              busy={journal.busy}
              onDelete={journal.remove}
              waterGlasses={waterGlasses}
              onWaterGlassesChange={setWaterGlasses}
              energyLevel={energyLevel}
              onEnergyLevelChange={setEnergyLevel}
              formatNumber={number}
            />
          )}

          {activeTab === 'food-journal' && foodSubTab === 'overall' && (
            <OverallFoodJournalPage
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              meals={meals}
              totals={totals}
              goals={goals}
              loading={journal.loading}
              error={journal.error}
              busy={journal.busy}
              onDelete={journal.remove}
              onAddFood={() => setIsModalOpen(true)}
              formatNumber={number}
              progress={progress}
            />
          )}

          {activeTab === 'my-goals' && <GoalsPage />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'accessibility' && <AccessibilityPage />}

        </main>
      </div>

      {/* LOG FOOD MODAL */}
      {isModalOpen && <FoodEntryForm date={selectedDate} busy={journal.busy} onSave={saveFood} onClose={() => setIsModalOpen(false)} />}

    </div>
  );
}