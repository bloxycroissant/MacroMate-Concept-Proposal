export default function OverviewPage({
  totals,
  goals,
  mood,
  energyLevel,
  waterGlasses,
  selectedDate,
  week,
  chartPoints,
  loading,
  error,
  entries,
  formatNumber,
  onViewJournal, displayName, sleepMinutes, completedGoals, onGoalChange,
}) {
  return (
    <div className="page-view">
      <span className="sub-heading">Track your daily progress</span>
      <h1 className="page-title">Welcome back, {displayName}</h1>

      <div className="overview-stats">
        <div className="card overview-stat-card">
          <span className="stat-label">Selected day calories</span>
          <div className="stat-val">{formatNumber(totals.calories)} / {goals.calories} kcal</div>
          <span className="stat-sub green-txt">{formatNumber(Math.max(0, goals.calories - totals.calories))} kcal remaining</span>
          <span className="floating-badge">🔥 kcal</span>
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
            <line x1="0" y1="30" x2="500" y2="30" stroke="#d5ebd7" strokeDasharray="4" />
            <line x1="0" y1="60" x2="500" y2="60" stroke="#d5ebd7" strokeDasharray="4" />
            <line x1="0" y1="90" x2="500" y2="90" stroke="#d5ebd7" strokeDasharray="4" />
            <polyline points={loading || error ? '' : chartPoints} fill="none" stroke="#0b9b56" strokeWidth="3" />
          </svg>
          <div className="chart-days">
            {week.map((day) => (
              <span key={day.date} title={`${day.date}: ${formatNumber(day.calories)} kcal`}>
                {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}<br />
                {formatNumber(day.calories)} kcal
              </span>
            ))}
          </div>
        </div>

        <div className="card goals-checklist-card">
          <strong className="card-heading">Goals for the selected day</strong>
          {[
            ['breakfast', 'Log breakfast'], ['water', 'Drink 8 glasses of water'],
            ['activity', '30 min activity'], ['reflection', 'Evening reflection'],
          ].map(([id, label]) => <label key={id} className={`goal-item ${completedGoals.includes(id) ? 'done' : ''}`}>
            <input type="checkbox" checked={completedGoals.includes(id)} onChange={() => onGoalChange(id)} />
            <span>{label}</span>
          </label>)}
        </div>
      </div>

      <div className="card recent-activity-card">
        <div className="recent-header">
          <strong>Recent activity</strong>
          <button className="entry-delete-btn" onClick={onViewJournal}>View journal</button>
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
