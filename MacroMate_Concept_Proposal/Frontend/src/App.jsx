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
import { cloudEnabled, supabase } from './supabase/client';
import { useAuth } from './supabase/authContext';
import ResetPasswordPage from './pages/ResetPasswordPage';

export default function App() {
  const auth = useAuth() || {};
  const user = auth.user || null;
  const recovery = auth.recovery || false;
  const finishRecovery = auth.finishRecovery || (() => {});

  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [accountError, setAccountError] = useState('');

  const [activeTab, setActiveTab] = useState('overview');
  const [foodSubTab, setFoodSubTab] = useState('hub');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foodJournalMenuOpen, setFoodJournalMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const [selectedDate, setSelectedDate] = useState(localDate);
  const wellness = useWellness(selectedDate) || {};
  const dayData = wellness.day || {};
  const preferences = wellness.preferences || {};
  const profileData = wellness.profile || {};

  const { mood, waterGlasses, energyLevel, sleepMinutes, completedGoals = [] } = dayData;

  const setWaterGlasses = (value) => wellness.ready && !wellness.pending && wellness.updateDay?.({ waterGlasses: Math.max(0, Math.min(8, value)) });
  const setEnergyLevel = (value) => wellness.ready && !wellness.pending && wellness.updateDay?.({ energyLevel: value });

  // 🌟 Universal Full Name and Profile Picture Sync Across Website
  const displayName = profileData.fullName || user?.user_metadata?.full_name || 'Wellness member';
  useEffect(() => {
    if (cloudEnabled && user && ['welcome', 'login', 'signup'].includes(currentScreen)) {
      setCurrentScreen('dashboard');
    }
  }, [user, cloudEnabled, currentScreen]);

  const displayEmail = user?.email || 'Local demo';
  const displayPfp = profileData.pfpUrl || new URL('./assets/MacroMate Assets/MacroMate Icon and Assets/MacroMate Logo.png', import.meta.url).href;

  useEffect(() => {
    document.body.classList.toggle('wellness-reduce-motion', !!preferences.reduceMotion);
    return () => document.body.classList.remove('wellness-reduce-motion');
  }, [preferences.reduceMotion]);

  const journal = useFoodEntries() || { entries: [] };
  const entries = (journal.entries || []).filter((entry) => entry.entryDate === selectedDate);
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
    return { date, calories: (journal.entries || []).filter((entry) => entry.entryDate === date)
      .reduce((sum, entry) => sum + entry.calories, 0) };
  });
  const chartMax = Math.max(goals.calories, ...week.map((day) => day.calories));
  const chartPoints = week.map((day, index) => `${20 + index * 70},${100 - day.calories / chartMax * 90}`).join(' ');

  async function saveFood(entry) {
    if (journal.save) {
      const saved = await journal.save(entry);
      if (saved?.entryDate) setSelectedDate(saved.entryDate);
    }
  }

  const handleNavigate = (targetScreen) => {
    if (cloudEnabled && !user && targetScreen === 'dashboard') targetScreen = 'login';
    if (cloudEnabled && user && ['login', 'signup'].includes(targetScreen)) targetScreen = 'dashboard';
    setCurrentScreen(targetScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignUpData = async (newUserData) => {
    if (!cloudEnabled) {
      setCurrentScreen('dashboard');
      return '';
    }
    const { data, error } = await supabase.auth.signUp({ 
      email: newUserData.email, 
      password: newUserData.password,
      options: { data: { full_name: newUserData.name }, emailRedirectTo: window.location.origin } 
    });
    if (error) throw error;
    if (data.session) {
      setCurrentScreen('dashboard');
      return '';
    }
    return 'Check your email to confirm your account, then log in.';
  };

  const handleLoginSubmit = async (loginData) => {
    if (!cloudEnabled) {
      setCurrentScreen('dashboard');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword(loginData);
    if (error) throw error;
    setCurrentScreen('dashboard');
  };

  const handleSaveProfile = async (profileDataInput) => {
    if (wellness.saveProfile) await wellness.saveProfile(profileDataInput);
  };

  async function logOut() {
    if (!cloudEnabled) { handleNavigate('welcome'); return; }
    setAccountError('');
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAccountError('Could not log out. Check your connection and try again.');
    } else {
      handleNavigate('welcome');
    }
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '⊞' },
    { id: 'food-journal', label: 'Food Journal', icon: '🍴', hasSub: true },
    { id: 'health-journal', label: 'Health Journal', icon: '🩺' },
    { id: 'my-goals', label: 'My Goals', icon: '🎯' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
  ];
  const searchPages = [
    ...menuItems.filter((item) => item.id !== 'food-journal'),
    { id: 'daily-food-journal', label: 'Daily Food Journal' },
    { id: 'overall-food-journal', label: 'Overall Food Journal' },
  ];
  const searchTerm = searchQuery.trim().toLowerCase();
  const searchResults = searchTerm ? [
    ...searchPages.filter((item) => item.label.toLowerCase().includes(searchTerm)),
    ...(journal.entries || []).filter((entry) => entry.foodName.toLowerCase().includes(searchTerm))
      .slice(0, 5).map((entry) => ({ ...entry, id: 'food-entry', label: `${entry.foodName} · ${entry.meal} · ${entry.entryDate}` })),
  ] : [];
  function openSearchResult(result) {
    if (result.id === 'daily-food-journal' || result.id === 'overall-food-journal' || result.id === 'food-entry') {
      setActiveTab('food-journal');
      setFoodJournalMenuOpen(true);
      setFoodSubTab(result.id === 'overall-food-journal' ? 'overall' : 'daily');
    } else {
      setActiveTab(result.id);
    }
    if (result.entryDate) setSelectedDate(result.entryDate);
    setSearchQuery('');
  }

  if (recovery) return <ResetPasswordPage onDone={finishRecovery} />;
  const canShowDashboard = cloudEnabled && !!user;
  if (currentScreen === 'welcome' && !canShowDashboard) return <WelcomePage onNavigate={handleNavigate} allowDemo={!cloudEnabled} />;
  if (currentScreen === 'signup' && !canShowDashboard) return <SignUpPage onNavigate={handleNavigate} onSignUp={handleSignUpData} />;
  if (currentScreen === 'login' && !canShowDashboard) return <LoginPage onNavigate={handleNavigate} onLogin={handleLoginSubmit} />;

  return (
    <div className={`app-shell ${preferences.highContrast ? 'wellness-high-contrast' : ''} ${preferences.enhancedFocus ? 'wellness-enhanced-focus' : ''}`}>
      <div className="session-status" role="status" aria-live={preferences.announcements ? 'polite' : 'off'}>
        Local demo · Food and workouts save to H2. Health, goals, profile and accessibility changes reset on refresh.
        {cloudEnabled ? (wellness.error ? 'Saved records need attention' : wellness.pending ? 'Saving your changes…' : wellness.ready ? 'Supabase connected · No pending changes' : 'Loading your records…') : 'Local demo · Food and workouts use H2. Other changes reset on refresh.'}
      </div>
      
      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-left">
          <button type="button" className="brand-logo" onClick={() => handleNavigate(user ? 'dashboard' : 'welcome')} aria-label="Go to MacroMate home">
            <img 
              src={new URL('./assets/MacroMate Assets/MacroMate Icon and Assets/MacroMate Logo.png', import.meta.url).href} 
              alt="MacroMate Logo" 
              className="brand-icon-img" 
            />
            <span className="brand-text">MacroMate</span>
          </button>
          <div className="dashboard-title">
            <span className="title-icon">📊</span>
            <span>Personal Dashboard</span>
          </div>
        </div>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            aria-label="Search pages and food entries"
            aria-controls="topbar-search-results"
            aria-expanded={!!searchTerm}
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Escape') setSearchQuery(''); }}
          />
          {searchTerm && <div className="topbar-search-results" id="topbar-search-results" role="listbox" aria-label="Search results">
            {searchResults.length ? searchResults.map((result) => <button key={`${result.id}-${result.label}`} type="button" role="option" onClick={() => openSearchResult(result)}>{result.label}</button>)
              : <span className="empty-search-results">No matching pages or food entries.</span>}
          </div>}
        </div>

        <div className="topbar-right">
          <div className="notification-bell notification-control">
            <button type="button" className="notification-trigger" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => setShowNotifications((visible) => !visible)}>🔔</button>
            {showNotifications && <div className="notification-popover" role="status"><strong>Notifications</strong><p>You’re all caught up. New food and wellness updates will appear here.</p></div>}
          </div>

          <button type="button" className="user-profile" onClick={() => setActiveTab('profile')} aria-label="Open profile">
            <div className="user-info">
              <div className="user-handle">{displayName}</div>
              <div className="user-role">Wellness member</div>
            </div>
            <div className="user-avatar">
              <img src={displayPfp} alt={displayName} style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '50%' }} />
            </div>
          </button>

          <button className="log-food-btn" disabled={journal.loading || journal.busy} onClick={() => setIsModalOpen(true)}>
            + Log Food
          </button>
        </div>
      </header>

      {/* BODY CONTAINER */}
      <div className="app-body">
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

          <div className="sidebar-inspo-card">
            <strong>Small steps matter</strong>
            <p>Keep logging. Your healthy rhythm grows one day at a time.</p>
            <div className="footprints">👣 👣 👣 👣</div>
          </div>

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

          <button 
            className="logout-btn" 
            disabled={wellness.pending > 0 || journal.busy}
            onClick={logOut}
          >
            🚪 Log out
          </button>
        </aside>

        {/* FULL WIDTH MAIN CONTENT */}
        <main className="main-content">
          {accountError && <p className="journal-notice journal-error" role="alert">{accountError}</p>}
          {wellness.error && cloudEnabled && user && (
            <div className="journal-notice journal-error" role="alert">
              <p>{wellness.error}</p>
              <button onClick={wellness.reload} disabled={wellness.pending > 0}>Reload saved records</button>
            </div>
          )}
          {journal.loading && <p className="journal-notice" role="status">Loading saved food entries…</p>}
          {journal.error && cloudEnabled && user && (
            <div className="journal-notice journal-error" role="alert">
              <p>{journal.error}</p>
              <button type="button" disabled={journal.loading || journal.busy} onClick={journal.reload}>Retry</button>
            </div>
          )}
          <p className="journal-selected-date">Food journal: {dateLabel}</p>
          
          {activeTab === 'health-journal' && (
  <HealthJournalPage
    date={selectedDate} 
    onDateChange={setSelectedDate} 
    day={dayData} 
    days={wellness.days || {}}
    onChange={(patch, targetDate) => {
      if (targetDate && targetDate !== selectedDate) {
        setSelectedDate(targetDate);
      }
      wellness.updateDay?.(patch);
    }} 
    disabled={!wellness.ready || wellness.pending > 0}
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
              displayName={displayName} 
              sleepMinutes={sleepMinutes} 
              completedGoals={completedGoals}
              onGoalChange={(goal) => wellness.updateDay?.({ completedGoals: completedGoals.includes(goal) ? completedGoals.filter((item) => item !== goal) : [...completedGoals, goal] })}
              wellnessDisabled={!wellness.ready || wellness.pending > 0}
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
              controlsDisabled={!wellness.ready || wellness.pending > 0}
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
          
          {activeTab === 'profile' && (
            <ProfilePage 
              profile={{ ...profileData, fullName: displayName }}
              email={displayEmail} 
              onSave={handleSaveProfile} 
              busy={!wellness.ready || wellness.pending > 0}
            />
          )}
          
          {activeTab === 'accessibility' && (
            <AccessibilityPage 
              preferences={preferences} 
              onChange={wellness.updatePreference} 
              busy={!wellness.ready || wellness.pending > 0} 
            />
          )}

        </main>
      </div>

      {isModalOpen && <FoodEntryForm date={selectedDate} busy={journal.busy} onSave={saveFood} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
