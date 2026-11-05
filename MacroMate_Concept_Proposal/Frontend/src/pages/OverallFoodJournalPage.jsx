import { useState } from 'react';
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

function FullCalendarModal({ isOpen, onClose, selectedDate, onSelectDate }) {
  if (!isOpen) return null;

  const initialDate = new Date(`${selectedDate}T12:00:00`);
  const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [slideDir, setSlideDir] = useState('fade-zoom'); // 'slide-left' | 'slide-right' | 'fade-zoom'

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrev = () => {
    setSlideDir('slide-right');
    if (viewMode === 'days') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else if (viewMode === 'years') {
      setCurrentYear((prev) => prev - 12);
    }
  };

  const handleNext = () => {
    setSlideDir('slide-left');
    if (viewMode === 'days') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    } else if (viewMode === 'years') {
      setCurrentYear((prev) => prev + 12);
    }
  };

  const handleViewChange = (newMode) => {
    setSlideDir('fade-zoom');
    setViewMode(newMode);
  };

  // Days Grid Calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const paddingDays = firstDayOfMonth;

  const handleDayClick = (dayNum) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const newDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onSelectDate(newDateStr);
    onClose();
  };

  const handleMonthClick = (mIdx) => {
    setCurrentMonth(mIdx);
    handleViewChange('days');
  };

  const handleYearClick = (yr) => {
    setCurrentYear(yr);
    handleViewChange('months');
  };

  const startYearRange = Math.floor(currentYear / 12) * 12;
  const yearList = Array.from({ length: 12 }, (_, i) => startYearRange + i);

  return (
    <div className="overall-calendar-modal-overlay" onClick={onClose}>
      <div className="overall-calendar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="overall-calendar-modal-header">
          <div className="overall-calendar-header-titles">
            <button
              type="button"
              className="calendar-nav-title-btn"
              onClick={() => handleViewChange(viewMode === 'months' ? 'days' : 'months')}
            >
              {monthNames[currentMonth]}
            </button>
            <button
              type="button"
              className="calendar-nav-title-btn"
              onClick={() => handleViewChange(viewMode === 'years' ? 'days' : 'years')}
            >
              {viewMode === 'years' ? `${yearList[0]} - ${yearList[11]}` : currentYear}
            </button>
          </div>
          <div className="overall-calendar-header-actions">
            <button type="button" className="calendar-arrow-btn" onClick={handlePrev} aria-label="Previous month">‹</button>
            <button type="button" className="calendar-arrow-btn" onClick={handleNext} aria-label="Next month">›</button>
            <button type="button" className="calendar-close-btn" onClick={onClose} aria-label="Close calendar">×</button>
          </div>
        </div>

        <div className="overall-calendar-modal-body">
          {viewMode === 'days' && (
            <div key={`days-${currentYear}-${currentMonth}`} className={`calendar-animated-wrapper ${slideDir}`}>
              <div className="calendar-week-labels">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              <div className="calendar-days-grid">
                {Array.from({ length: paddingDays }).map((_, i) => (
                  <div key={`pad-${i}`} className="calendar-day-empty" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const formattedMonth = String(currentMonth + 1).padStart(2, '0');
                  const formattedDay = String(dayNum).padStart(2, '0');
                  const checkStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
                  const isSelected = checkStr === selectedDate;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      className={`calendar-day-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleDayClick(dayNum)}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'months' && (
            <div key="months-grid-view" className="calendar-animated-wrapper fade-zoom">
              <div className="calendar-months-grid">
                {monthNames.map((mName, index) => (
                  <button
                    key={mName}
                    type="button"
                    className={`calendar-selector-btn ${index === currentMonth ? 'selected' : ''}`}
                    onClick={() => handleMonthClick(index)}
                  >
                    {mName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'years' && (
            <div key={`years-grid-${startYearRange}`} className={`calendar-animated-wrapper ${slideDir}`}>
              <div className="calendar-years-grid">
                {yearList.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    className={`calendar-selector-btn ${yr === currentYear ? 'selected' : ''}`}
                    onClick={() => handleYearClick(yr)}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JournalWeek({ value, onChange }) {
  const week = Array.from({ length: 7 }, (_, index) => shiftDate(value, index - 3));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <>
      <div className="date-strip-card overall-week" role="group" aria-label="Journal date navigation">
        <div className="overall-week-controls">
          <button type="button" aria-label="Previous week" onClick={() => onChange(shiftDate(value, -7))}>
            <img src={previousIcon} alt="" width="26" height="26" />
          </button>
          
          <div className="overall-date-picker-group">
            <input type="date" aria-label="Jump to journal date" value={value} required onChange={(event) => {
              if (event.target.value) onChange(event.target.value);
            }} />
            <button
              type="button"
              className="overall-view-calendar-btn"
              onClick={() => setIsCalendarOpen(true)}
            >
              📅 View Full Calendar
            </button>
          </div>

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

      <FullCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={value}
        onSelectDate={onChange}
      />
    </>
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