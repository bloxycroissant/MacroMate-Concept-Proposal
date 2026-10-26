import React, { useEffect, useState } from 'react';
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
import WelcomePage from './pages/WelcomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import { localDate, shiftDate } from './utils/journalDates';
import './App.css';
import useWellness from './hooks/useWellness';
import { auth, cloudEnabled } from './firebase/client';
import { signOut } from 'firebase/auth';

export default function App() {
  // Navigation Flow State: 'welcome' -> 'signup' -> 'login' -> 'dashboard'
  const [currentScreen, setCurrentScreen] = useState('welcome');

  // Unified User Credentials State (Captured from Sign Up & Log In)
  const [userAuth, setUserAuth] = useState({
    fullName: 'Christianne Denise S. Sabando', // Default fallback name
    email: 'denise@gmail.com',
    password: ''
  });

  // Dashboard Tabs State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'food-journal' | 'health-journal' | 'my-goals' | 'profile' | 'accessibility'
  const [foodSubTab, setFoodSubTab] = useState('hub'); // 'hub' | 'daily' | 'overall'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foodJournalMenuOpen, setFoodJournalMenuOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(localDate);
  const wellness = useWellness(selectedDate);
  const { mood, waterGlasses, energyLevel, sleepMinutes, completedGoals } = wellness.day;
  const setWaterGlasses = (value) => wellness.ready && wellness.updateDay({ waterGlasses: Math.max(0, Math.min(8, value)) });
  const setEnergyLevel = (value) => wellness.ready && wellness.updateDay({ energyLevel: value });

  // Display Name Priority: Sign-Up/Login Full Name -> Firebase User Email -> Default
  const displayName = userAuth.fullName || wellness.profile.fullName || auth?.currentUser?.email || 'Wellness member';

  useEffect(() => {
    document.body.classList.toggle('wellness-reduce-motion', wellness.preferences.reduceMotion);
    return () => document.body.classList.remove('wellness-reduce-motion');
  }, [wellness.preferences.reduceMotion]);

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

  const handleNavigate = (targetScreen) => {
    setCurrentScreen(targetScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called when user submits Sign Up form
  const handleSignUpData = (newUserData) => {
    setUserAuth({
      fullName: newUserData.name,
      email: newUserData.email,
      password: newUserData.password
    });
    // Sync with Wellness Profile hook if ready
    if (wellness.ready) {
      wellness.saveProfile({ ...wellness.profile, fullName: newUserData.name });
    }
    handleNavigate('login');
  };

  // Called when user submits Login form
  const handleLoginSubmit = (loginData) => {
    setUserAuth((prev) => ({
      ...prev,
      email: loginData.email,
      password: loginData.password
    }));
    handleNavigate('dashboard');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '⊞' },
    { id: 'food-journal', label: 'Food Journal', icon: '🍴', hasSub: true },
    { id: 'health-journal', label: 'Health Journal', icon: '🩺' },
    { id: 'my-goals', label: 'My Goals', icon: '🎯' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
  ];

  // 1. WELCOME PAGE
  if (currentScreen === 'welcome') {
    return <WelcomePage onNavigate={handleNavigate} />;
  }

  // 2. SIGN UP PAGE (Receives User Registration Callback)
  if (currentScreen === 'signup') {
    return <SignUpPage onNavigate={handleNavigate} onSignUp={handleSignUpData} />;
  }

  // 3. LOG IN PAGE (Receives Credentials and Default Saved Email)
  if (currentScreen === 'login') {
    return <LoginPage onNavigate={handleNavigate} onLogin={handleLoginSubmit} savedAuth={userAuth} />;
  }

  // 4. PERSONAL DASHBOARD
  return (
    <div className={`app-shell ${wellness.preferences.highContrast ? 'wellness-high-contrast' : ''} ${wellness.preferences.enhancedFocus ? 'wellness-enhanced-focus' : ''}`}>
      <div className="cloud-status" role="status" aria-live={wellness.preferences.announcements ? 'polite' : 'off'}>
        {cloudEnabled ? (wellness.error ? 'Cloud records need attention' : wellness.pending ? 'Saving to Firebase…' : wellness.ready ? 'Firebase mode · No pending changes' : 'Loading Firebase records…') : 'Local demo · Wellness changes are temporary until Firebase is enabled'}
      </div>
      
      {/* TOP HEADER BAR */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentScreen('welcome')}>
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
              {/* Dynamically Populated User Handle from Sign Up */}
              <div className="user-handle">{displayName}</div>
              <div className="user-role">Wellness member</div>
            </div>
            <div className="user-avatar">
              <img src="https://i.pravatar.cc/100?img=12" alt="User avatar" />
            </div>
          </div>

          <button className="log-food-btn" disabled={journal.loading || !!journal.error || journal.busy} onClick={() => setIsModalOpen(true)}>
            + Log Food
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
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
          <button 
            className="logout-btn" 
            onClick={() => {
              if (cloudEnabled) {
                signOut(auth).catch(() => window.alert('Could not log out. Please try again.'));
              }
              setCurrentScreen('welcome');
            }}
          >
            🚪 Log out
          </button>
        </aside>

        {/* MAIN VIEW CONTENT AREA */}
        <main className="main-content">
          {wellness.error && <p className="journal-notice journal-error" role="alert">{wellness.error}</p>}
          {journal.loading && <p className="journal-notice" role="status">Loading saved food entries…</p>}
          {journal.error && <div className="journal-notice journal-error" role="alert">
            <p>{journal.error}</p><button type="button" disabled={journal.loading || journal.busy} onClick={journal.reload}>Retry</button>
          </div>}
          <p className="journal-selected-date">Food journal: {dateLabel}</p>
          
          {activeTab === 'health-journal' && (
            <HealthJournalPage
              date={selectedDate} onDateChange={setSelectedDate} day={wellness.day} days={wellness.days}
              onChange={wellness.updateDay} disabled={!wellness.ready}
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
              displayName={displayName} sleepMinutes={sleepMinutes} completedGoals={completedGoals}
              onGoalChange={(goal) => wellness.updateDay({ completedGoals: completedGoals.includes(goal) ? completedGoals.filter((item) => item !== goal) : [...completedGoals, goal] })}
              wellnessDisabled={!wellness.ready}
              onViewJournal={() => { setActiveTab('food-journal'); setFoodSubTab('daily'); }}
            />
          )}

          {activeTab === 'food-journal' && foodSubTab === 'hub' && (
            <FoodJournalHubPage
              onSelectDaily={() => setFoodSubTab('daily')}
              onSelectOverall={() => setFoodSubTab('overall')}
            />
          )}

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
          
          {/* PROFILE PAGE (Synced with Registered Full Name and Email) */}
          {activeTab === 'profile' && (
            <ProfilePage 
              profile={{ ...wellness.profile, fullName: userAuth.fullName || wellness.profile.fullName }} 
              email={userAuth.email || auth?.currentUser?.email} 
              onSave={wellness.saveProfile} 
              busy={!wellness.ready} 
            />
          )}
          
          {activeTab === 'accessibility' && <AccessibilityPage preferences={wellness.preferences} onChange={wellness.updatePreference} busy={!wellness.ready} />}

        </main>
      </div>

      {/* LOG FOOD MODAL */}
      {isModalOpen && <FoodEntryForm date={selectedDate} busy={journal.busy} onSave={saveFood} onClose={() => setIsModalOpen(false)} />}

    </div>
  );
}