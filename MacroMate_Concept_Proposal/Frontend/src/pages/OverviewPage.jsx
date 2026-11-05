import { useState } from 'react';

function createChecklistGoalId() {
  return globalThis.crypto?.randomUUID?.() || `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function OverviewPage({
  totals,
  goals,
  mood,
  energyLevel,
  waterGlasses,
  selectedDate,
  week,
  chartMax,
  chartPoints,
  loading,
  error,
  entries,
  formatNumber,
  onViewJournal, displayName, sleepMinutes, completedGoals, onGoalChange, wellnessDisabled = false,
  checklistGoals = [], checklistGoalStorageError = '', onChecklistGoalsChange,
}) {
  const [editingChecklistGoals, setEditingChecklistGoals] = useState(false);
  const [draftChecklistGoals, setDraftChecklistGoals] = useState(checklistGoals);
  const [newGoalType, setNewGoalType] = useState('checklist');
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(1);
  const [checklistEditorError, setChecklistEditorError] = useState('');
  const [savedFeedbackDate, setSavedFeedbackDate] = useState('');
  const [goalAnimationKey, setGoalAnimationKey] = useState(0);
  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const goalsHeading = selectedDate === todayDate
    ? 'Today’s goals'
    : `Goals for ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  const completedChecklistGoals = checklistGoals.filter((goal) => completedGoals.includes(goal.id));
  const remainingChecklistGoals = checklistGoals.filter((goal) => !completedGoals.includes(goal.id));

  function openChecklistEditor() {
    setDraftChecklistGoals(checklistGoals.map((goal) => ({ ...goal })));
    setChecklistEditorError('');
    setSavedFeedbackDate('');
    setEditingChecklistGoals(true);
  }

  function addChecklistGoal(event) {
    event.preventDefault();
    const label = newGoalLabel.trim();
    if (draftChecklistGoals.length >= 20 || !label || label.length > 80) {
      setChecklistEditorError('Enter a goal name (up to 80 characters). You can add up to 20 goals.');
      return;
    }
    const metric = newGoalType === 'checklist' ? null : newGoalType;
    setDraftChecklistGoals((current) => [...current, {
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
    if (draftChecklistGoals.some((goal) => !goal.label.trim() || goal.label.trim().length > 80
      || (goal.metric && (!Number.isInteger(goal.target) || goal.target < 1 || goal.target > 100000)))) {
      setChecklistEditorError('Each goal needs a name, and numeric targets must be whole numbers from 1 to 100000.');
      return;
    }
    const savedGoals = draftChecklistGoals.map((goal) => {
      const previous = checklistGoals.find((item) => item.id === goal.id);
      const changed = previous && (
        previous.label.trim() !== goal.label.trim()
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
    <div className="page-view overview-page">
      <span className="sub-heading">Track your daily progress</span>
      <h1 className="page-title">Welcome back, {displayName}</h1>

      <div className="overview-stats">
        <div className="card overview-stat-card">
          <span className="stat-label">Daily calories</span>
          <div className="stat-val">{formatNumber(totals.calories)} / {goals.calories} kcal</div>
          <span className="stat-sub green-txt">{formatNumber(Math.max(0, goals.calories - totals.calories))} kcal remaining</span>
          <span className="floating-badge" aria-hidden="true">🔥</span>
        </div>
        <div className="card overview-stat-card">
          <span className="stat-label">Mood Score</span>
          <div className="stat-val">{mood}</div>
          <span className="stat-sub">{energyLevel}/5 energy for the selected day</span>
          <span className="floating-badge">😊</span>
        </div>
        <div className="card overview-stat-card">
          <span className="stat-label">Water intake</span>
          <div className="stat-val">{waterGlasses} glasses</div>
          <span className="stat-sub">{(sleepMinutes / 60).toFixed(1)} hrs of sleep</span>
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
            <line x1="0" y1="25" x2="500" y2="25" stroke="#d5ebd7" strokeDasharray="4" />
            <line x1="0" y1="55" x2="500" y2="55" stroke="#d5ebd7" strokeDasharray="4" />
            <line x1="0" y1="85" x2="500" y2="85" stroke="#d5ebd7" strokeDasharray="4" />
            {!loading && !error && (
              <>
                <polyline points={chartPoints} fill="none" stroke="#0b9b56" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                {week.map((day, index) => {
                  const x = (index + 0.5) * (500 / 7);
                  const y = 110 - day.calories / chartMax * 90;
                  return (
                    <circle key={day.date} cx={x} cy={y} r={day.calories ? 4 : 2.5} fill={day.calories ? '#0b9b56' : '#9bbfa5'}>
                      <title>{`${day.date}: ${formatNumber(day.calories)} kcal`}</title>
                    </circle>
                  );
                })}
              </>
            )}
          </svg>
          <div className="chart-days">
            {week.map((day) => (
              <span key={day.date}>
                <span>{new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <span>{formatNumber(day.calories)} kcal</span>
              </span>
            ))}
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
              ✓ Goals saved for {selectedDate === todayDate ? 'today' : new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}!
            </p>
          )}
          {editingChecklistGoals ? (
            <form className="checklist-goals-form" onSubmit={saveChecklistGoals}>
              {draftChecklistGoals.map((goal) => (
                <div className="checklist-goal-edit-row" key={goal.id}>
                  <label>
                    <span>Goal name</span>
                    <input
                      type="text"
                      maxLength="80"
                      required
                      value={goal.label}
                      aria-label={`${goal.label} goal name`}
                      onChange={(event) => setDraftChecklistGoals((current) => current.map((item) => item.id === goal.id ? { ...item, label: event.target.value } : item))}
                    />
                  </label>
                  {goal.metric && (
                    <label className="checklist-target-field">
                      <span>{goal.metric === 'water' ? 'Glasses' : 'Minutes'}</span>
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        step="1"
                        required
                        value={goal.target}
                        aria-label={`${goal.label} target`}
                        onChange={(event) => setDraftChecklistGoals((current) => current.map((item) => item.id === goal.id ? { ...item, target: Number(event.target.value) } : item))}
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    className="checklist-goal-remove"
                    aria-label={`Remove ${goal.label}`}
                    onClick={() => setDraftChecklistGoals((current) => current.filter((item) => item.id !== goal.id))}
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
                <button type="button" className="goals-edit-btn" disabled={draftChecklistGoals.length >= 20} onClick={addChecklistGoal}>Add goal</button>
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
                <label key={`${goal.id}-${goalAnimationKey}`} className="goal-item">
                  <input type="checkbox" disabled={wellnessDisabled} onChange={() => onGoalChange(goal.id)} />
                  <span>{checklistGoalLabel(goal)}</span>
                </label>
              ))}
              {checklistGoals.length === 0 && <p className="stat-sub">No goals for this day yet. Customize to add one.</p>}
              {remainingChecklistGoals.length === 0 && checklistGoals.length > 0 && (
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
          <button type="button" className="entry-delete-btn" onClick={onViewJournal}>View journal</button>
        </div>
        {entries.length === 0 && (
          <p className="stat-sub">{loading ? 'Loading…' : error ? 'Journal unavailable' : 'No food logged for this date yet.'}</p>
        )}
        {entries.slice(-4).reverse().map((entry) => (
          <div key={entry.id} className="activity-row">
            <div className="act-left">
              <span className="act-icon">🍴</span>
              <div><strong>{entry.foodName}</strong><div className="stat-sub">{entry.meal}</div></div>
            </div>
            <div className="act-right">
              <span>{formatNumber(entry.calories)} kcal</span><span className="logged-tag">Logged</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
