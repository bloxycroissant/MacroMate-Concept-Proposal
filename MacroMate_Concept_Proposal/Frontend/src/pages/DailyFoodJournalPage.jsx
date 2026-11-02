import { useState } from 'react';
import JournalDateSelector from '../components/JournalDateSelector';

export default function DailyFoodJournalPage({
  selectedDate,
  onDateChange,
  meals,
  totals,
  goals,
  onGoalsChange,
  goalStorageError = '',
  loading,
  error,
  busy,
  onDelete,
  waterGlasses,
  onWaterGlassesChange,
  energyLevel,
  onEnergyLevelChange,
  formatNumber,
  controlsDisabled = false,
}) {
  const [editingGoals, setEditingGoals] = useState(false);
  const [goalValues, setGoalValues] = useState(goals);

  function saveGoals(event) {
    event.preventDefault();
    const values = Object.fromEntries(Object.entries(goalValues).map(([key, value]) => [key, Number(value)]));
    if (Object.values(values).some((value) => !Number.isInteger(value) || value < 1 || value > 100000)) {
      return;
    }
    onGoalsChange(values);
    setEditingGoals(false);
  }

  function cancelGoalEdit() {
    setGoalValues(goals);
    setEditingGoals(false);
  }

  return (
    <div className="page-view">
      <span className="sub-heading">Track your daily journal</span>
      <h1 className="page-title">Daily Food Journal</h1>

      <JournalDateSelector value={selectedDate} onChange={onDateChange} />

      <div className="daily-journal-grid">
        <div className="meal-tables-column">
          {meals.map((meal) => (
            <div key={meal.meal} className="meal-block">
              <div className="meal-sidebar-tab">
                <span className="tab-icon">{meal.icon}</span>
                <span className="tab-text">{meal.meal}</span>
              </div>
              <div className="meal-table-wrap">
                <table className="daily-table">
                  <thead>
                    <tr>
                      <th>Food</th><th>CALORIES</th><th>PROTEIN</th><th>FAT</th><th>CARBS</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.items.length > 0 ? (
                      meal.items.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.foodName}</td>
                          <td>{formatNumber(entry.calories)} kcal</td>
                          <td>{formatNumber(entry.protein)} g</td>
                          <td>{formatNumber(entry.fat)} g</td>
                          <td>{formatNumber(entry.carbs)} g</td>
                          <td>
                            <button
                              type="button"
                              className="entry-delete-btn"
                              disabled={busy}
                              onClick={() => onDelete(entry.id)}
                              aria-label={`Delete ${entry.foodName}`}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="empty-td">
                          {loading ? 'Loading…' : error ? 'Journal unavailable' : 'No entries for this meal'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="daily-total-bar">
            <div className="total-label">📋 Daily Total</div>
            <div className="total-cell">CALORIES<br />{formatNumber(totals.calories)} kcal</div>
            <div className="total-cell">PROTEIN<br />{formatNumber(totals.protein)} g</div>
            <div className="total-cell">FAT<br />{formatNumber(totals.fat)} g</div>
            <div className="total-cell">CARBS<br />{formatNumber(totals.carbs)} g</div>
          </div>
        </div>

        <div className="widgets-column">
          <div className="card right-widget">
            <div className="widget-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span>TODAY'S GOALS 🎯</span>
              <button type="button" className="goals-edit-btn" disabled={controlsDisabled} onClick={() => {
                setGoalValues(goals);
                setEditingGoals((editing) => !editing);
              }}>{editingGoals ? 'Close' : 'Customize'}</button>
            </div>
            {editingGoals ? (
              <form className="daily-goals-form" onSubmit={saveGoals}>
                {[
                  ['calories', 'Calories', 'kcal'],
                  ['protein', 'Protein', 'g'],
                  ['fat', 'Fat', 'g'],
                  ['carbs', 'Carbs', 'g'],
                ].map(([key, label, unit]) => (
                  <label key={key}>
                    <span>{label} ({unit})</span>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      step="1"
                      required
                      value={goalValues[key]}
                      aria-label={`${label} goal`}
                      onChange={(event) => setGoalValues((current) => ({ ...current, [key]: event.target.value }))}
                    />
                  </label>
                ))}
                <div className="daily-goals-actions">
                  <button type="button" disabled={controlsDisabled} onClick={cancelGoalEdit}>Cancel</button>
                  <button type="submit" disabled={controlsDisabled}>Save goals</button>
                </div>
              </form>
            ) : (
              <div className="goals-mini-grid">
                <div>{goals.calories} kcal</div><div>{goals.protein} g protein</div><div>{goals.fat} g fat</div><div>{goals.carbs} g carbs</div>
              </div>
            )}
            {goalStorageError && <p className="daily-goals-error" role="alert">{goalStorageError}</p>}
          </div>

          <div className="card right-widget">
            <div className="widget-title">WATER INTAKE 💧</div>
            <div className="water-counter" style={{ width: 'auto', padding: 0, border: 0, background: 'transparent', justifyContent: 'center', gap: '10px' }}>
              <button
                type="button"
                aria-label="Remove one glass of water"
                disabled={controlsDisabled || waterGlasses <= 0}
                onClick={() => onWaterGlassesChange(Math.max(0, waterGlasses - 1))}
              >-</button>
              <span aria-live="polite">{waterGlasses} {waterGlasses === 1 ? 'glass' : 'glasses'}</span>
              <button
                type="button"
                aria-label="Add one glass of water"
                disabled={controlsDisabled}
                onClick={() => onWaterGlassesChange(waterGlasses + 1)}
              >+</button>
            </div>
          </div>

          <div className="card right-widget">
            <div className="widget-title">ENERGY LEVEL ⚡</div>
            <div className="energy-boxes">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`energy-num ${energyLevel === level ? 'active' : ''}`}
                  aria-label={`Set energy level to ${level}`}
                  aria-pressed={energyLevel === level}
                  disabled={controlsDisabled}
                  onClick={() => onEnergyLevelChange(level)}
                >
                  {level}
                </button>
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
  );
}
