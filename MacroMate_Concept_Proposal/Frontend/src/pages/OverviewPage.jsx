import { useState } from 'react';
import caloriesIconSrc from '../assets/MacroMate Assets/MacroMate Icon and Assets/Calories Icon.png';
import smileIconSrc from '../assets/MacroMate Assets/MacroMate Icon and Assets/Smile Icon.png';
import waterIconSrc from '../assets/MacroMate Assets/MacroMate Icon and Assets/Water Icon.png';

function createChecklistGoalId() {
  return globalThis.crypto?.randomUUID?.() || `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function OverviewPage({
  totals = { calories: 0, protein: 0, fat: 0, carbs: 0 },
  goals = { calories: 2200, protein: 150, fat: 65, carbs: 270 },
  mood = 'Good',
  energyLevel = 4,
  waterGlasses = 6,
  selectedDate = '',
  week = [],
  chartMax = 3000,
  chartPoints = '',
  loading = false,
  error = null,
  entries = [],
  formatNumber = (n) => n,
  onViewJournal = () => {},
  displayName = 'Aaron',
  sleepMinutes = 450,
  completedGoals = [],
  onGoalChange = () => {},
  wellnessDisabled = false,
  checklistGoals = [],
  checklistGoalStorageError = '',
  onChecklistGoalsChange = () => true,
}) {
  const [editingChecklistGoals, setEditingChecklistGoals] = useState(false);
  const [draftChecklistGoals, setDraftChecklistGoals] = useState(checklistGoals || []);
  const [newGoalType, setNewGoalType] = useState('checklist');
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(1);
  const [checklistEditorError, setChecklistEditorError] = useState('');
  const [savedFeedbackDate, setSavedFeedbackDate] = useState('');
  const [goalAnimationKey, setGoalAnimationKey] = useState(0);
  const [selectedChartDay, setSelectedChartDay] = useState(null);

  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const parsedSelectedDate = selectedDate ? new Date(`${selectedDate}T12:00:00`) : today;
  const weekdayName = parsedSelectedDate.toLocaleDateString(undefined, { weekday: 'long' });
  const formattedFullDate = parsedSelectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const goalsHeading = selectedDate === todayDate
    ? "Today's goals"
    : `Goals for ${parsedSelectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  const safeChecklistGoals = checklistGoals || [];
  const safeCompletedGoals = completedGoals || [];
  const completedChecklistGoals = safeChecklistGoals.filter((goal) => safeCompletedGoals.includes(goal?.id));
  const remainingChecklistGoals = safeChecklistGoals.filter((goal) => !safeCompletedGoals.includes(goal?.id));

  function openChecklistEditor() {
    setDraftChecklistGoals(safeChecklistGoals.map((goal) => ({ ...goal })));
    setChecklistEditorError('');
    setSavedFeedbackDate('');
    setEditingChecklistGoals(true);
  }

  function addChecklistGoal(event) {
    event.preventDefault();
    const label = (newGoalLabel || '').trim();
    if (draftChecklistGoals.length >= 20 || !label || label.length > 80) {
      setChecklistEditorError('Enter a goal name (up to 80 characters). You can add up to 20 goals.');
      return;
    }
    const metric = newGoalType === 'checklist' ? null : newGoalType;
    setDraftChecklistGoals((current) => [...(current || []), {
      id: createChecklistGoalId(),
      label,
      metric,
      ...(metric ? { target: Number(newGoalTarget) } : {}),
    }]);
    setNewGoalLabel('');
    setNewGoalTarget(1);
    setChecklistEditorError('');
  }

  function saveChecklistGoals(event) {
    event.preventDefault();
    if ((draftChecklistGoals || []).some((goal) => !goal?.label || !goal.label.trim() || goal.label.trim().length > 80
      || (goal.metric && (!Number.isInteger(goal.target) || goal.target < 1 || goal.target > 100000)))) {
      setChecklistEditorError('Each goal needs a name, and numeric targets must be whole numbers from 1 to 100000.');
      return;
    }
    const savedGoals = (draftChecklistGoals || []).map((goal) => {
      const previous = safeChecklistGoals.find((item) => item?.id === goal?.id);
      const changed = previous && (
        (previous.label || '').trim() !== (goal.label || '').trim()
        || previous.metric !== goal.metric
        || previous.target !== goal.target
      );
      return changed ? { ...goal, id: createChecklistGoalId() } : goal;
    });
    if (onChecklistGoalsChange(savedGoals)) {
      setEditingChecklistGoals(false);
      setChecklistEditorError('');
      setSavedFeedbackDate(selectedDate);
      setGoalAnimationKey((current) => current + 1);
    }
  }

  function checklistGoalLabel(goal) {
    if (!goal) return '';
    if (goal.metric === 'water') {
      return goal.label === 'Drink water'
        ? `Drink ${goal.target} glasses of water`
        : `${goal.label} (${goal.target} glasses)`;
    }
    if (goal.metric === 'activity') {
      return goal.label === 'Activity'
        ? `${goal.target} min activity`
        : `${goal.label} (${goal.target} min)`;
    }
    return goal.label;
  }

  return (
    <div className="page-view overview-page" style={{ position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box', containerType: 'inline-size' }}>
      <style>{`
        @keyframes overviewEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDate {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .overview-page {
          animation: overviewEnter 0.4s ease-out both;
          max-width: 1200px !important;
          margin: 0 auto !important;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chart-date-desc {
          animation: fadeInDate 0.35s ease-out both;
        }
        .chart-node-circle {
          cursor: pointer;
          transition: r 0.2s ease, fill 0.2s ease;
        }
        .chart-node-circle:hover {
          r: 7px;
          fill: #065f30 !important;
        }
        .day-details-modal {
          background: #ffffff;
          border: 1px solid #c2dec9;
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: fadeInDate 0.3s ease-out both;
          box-shadow: 0 4px 14px rgba(20, 33, 22, 0.05);
        }
        .overview-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        .overview-stat-card {
          position: relative;
          background: #eaf4eb !important;
          border-radius: 14px !important;
          padding: 16px !important;
          border: 1px solid #c2dec9 !important;
          box-shadow: 0 4px 14px rgba(20, 33, 22, 0.04);
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-height: 95px;
          overflow: visible;
        }
        .overview-stat-card .stat-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #557361;
        }
        .overview-stat-card .stat-val {
          font-size: clamp(1.4rem, 2vw, 1.8rem);
          font-weight: 900;
          color: #102a1c;
          line-height: 1.2;
        }
        .overview-stat-card .stat-sub {
          font-size: 0.8rem;
          font-weight: 700;
          color: #557361;
          margin-top: 2px;
        }
        .overview-stat-card .floating-badge-img {
          position: absolute;
          top: -18px;
          right: 14px;
          width: 52px;
          height: 52px;
          object-fit: contain;
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.12));
        }
        .overview-middle-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
          gap: 16px;
          align-items: stretch;
        }
        .overview-page .chart-card,
        .overview-page .goals-checklist-card,
        .overview-page .recent-activity-card {
          background: #eaf4eb !important;
          border-radius: 14px !important;
          padding: 18px !important;
          border: 1px solid #c2dec9 !important;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .overview-page .chart-header,
        .overview-page .goals-checklist-header,
        .overview-page .recent-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .overview-page .chart-header strong,
        .overview-page .card-heading,
        .overview-page .recent-header strong {
          font-size: 1.2rem;
          font-weight: 900;
          color: #102a1c;
        }
        .overview-page .pill-badge,
        .overview-page .goals-edit-btn,
        .overview-page .entry-delete-btn {
          background: #ffffff;
          border: 1px solid #c2dec9;
          border-radius: 10px;
          padding: 5px 12px;
          font-size: 0.78rem;
          font-weight: 800;
          color: #102a1c;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .overview-page .pill-badge {
          font-weight: 700;
          color: #557361;
        }
        .overview-page .goals-edit-btn:hover:not(:disabled),
        .overview-page .entry-delete-btn:hover {
          background: #108a43;
          color: #ffffff;
          border-color: #108a43;
        }
        .overview-page .chart-svg {
          width: 100%;
          height: 140px;
          overflow: visible;
          margin: 10px 0;
        }
        .overview-page .chart-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          gap: 4px;
        }
        .overview-page .chart-days span {
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
          font-weight: 700;
          color: #557361;
        }
        .overview-page .chart-days span span:first-child {
          font-weight: 800;
          color: #102a1c;
        }
        .overview-page .goal-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #d5e8da;
          border-radius: 10px;
          padding: 10px 12px;
          font-weight: 700;
          color: #102a1c;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .overview-page .goal-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #0b9b56;
          cursor: pointer;
        }
        .overview-page .activity-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          border: 1px solid #d5e8da;
          border-radius: 12px;
          padding: 12px 16px;
        }
        .overview-page .act-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .overview-page .act-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #eaf4eb;
          display: grid;
          place-items: center;
          font-size: 1.1rem;
        }
        .overview-page .act-left strong {
          font-size: 0.95rem;
          font-weight: 900;
          color: #102a1c;
        }
        .overview-page .act-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .overview-page .act-right span:first-child {
          font-weight: 800;
          color: #102a1c;
          font-size: 0.9rem;
        }
        .overview-page .logged-tag {
          background: #eaf4eb;
          border: 1px solid #c2dec9;
          color: #0b9b56;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 800;
        }
        .overview-page .checklist-goals-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .overview-page .checklist-goal-edit-row,
        .overview-page .checklist-goal-add-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          background: #ffffff;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #d5e8da;
        }
        .overview-page .checklist-goal-edit-row label,
        .overview-page .checklist-goal-add-row label {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #557361;
        }
        .overview-page .checklist-goal-edit-row input,
        .overview-page .checklist-goal-add-row input,
        .overview-page .checklist-goal-add-row select {
          padding: 6px 8px;
          border: 1px solid #c2dec9;
          border-radius: 8px;
          background: #f5faf5;
          font-weight: 700;
          color: #102a1c;
          font-size: 0.85rem;
        }
        .overview-page .checklist-target-field {
          flex: 0 0 70px !important;
        }
        .overview-page .checklist-goal-remove {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
        }
        .overview-page .checklist-goal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .overview-page .goals-saved-feedback,
        .overview-page .daily-goals-error {
          font-size: 0.8rem;
          font-weight: 800;
          margin: 0;
        }
        .overview-page .goals-saved-feedback { color: #0b9b56; }
        .overview-page .daily-goals-error { color: #dc2626; }

        /* ----------------------------------------------------
           HIGH CONTRAST & DARK MODE OVERRIDES
        ---------------------------------------------------- */
        .wellness-high-contrast .overview-page { color: #f8fafc !important; }
        .wellness-high-contrast .overview-stat-card,
        .wellness-high-contrast .chart-card,
        .wellness-high-contrast .goals-checklist-card,
        .wellness-high-contrast .recent-activity-card {
          background-color: #0f172a !important;
          border: 1px solid #94a3b8 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .overview-stat-card .stat-label,
        .wellness-high-contrast .overview-stat-card .stat-sub { color: #94a3b8 !important; }
        .wellness-high-contrast .overview-stat-card .stat-val { color: #f8fafc !important; }
        .wellness-high-contrast .chart-header strong,
        .wellness-high-contrast .card-heading,
        .wellness-high-contrast .recent-header strong { color: #f8fafc !important; }
        .wellness-high-contrast .pill-badge,
        .wellness-high-contrast .goals-edit-btn,
        .wellness-high-contrast .entry-delete-btn {
          background-color: #1e293b !important;
          border-color: #94a3b8 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .goal-item,
        .wellness-high-contrast .activity-row,
        .wellness-high-contrast .checklist-goal-edit-row,
        .wellness-high-contrast .checklist-goal-add-row {
          background-color: #1e293b !important;
          border-color: #475569 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .goal-item input[type="checkbox"] { accent-color: #38bdf8; }
        .wellness-high-contrast .act-icon { background-color: #334155 !important; }
        .wellness-high-contrast .act-left strong,
        .wellness-high-contrast .act-right span:first-child { color: #f8fafc !important; }
        .wellness-high-contrast .logged-tag {
          background-color: #1e293b !important;
          border-color: #38bdf8 !important;
          color: #38bdf8 !important;
        }
        .wellness-high-contrast .checklist-goal-edit-row input,
        .wellness-high-contrast .checklist-goal-add-row input,
        .wellness-high-contrast .checklist-goal-add-row select {
          background-color: #0f172a !important;
          border-color: #475569 !important;
          color: #f8fafc !important;
        }

        /* ----------------------------------------------------
           RESPONSIVE BREAKPOINTS (ZOOM & MOBILE)
        ---------------------------------------------------- */
        @media (max-width: 1100px), (max-device-width: 1100px) {
          .overview-stats,
          .overview-middle-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>

      <span className="sub-heading">Track your daily progress ({weekdayName}, {formattedFullDate})</span>
      <h1 className="page-title">Welcome Back, {displayName}</h1>

      <div className="overview-stats">
        <div className="card overview-stat-card">
          <span className="stat-label">Daily calories</span>
          <div className="stat-val">{formatNumber(totals.calories)} / {goals.calories} kcal</div>
          <span className="stat-sub">{formatNumber(Math.max(0, goals.calories - totals.calories))} kcal remaining</span>
          <img src={caloriesIconSrc} alt="Calories Icon" className="floating-badge-img" aria-hidden="true" />
        </div>
        <div className="card overview-stat-card">
          <span className="stat-label">Mood Score</span>
          <div className="stat-val">{mood}</div>
          <span className="stat-sub">{energyLevel}/5 energy today</span>
          <img src={smileIconSrc} alt="Mood Icon" className="floating-badge-img" aria-hidden="true" />
        </div>
        <div className="card overview-stat-card">
          <span className="stat-label">Water intake</span>
          <div className="stat-val">{waterGlasses} glasses</div>
          <span className="stat-sub">{(sleepMinutes / 60).toFixed(1)} hrs of Sleep</span>
          <img src={waterIconSrc} alt="Water Icon" className="floating-badge-img" aria-hidden="true" />
        </div>
      </div>

      <div className="overview-middle-grid">
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <strong>Weekly Progress</strong>
              <div className="stat-sub chart-date-desc" key={selectedDate}>
                Calories logged for the week ending {formattedFullDate} ({weekdayName})
              </div>
            </div>
            <span className="pill-badge">This Week</span>
          </div>

          {selectedChartDay && (
            <div className="day-details-modal">
              <div>
                <strong>{selectedChartDay.date ? new Date(`${selectedChartDay.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : 'Selected Day'}</strong>
                <div className="stat-sub" style={{ marginTop: '4px' }}>
                  🔥 {formatNumber(selectedChartDay.calories || 0)} kcal | 🥩 Protein: {formatNumber(selectedChartDay.protein || 0)}g | 🍞 Carbs: {formatNumber(selectedChartDay.carbs || 0)}g | 🥑 Fat: {formatNumber(selectedChartDay.fat || 0)}g
                </div>
              </div>
              <button type="button" className="entry-delete-btn" onClick={() => setSelectedChartDay(null)}>×</button>
            </div>
          )}

          <svg className="chart-svg" viewBox="0 0 500 120" preserveAspectRatio="none">
            <line x1="0" y1="25" x2="500" y2="25" stroke="#d5ebd7" strokeDasharray="4" />
            <line x1="0" y1="55" x2="500" y2="55" stroke="#d5ebd7" strokeDasharray="4" />
            <line x1="0" y1="85" x2="500" y2="85" stroke="#d5ebd7" strokeDasharray="4" />
            {!loading && !error && (
              <>
                <polyline points={chartPoints} fill="none" stroke="#0b9b56" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                {(week || []).map((day, index) => {
                  const x = (index + 0.5) * (500 / 7);
                  const y = 110 - ((day?.calories || 0) / chartMax) * 90;
                  return (
                    <circle
                      key={day?.date || index}
                      cx={x}
                      cy={y}
                      r={day?.calories ? 5 : 3}
                      fill={day?.calories ? '#0b9b56' : '#9bbfa5'}
                      className="chart-node-circle"
                      onClick={() => setSelectedChartDay(day)}
                    >
                      <title>{`${day?.date || ''}: ${formatNumber(day?.calories || 0)} kcal (Click for details)`}</title>
                    </circle>
                  );
                })}
              </>
            )}
          </svg>
          <div className="chart-days">
            {(week || []).map((day, index) => {
              const dayName = day?.date 
                ? new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long' }) 
                : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index];
              return (
                <span key={day?.date || index} onClick={() => setSelectedChartDay(day)} style={{ cursor: 'pointer' }}>
                  <span>{dayName}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="card goals-checklist-card">
          <div className="goals-checklist-header">
            <strong className="card-heading">{goalsHeading}</strong>
            <button type="button" className="goals-edit-btn" disabled={wellnessDisabled} onClick={editingChecklistGoals ? () => setEditingChecklistGoals(false) : openChecklistEditor}>
              {editingChecklistGoals ? 'Close' : 'Customize'}
            </button>
          </div>
          {savedFeedbackDate === selectedDate && (
            <p className="goals-saved-feedback" role="status">
              ✓ Goals saved for {selectedDate === todayDate ? 'today' : formattedFullDate}!
            </p>
          )}
          {editingChecklistGoals ? (
            <form className="checklist-goals-form" onSubmit={saveChecklistGoals}>
              {(draftChecklistGoals || []).map((goal) => (
                <div className="checklist-goal-edit-row" key={goal?.id}>
                  <label>
                    <span>Goal name</span>
                    <input
                      type="text"
                      maxLength="80"
                      required
                      value={goal?.label || ''}
                      aria-label={`${goal?.label || 'Goal'} goal name`}
                      onChange={(event) => setDraftChecklistGoals((current) => (current || []).map((item) => item?.id === goal?.id ? { ...item, label: event.target.value } : item))}
                    />
                  </label>
                  {goal?.metric && (
                    <label className="checklist-target-field">
                      <span>{goal.metric === 'water' ? 'Glasses' : 'Minutes'}</span>
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        step="1"
                        required
                        value={goal?.target || 1}
                        aria-label={`${goal?.label || 'Goal'} target`}
                        onChange={(event) => setDraftChecklistGoals((current) => (current || []).map((item) => item?.id === goal?.id ? { ...item, target: Number(event.target.value) } : item))}
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    className="checklist-goal-remove"
                    aria-label={`Remove ${goal?.label || 'goal'}`}
                    onClick={() => setDraftChecklistGoals((current) => (current || []).filter((item) => item?.id !== goal?.id))}
                  >Remove</button>
                </div>
              ))}
              <div className="checklist-goal-add-row">
                <label>
                  <span>New goal type</span>
                  <select value={newGoalType} onChange={(event) => setNewGoalType(event.target.value)}>
                    <option value="checklist">Checklist</option>
                    <option value="water">Water target</option>
                    <option value="activity">Activity target</option>
                  </select>
                </label>
                <label>
                  <span>Goal name</span>
                  <input
                    type="text"
                    maxLength="80"
                    value={newGoalLabel}
                    aria-label="New goal name"
                    placeholder="Enter a goal"
                    onChange={(event) => setNewGoalLabel(event.target.value)}
                  />
                </label>
                {newGoalType !== 'checklist' && (
                  <label className="checklist-target-field">
                    <span>{newGoalType === 'water' ? 'Glasses' : 'Minutes'}</span>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      step="1"
                      value={newGoalTarget}
                      aria-label="New goal target"
                      onChange={(event) => setNewGoalTarget(event.target.value)}
                    />
                  </label>
                )}
                <button type="button" className="goals-edit-btn" disabled={(draftChecklistGoals || []).length >= 20} onClick={addChecklistGoal}>Add goal</button>
              </div>
              <div className="checklist-goal-actions">
                <button type="button" className="goals-edit-btn" onClick={() => setEditingChecklistGoals(false)}>Cancel</button>
                <button type="submit" className="goals-edit-btn">Save goals</button>
              </div>
              {checklistEditorError && <p className="daily-goals-error" role="alert">{checklistEditorError}</p>}
              {checklistGoalStorageError && <p className="daily-goals-error" role="alert">{checklistGoalStorageError}</p>}
            </form>
          ) : (
            <>
              {remainingChecklistGoals.map((goal) => (
                <label key={`${goal?.id}-${goalAnimationKey}`} className="goal-item">
                  <input type="checkbox" disabled={wellnessDisabled} onChange={() => onGoalChange(goal?.id)} />
                  <span>{checklistGoalLabel(goal)}</span>
                </label>
              ))}
              {(!checklistGoals || checklistGoals.length === 0) && <p className="stat-sub">No goals for this day yet. Customize to add one.</p>}
              {remainingChecklistGoals.length === 0 && (checklistGoals || []).length > 0 && (
                <p className="stat-sub" role="status">All goals completed for this day. Nice work!</p>
              )}
              {completedChecklistGoals.length > 0 && remainingChecklistGoals.length > 0 && (
                <p className="stat-sub" role="status">
                  {completedChecklistGoals.length} goal{completedChecklistGoals.length === 1 ? '' : 's'} completed today. Customize to view all saved goals.
                </p>
              )}
              {checklistGoalStorageError && <p className="daily-goals-error" role="alert">{checklistGoalStorageError}</p>}
            </>
          )}
        </div>
      </div>

      <div className="card recent-activity-card">
        <div className="recent-header">
          <strong>Recent activity</strong>
          <button type="button" className="entry-delete-btn" onClick={onViewJournal}>View All</button>
        </div>
        {(!entries || entries.length === 0) && (
          <p className="stat-sub">{loading ? 'Loading…' : error ? 'Journal unavailable' : 'No food logged for this date yet.'}</p>
        )}
        {(entries || []).slice(-4).reverse().map((entry, index) => (
          <div key={entry?.id || index} className="activity-row">
            <div className="act-left">
              <span className="act-icon">🍴</span>
              <div><strong>{entry?.foodName || 'Food Item'}</strong><div className="stat-sub">{entry?.meal || 'Meal'}</div></div>
            </div>
            <div className="act-right">
              <span>{entry?.time || '07:35'}</span><span className="logged-tag">Logged</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}