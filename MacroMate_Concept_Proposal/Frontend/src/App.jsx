import React, { useEffect, useMemo, useState } from 'react';
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

const defaultGoals = { calories: 2200, protein: 150, carbs: 270, fat: 65 };
const defaultChecklistGoals = [
  { id: 'breakfast', label: 'Log breakfast', metric: null },
  { id: 'water', label: 'Drink water', metric: 'water', target: 8 },
  { id: 'activity', label: 'Activity', metric: 'activity', target: 30 },
  { id: 'reflection', label: 'Evening reflection', metric: null },
];

function validGoalValues(values) {
  return Object.fromEntries(Object.entries(defaultGoals).map(([key, fallback]) => {
    const value = Number(values?.[key]);
    return [key, Number.isInteger(value) && value > 0 && value <= 100000 ? value : fallback];
  }));
}

function validateChecklistGoals(goals) {
  if (!Array.isArray(goals) || goals.length > 20) {
    throw new Error('Saved checklist goals must be a list of at most 20 goals.');
  }
  const validatedGoals = goals.map((goal) => {
    if (!goal || typeof goal !== 'object' || !/^[A-Za-z0-9_-]{1,64}$/.test(goal.id)
      || typeof goal.label !== 'string' || !goal.label.trim() || goal.label.trim().length > 80
      || ![null, 'water', 'activity'].includes(goal.metric)) {
      throw new Error('A saved checklist goal has invalid details.');
    }
    if (goal.metric && (!Number.isInteger(goal.target) || goal.target < 1 || goal.target > 100000)) {
      throw new Error('A goal target must be a whole number from 1 to 100000.');
    }
    return {
      id: goal.id,
      label: goal.label.trim(),
      metric: goal.metric,
      ...(goal.metric ? { target: goal.target } : {}),
    };
  });
  if (new Set(validatedGoals.map((goal) => goal.id)).size !== validatedGoals.length) {
    throw new Error('Saved checklist goal IDs must be unique.');
  }
  return validatedGoals;
}

export default function App() {
  const auth = useAuth() || {};
  const user = auth.user || null;
  const goalsOwner = user?.id || 'local';
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
  const [goalWriteError, setGoalWriteError] = useState(null);
  const [goalOverride, setGoalOverride] = useState(null);
  const [checklistGoalOverride, setChecklistGoalOverride] = useState(null);
  const [checklistGoalWriteError, setChecklistGoalWriteError] = useState(null);
  const wellness = useWellness(selectedDate) || {};
  const dayData = wellness.day || {};
  const preferences = wellness.preferences || {};
  const profileData = wellness.profile || {};

  // Local overlay state to force instant topbar profile updates
  const [customProfile, setCustomProfile] = useState(null);
  const activeProfile = customProfile || profileData;

  const { mood, waterGlasses, energyLevel, sleepMinutes, completedGoals = [] } = dayData;

  const setWaterGlasses = (value) => wellness.ready && !wellness.pending && Number.isInteger(value) && value >= 0 && wellness.updateDay?.({ waterGlasses: value });
  const setEnergyLevel = (value) => wellness.ready && !wellness.pending && wellness.updateDay?.({ energyLevel: value });

  // 🌟 Universal Full Name and Profile Picture Sync Across Website
  useEffect(() => {
    if (cloudEnabled && user && ['welcome', 'login', 'signup'].includes(currentScreen)) {
      setCurrentScreen('dashboard');
    }
  }, [user, cloudEnabled, currentScreen]);

  const displayName = activeProfile.fullName || user?.user_metadata?.full_name || 'Christianne Denise Sabando';
  const displayEmail = user?.email || 'Local demo';
  const displayPfp = activeProfile.pfpUrl || new URL('./assets/MacroMate Assets/MacroMate Icon and Assets/MacroMate Logo.png', import.meta.url).href;

  useEffect(() => {
    document.body.classList.toggle('wellness-high-contrast', !!preferences.highContrast);
    document.body.classList.toggle('wellness-reduce-motion', !!preferences.reduceMotion);
    return () => {
      document.body.classList.remove('wellness-high-contrast', 'wellness-reduce-motion');
    };
  }, [preferences.highContrast, preferences.reduceMotion]);

  const journal = useFoodEntries() || { entries: [] };
  const entries = (journal.entries || []).filter((entry) => entry.entryDate === selectedDate);
  const totals = entries.reduce((sum, entry) => ({
    calories: sum.calories + entry.calories, protein: sum.protein + entry.protein,
    carbs: sum.carbs + entry.carbs, fat: sum.fat + entry.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const goalPreference = useMemo(() => {
    try {
      const dailyGoals = localStorage.getItem(`macromate.daily-goals-by-date.${goalsOwner}`);
      if (dailyGoals) {
        const parsed = JSON.parse(dailyGoals);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Saved daily goals have an invalid format.');
        }
        if (parsed[selectedDate]) return { values: validGoalValues(parsed[selectedDate]), error: '' };
      }

      if (selectedDate === localDate()) {
        const legacyGoals = localStorage.getItem(`macromate.daily-goals.${goalsOwner}`);
        if (legacyGoals) return { values: validGoalValues(JSON.parse(legacyGoals)), error: '' };
      }
      return { values: defaultGoals, error: '' };
    } catch (error) {
      console.error('Could not load saved daily goals for this date.', error);
      return { values: defaultGoals, error: 'Your goal targets for this date could not be loaded from this browser.' };
    }
  }, [goalsOwner, selectedDate]);
  const isCurrentGoalOverride = goalOverride?.owner === goalsOwner && goalOverride?.date === selectedDate;
  const goals = isCurrentGoalOverride ? goalOverride.values : goalPreference.values;
  const currentGoalWriteError = goalWriteError?.owner === goalsOwner && goalWriteError?.date === selectedDate
    ? goalWriteError.message
    : '';
  const goalStorageError = currentGoalWriteError || (isCurrentGoalOverride ? '' : goalPreference.error);
  const checklistGoalPreference = useMemo(() => {
    try {
      const savedByDate = localStorage.getItem(`macromate.checklist-goals-by-date.${goalsOwner}`);
      if (savedByDate) {
        const goalsByDate = JSON.parse(savedByDate);
        if (!goalsByDate || typeof goalsByDate !== 'object' || Array.isArray(goalsByDate)) {
          throw new Error('Saved daily checklist goals have an invalid format.');
        }
        if (goalsByDate[selectedDate] !== undefined) {
          return { values: validateChecklistGoals(goalsByDate[selectedDate]), error: '' };
        }
      }

      if (selectedDate === localDate()) {
        const savedGoals = localStorage.getItem(`macromate.checklist-goals.${goalsOwner}`);
        if (savedGoals) return { values: validateChecklistGoals(JSON.parse(savedGoals)), error: '' };
      }
      return { values: defaultChecklistGoals, error: '' };
    } catch (error) {
      console.error('Could not load checklist goals for this date.', error);
      return { values: defaultChecklistGoals, error: 'Checklist goals for this date could not be loaded from this browser.' };
    }
  }, [goalsOwner, selectedDate]);
  const isCurrentChecklistGoalOverride = checklistGoalOverride?.owner === goalsOwner && checklistGoalOverride?.date === selectedDate;
  const checklistGoals = isCurrentChecklistGoalOverride ? checklistGoalOverride.values : checklistGoalPreference.values;
  const currentChecklistGoalWriteError = checklistGoalWriteError?.owner === goalsOwner && checklistGoalWriteError?.date === selectedDate
    ? checklistGoalWriteError.message
    : '';
  const checklistGoalStorageError = currentChecklistGoalWriteError
    || (isCurrentChecklistGoalOverride ? '' : checklistGoalPreference.error);

  const updateGoals = (values) => {
    try {
      const storageKey = `macromate.daily-goals-by-date.${goalsOwner}`;
      const saved = localStorage.getItem(storageKey);
      const byDate = saved ? JSON.parse(saved) : {};
      if (!byDate || typeof byDate !== 'object' || Array.isArray(byDate)) {
        throw new Error('Saved daily goals have an invalid format.');
      }
      localStorage.setItem(storageKey, JSON.stringify({ ...byDate, [selectedDate]: values }));
      setGoalOverride({ owner: goalsOwner, date: selectedDate, values });
      setGoalWriteError(null);
    } catch (error) {
      console.error('Could not save daily goals for this date.', error);
      setGoalWriteError({
        owner: goalsOwner,
        date: selectedDate,
        message: 'Your goal targets for this date could not be saved in this browser.',
      });
    }
  };

  const updateChecklistGoals = (values) => {
    try {
      const validatedGoals = validateChecklistGoals(values);
      const storageKey = `macromate.checklist-goals-by-date.${goalsOwner}`;
      const saved = localStorage.getItem(storageKey);
      const byDate = saved ? JSON.parse(saved) : {};
      if (!byDate || typeof byDate !== 'object' || Array.isArray(byDate)) {
        throw new Error('Saved daily checklist goals have an invalid format.');
      }
      localStorage.setItem(storageKey, JSON.stringify({ ...byDate, [selectedDate]: validatedGoals }));
      setChecklistGoalOverride({ owner: goalsOwner, date: selectedDate, values: validatedGoals });
      setChecklistGoalWriteError(null);
      const retainedIds = new Set(validatedGoals.map((goal) => goal.id));
      const nextCompletedGoals = completedGoals.filter((goalId) => retainedIds.has(goalId));
      if (nextCompletedGoals.length !== completedGoals.length) {
        wellness.updateDay?.({ completedGoals: nextCompletedGoals }, selectedDate);
      }
      return true;
    } catch (error) {
      console.error('Could not save checklist goals.', error);
      setChecklistGoalWriteError({
        owner: goalsOwner,
        date: selectedDate,
        message: 'Your checklist goals could not be saved in this browser.',
      });
      return false;
    }
  };

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
  const chartMax = Math.max(100, Math.ceil(Math.max(...week.map((day) => day.calories)) / 100) * 100);
  const chartPoints = week.map((day, index) => `${(index + 0.5) * (500 / 7)},${110 - day.calories / chartMax * 90}`).join(' ');

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

  // Immediate Topbar Profile Synchronizer
  const handleSaveProfile = async (profileDataInput) => {
    setCustomProfile((prev) => ({ ...prev, ...profileDataInput }));
    if (wellness.saveProfile) {
      await wellness.saveProfile(profileDataInput);
    }
  };

  async function logOut() {
    setAccountError('');
    let savedGoals = null;
    try {
      savedGoals = localStorage.getItem(`macromate.daily-goals.${goalsOwner}`);
    } catch (error) {
      console.error('Could not preserve daily goals while logging out.', error);
    }
    try {
      if (cloudEnabled && supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Could not revoke the current session during sign out.', error);
    } finally {
      localStorage.clear();
      if (savedGoals) {
        try {
          localStorage.setItem(`macromate.daily-goals.${goalsOwner}`, savedGoals);
        } catch (error) {
          console.error('Could not preserve daily goals while logging out.', error);
        }
      }
      sessionStorage.clear();
      setCustomProfile(null);
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
      <style>{`
        /* Bidirectional Submenu Animations */
        @keyframes subMenuExpand {
          0% {
            opacity: 0;
            transform: translateY(-8px);
            max-height: 0px;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            max-height: 100px;
          }
        }

        @keyframes subMenuCollapse {
          0% {
            opacity: 1;
            transform: translateY(0);
            max-height: 100px;
          }
          100% {
            opacity: 0;
            transform: translateY(-8px);
            max-height: 0px;
          }
        }

        .submenu-container {
          overflow: hidden;
        }

        .submenu-container.open {
          animation: subMenuExpand 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .submenu-container.closed {
          animation: subMenuCollapse 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .chevron {
          display: inline-block;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .chevron.closed {
          transform: rotate(0deg);
        }
      `}</style>

      <div className="session-status" role="status" aria-live={preferences.announcements ? 'polite' : 'off'}>
        {cloudEnabled
          ? (wellness.error ? 'Saved records need attention' : wellness.pending ? 'Saving your changes…' : wellness.ready ? 'Supabase connected · No pending changes' : 'Loading your records…')
          : 'Local demo · Food and workouts save to H2. Daily macro goals save in this browser; other health and profile changes reset on refresh.'}
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
                  {item.hasSub && (
                    <span className={`chevron ${foodJournalMenuOpen ? 'open' : 'closed'}`}>
                      ▾
                    </span>
                  )}
                </button>

                {item.id === 'food-journal' && (
                  <div className={`submenu-container ${foodJournalMenuOpen ? 'open' : 'closed'}`}>
                    <div className="submenu">
                      <button
                        className={`submenu-item ${foodSubTab === 'daily' ? 'active' : ''}`}
                        onClick={() => {
                          setActiveTab('food-journal');
                          setFoodSubTab('daily');
                          setFoodJournalMenuOpen(true);
                        }}
                      >
                        📓 Daily Food Journal
                      </button>
                      <button
                        className={`submenu-item ${foodSubTab === 'overall' ? 'active' : ''}`}
                        onClick={() => {
                          setActiveTab('food-journal');
                          setFoodSubTab('overall');
                          setFoodJournalMenuOpen(true);
                        }}
                      >
                        📖 Overall Food Journal
                      </button>
                    </div>
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
          {activeTab !== 'health-journal' && activeTab !== 'overview' && <p className="journal-selected-date">Food journal: {dateLabel}</p>}
          
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
                wellness.updateDay?.(patch, targetDate || selectedDate);
              }} 
              disabled={!wellness.ready || wellness.pending > 0}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewPage
              key={selectedDate}
              totals={totals}
              goals={goals}
              mood={mood}
              energyLevel={energyLevel}
              waterGlasses={waterGlasses}
              selectedDate={selectedDate}
              week={week}
              chartMax={chartMax}
              chartPoints={chartPoints}
              loading={journal.loading}
              error={journal.error}
              entries={entries}
              formatNumber={number}
              displayName={displayName} 
              sleepMinutes={sleepMinutes} 
              completedGoals={completedGoals}
              checklistGoals={checklistGoals}
              checklistGoalStorageError={checklistGoalStorageError}
              onChecklistGoalsChange={updateChecklistGoals}
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
              key={selectedDate}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              meals={meals}
              totals={totals}
              goals={goals}
              onGoalsChange={updateGoals}
              goalStorageError={goalStorageError || goalPreference.error}
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
              profile={{ ...activeProfile, fullName: displayName }}
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
