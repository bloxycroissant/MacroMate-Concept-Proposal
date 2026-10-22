import JournalDateSelector from '../components/JournalDateSelector';

export default function OverallFoodJournalPage({
  selectedDate,
  onDateChange,
  meals,
  totals,
  goals,
  loading,
  error,
  busy,
  onDelete,
  onAddFood,
  formatNumber,
  progress,
}) {
  return (
    <div className="page-view">
      <div className="overall-header">
        <div>
          <h1 className="page-title">Food Journal</h1>
          <div className="stat-sub">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}</div>
        </div>
        <button className="primary-green-btn" disabled={loading || !!error || busy} onClick={onAddFood}>+ Add Food</button>
      </div>

      <JournalDateSelector value={selectedDate} onChange={onDateChange} />

      <div className="overall-macros-grid">
        <div className="card macro-stat-box">
          <span className="stat-label">Calories</span>
          <div className="progress-bar green"><span style={{ width: loading || error ? '0%' : progress('calories') }}></span></div>
          <span className="stat-sub align-right">{formatNumber(totals.calories)} / {goals.calories} kcal</span>
        </div>
        <div className="card macro-stat-box">
          <span className="stat-label">Protein</span>
          <div className="progress-bar blue"><span style={{ width: loading || error ? '0%' : progress('protein') }}></span></div>
          <span className="stat-sub align-right">{formatNumber(totals.protein)} / {goals.protein} g</span>
        </div>
        <div className="card macro-stat-box">
          <span className="stat-label">Carbs</span>
          <div className="progress-bar orange"><span style={{ width: loading || error ? '0%' : progress('carbs') }}></span></div>
          <span className="stat-sub align-right">{formatNumber(totals.carbs)} / {goals.carbs} g</span>
        </div>
        <div className="card macro-stat-box">
          <span className="stat-label">Fat</span>
          <div className="progress-bar pink"><span style={{ width: loading || error ? '0%' : progress('fat') }}></span></div>
          <span className="stat-sub align-right">{formatNumber(totals.fat)} / {goals.fat} g</span>
        </div>
      </div>

      <div className="overall-columns-grid">
        {meals.map((meal) => (
          <div key={meal.meal} className="card column-card">
            <div className="column-header-banner"><span>{meal.meal}</span><span>{meal.icon}</span></div>
            <div className="column-body">
              {meal.items.length === 0 && <p className="stat-sub">{loading ? 'Loading…' : error ? 'Journal unavailable' : 'No entries for this meal'}</p>}
              {meal.items.map((entry) => (
                <div key={entry.id} className="column-item-row">
                  <span>{entry.foodName}</span>
                  <b>{formatNumber(entry.calories)} kcal</b>
                  <button className="entry-delete-btn" disabled={busy} onClick={() => onDelete(entry.id)} aria-label={`Delete ${entry.foodName}`}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
