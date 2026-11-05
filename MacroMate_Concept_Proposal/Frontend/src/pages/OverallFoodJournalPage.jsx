import breakfastIcon from '../assets/overall-food-journal/breakfast.svg';
import lunchIcon from '../assets/overall-food-journal/lunch.svg';
import dinnerIcon from '../assets/overall-food-journal/dinner.svg';
import snacksIcon from '../assets/overall-food-journal/snacks.svg';
import addFoodIcon from '../assets/overall-food-journal/add-food.svg';
import previousIcon from '../assets/overall-food-journal/previous.svg';
import nextIcon from '../assets/overall-food-journal/next.svg';
import { shiftDate } from '../utils/journalDates';
import './OverallFoodJournalPage.css';

const mealIcons = {
  Breakfast: breakfastIcon,
  Lunch: lunchIcon,
  Dinner: dinnerIcon,
  Snacks: snacksIcon,
};

const macros = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: 'green' },
  { key: 'protein', label: 'Protein', unit: 'g', color: 'blue' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: 'orange' },
  { key: 'fat', label: 'Fat', unit: 'g', color: 'pink' },
];

const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

function JournalWeek({ value, onChange }) {
  const week = Array.from({ length: 7 }, (_, index) => shiftDate(value, index - 3));

  return (
    <div className="date-strip-card overall-week" role="group" aria-label="Journal date navigation">
      <div className="overall-week-controls">
        <button type="button" aria-label="Previous week" onClick={() => onChange(shiftDate(value, -7))}>
          <img src={previousIcon} alt="" width="26" height="26" />
        </button>
        <input type="date" aria-label="Jump to journal date" value={value} required onChange={(event) => {
          if (event.target.value) onChange(event.target.value);
        }} />
        <button type="button" aria-label="Next week" onClick={() => onChange(shiftDate(value, 7))}>
          <img src={nextIcon} alt="" width="26" height="26" />
        </button>
      </div>

      <div className="overall-week-days">
        {week.map((day) => {
          const date = new Date(`${day}T12:00:00`);
          return (
            <button
              key={day}
              type="button"
              aria-label={date.toLocaleDateString(undefined, dateOptions)}
              aria-pressed={day === value}
              onClick={() => onChange(day)}
            >
              <span>{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <strong>{date.toLocaleDateString(undefined, { day: '2-digit' })}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
  const unavailable = loading || Boolean(error);
  const dateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, dateOptions);

  return (
    <div className="page-view overall-journal">
      <header className="overall-header">
        <div>
          <h1 className="page-title">Food Journal</h1>
          <time dateTime={selectedDate} aria-live="polite">{dateLabel}</time>
        </div>
        <button type="button" className="primary-green-btn overall-add-food" disabled={unavailable || busy} onClick={onAddFood}>
          <img src={addFoodIcon} alt="" width="49" height="49" />
          Add Food
        </button>
      </header>

      <JournalWeek value={selectedDate} onChange={onDateChange} />

      <div className="overall-macros-grid" aria-label="Nutrition totals" role="group">
        {macros.map(({ key, label, unit, color }) => {
          const summary = `${formatNumber(totals[key])} / ${goals[key]} ${unit}`;

          return (
            <div key={key} className="card macro-stat-box">
              <h2>{label}</h2>
              <p>{summary}</p>
              <div
                className={`progress-bar ${color}`}
                role={unavailable ? undefined : 'progressbar'}
                aria-label={unavailable ? undefined : label}
                aria-valuenow={unavailable ? undefined : Math.min(totals[key], goals[key])}
                aria-valuemax={unavailable ? undefined : goals[key]}
                aria-valuetext={unavailable ? undefined : summary}
              >
                <span style={{ width: unavailable ? '0%' : progress(key) }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="overall-columns-grid" aria-busy={loading}>
        {meals.map(({ meal, items }) => {
          const iconSize = meal === 'Lunch' ? 68 : 64;
          return (
            <section key={meal} className="card column-card" aria-label={meal}>
              <h2 className="column-header-banner">
                {meal}
                <span className="overall-meal-icon"><img src={mealIcons[meal]} width={iconSize} height={iconSize} alt="" /></span>
              </h2>
              <div className="column-body">
                {items.length === 0 ? (
                  <p className="overall-empty-meal">{loading ? 'Loading…' : error ? 'Journal unavailable' : 'No entries for this meal'}</p>
                ) : (
                  <ul>
                    {items.map((entry) => (
                      <li key={entry.id} className="column-item-row">
                        <span>{entry.foodName}</span>
                        <span className="overall-entry-calories">{formatNumber(entry.calories)} kcal</span>
                        <button
                          type="button"
                          className="entry-delete-btn"
                          disabled={unavailable || busy}
                          onClick={() => onDelete(entry.id)}
                          aria-label={`Delete ${entry.foodName}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}