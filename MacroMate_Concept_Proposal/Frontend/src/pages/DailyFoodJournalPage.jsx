import JournalDateSelector from '../components/JournalDateSelector';

export default function DailyFoodJournalPage({
  selectedDate,
  onDateChange,
  meals,
  totals,
  goals,
  loading,
  error,
  busy,
  onDelete,
  waterGlasses,
  onWaterGlassesChange,
  energyLevel,
  onEnergyLevelChange,
  formatNumber,
}) {
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
            <div className="widget-title">TODAY'S GOALS 🎯</div>
            <div className="goals-mini-grid">
              <div>{goals.calories} kcal</div><div>{goals.protein} g protein</div><div>{goals.fat} g fat</div><div>{goals.carbs} g carbs</div>
            </div>
          </div>

          <div className="card right-widget">
            <div className="widget-title">WATER INTAKE 💧</div>
            <div className="droplets-row">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                <span
                  key={glass}
                  className={`droplet ${glass <= waterGlasses ? 'filled' : ''}`}
                  onClick={() => onWaterGlassesChange(glass)}
                >
                  💧
                </span>
              ))}
            </div>
          </div>

          <div className="card right-widget">
            <div className="widget-title">ENERGY LEVEL ⚡</div>
            <div className="energy-boxes">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  className={`energy-num ${energyLevel === level ? 'active' : ''}`}
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
