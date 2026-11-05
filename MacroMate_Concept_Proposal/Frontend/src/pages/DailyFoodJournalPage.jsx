import { useState } from 'react';

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
    <div className="daily-calendar-modal-overlay" onClick={onClose}>
      <div className="daily-calendar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="daily-calendar-modal-header">
          <div className="daily-calendar-header-titles">
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
          <div className="daily-calendar-header-actions">
            <button type="button" className="calendar-arrow-btn" onClick={handlePrev} aria-label="Previous month">‹</button>
            <button type="button" className="calendar-arrow-btn" onClick={handleNext} aria-label="Next month">›</button>
            <button type="button" className="calendar-close-btn" onClick={onClose} aria-label="Close calendar">×</button>
          </div>
        </div>

        <div className="daily-calendar-modal-body">
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

function JournalDateSelector({ value, onChange }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const shiftDate = (dateStr, days) => {
    const d = new Date(`${dateStr}T12:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const week = Array.from({ length: 7 }, (_, index) => shiftDate(value, index - 3));

  return (
    <>
      <div className="journal-date-strip">
        <div className="date-strip-controls">
          <button type="button" className="date-arrow-btn" aria-label="Previous week" onClick={() => onChange(shiftDate(value, -7))}>
            ‹
          </button>
          
          <div className="date-picker-input-group">
            <input
              type="date"
              aria-label="Jump to date"
              value={value}
              required
              onChange={(e) => e.target.value && onChange(e.target.value)}
            />
            <button
              type="button"
              className="daily-view-calendar-btn"
              onClick={() => setIsCalendarOpen(true)}
            >
              📅 View Full Calendar
            </button>
          </div>

          <button type="button" className="date-arrow-btn" aria-label="Next week" onClick={() => onChange(shiftDate(value, 7))}>
            ›
          </button>
        </div>

        <div className="date-strip-days">
          {week.map((day) => {
            const date = new Date(`${day}T12:00:00`);
            const isSelected = day === value;
            return (
              <button
                key={day}
                type="button"
                className={`date-day-btn ${isSelected ? 'active' : ''}`}
                aria-pressed={isSelected}
                onClick={() => onChange(day)}
              >
                <span className="day-name">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <strong className="day-num">{date.toLocaleDateString(undefined, { day: '2-digit' })}</strong>
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

  const energyLabels = {
    1: 'Drained',
    2: 'Low',
    3: 'OK',
    4: 'Good',
    5: 'Great',
  };

  return (
    <div className="page-view daily-food-journal-page">
      <style>{`
        /* ----------------------------------------------------
           KEYFRAMES & ANIMATIONS
        ---------------------------------------------------- */
        @keyframes dailyJournalFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes waterPop {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.25) rotate(8deg); }
          100% { transform: scale(1); }
        }

        @keyframes energyBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px) scale(1.05); }
        }

        @keyframes modalBackdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalPopUp {
          from { opacity: 0; transform: scale(0.88) translateY(18px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes calendarSlideLeft {
          from { opacity: 0; transform: translateX(28px) scale(0.96); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }

        @keyframes calendarSlideRight {
          from { opacity: 0; transform: translateX(-28px) scale(0.96); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }

        @keyframes calendarFadeZoom {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        /* ----------------------------------------------------
           PAGE & DATE STRIP LAYOUT
        ---------------------------------------------------- */
        .daily-food-journal-page {
          animation: dailyJournalFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ease-out;
          color: #142116;
          padding-bottom: 40px;
        }

        .journal-date-strip {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid #a8c7a6;
          border-radius: 14px;
          padding: 8px 16px 10px;
          margin: 16px 0 20px;
          backdrop-filter: blur(8px);
        }

        .date-strip-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .date-picker-input-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .date-picker-input-group input {
          border: 1px solid #a8c7a6;
          background: #ffffff;
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 0.95rem;
          color: #102a1c;
          transition: all 0.2s ease;
        }

        .daily-view-calendar-btn {
          padding: 6px 14px;
          border-radius: 10px;
          background: #ffffff;
          border: 1.5px solid #a8c7a6;
          color: #1b4522;
          font: 700 0.82rem 'Otomanopee One', Georgia, serif;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .daily-view-calendar-btn:hover {
          background: #eaf5eb;
          border-color: #426e44;
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 6px 14px rgba(66, 110, 68, 0.2);
        }

        .daily-view-calendar-btn:active {
          transform: translateY(0) scale(0.96);
        }

        .date-arrow-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid #a8c7a6;
          background: #ffffff;
          font-size: 1.2rem;
          font-weight: 800;
          color: #1b4522;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.2s ease;
        }

        .date-arrow-btn:hover {
          background: #426e44;
          color: #ffffff;
          transform: scale(1.1);
        }

        .date-strip-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .date-day-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .date-day-btn .day-name {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #557361;
        }

        .date-day-btn .day-num {
          font: 800 1.2rem 'Otomanopee One', Georgia, serif;
          color: #102a1c;
        }

        .date-day-btn.active {
          background: #426e44;
          color: #ffffff;
          box-shadow: 0 6px 14px rgba(66, 110, 68, 0.3);
          transform: translateY(-2px);
        }

        .date-day-btn.active .day-name,
        .date-day-btn.active .day-num {
          color: #ffffff;
        }

        .date-day-btn:not(.active):hover {
          background: rgba(168, 199, 166, 0.25);
          transform: translateY(-1px);
        }

        /* ----------------------------------------------------
           FULL CALENDAR MODAL
        ---------------------------------------------------- */
        .daily-calendar-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(18, 33, 22, 0.45);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: modalBackdropFade 0.3s ease-out;
        }

        .daily-calendar-modal {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border: 1.5px solid #a8c7a6;
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
          animation: modalPopUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .daily-calendar-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .daily-calendar-header-titles {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .calendar-nav-title-btn {
          background: rgba(66, 110, 68, 0.12);
          border: 1px solid transparent;
          border-radius: 10px;
          padding: 6px 12px;
          font: 700 16px/1.2 'Otomanopee One', Georgia, serif;
          color: #1b4522;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .calendar-nav-title-btn:hover {
          background: #426e44;
          color: #ffffff;
          transform: scale(1.05);
        }

        .calendar-nav-title-btn:active {
          transform: scale(0.95);
        }

        .daily-calendar-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .calendar-arrow-btn,
        .calendar-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: 1px solid #a8c7a6;
          background: #f4fbf5;
          color: #1b4522;
          font-size: 18px;
          font-weight: 700;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calendar-arrow-btn:hover,
        .calendar-close-btn:hover {
          background: #426e44;
          color: #ffffff;
          transform: scale(1.12);
        }

        .calendar-animated-wrapper.slide-left { animation: calendarSlideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) ease-out; }
        .calendar-animated-wrapper.slide-right { animation: calendarSlideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) ease-out; }
        .calendar-animated-wrapper.fade-zoom { animation: calendarFadeZoom 0.28s cubic-bezier(0.16, 1, 0.3, 1) ease-out; }

        .calendar-week-labels {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          color: #426e44;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .calendar-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .calendar-day-empty { min-height: 40px; }

        .calendar-day-btn {
          min-height: 40px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: #f8fcf8;
          color: #142116;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .calendar-day-btn:hover {
          background: #d4ebd4;
          transform: scale(1.14);
          border-color: #426e44;
        }

        .calendar-day-btn.selected {
          background: #426e44;
          color: #ffffff;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(66, 110, 68, 0.4);
        }

        .calendar-months-grid,
        .calendar-years-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 8px 0;
        }

        .calendar-selector-btn {
          padding: 14px 8px;
          border-radius: 12px;
          border: 1px solid #a8c7a6;
          background: #f8fcf8;
          color: #1b4522;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .calendar-selector-btn:hover {
          background: #426e44;
          color: #ffffff;
          transform: translateY(-2px) scale(1.05);
        }

        .calendar-selector-btn.selected {
          background: #1b4522;
          color: #ffffff;
        }

        /* ----------------------------------------------------
           MAIN GRID & MEAL TABLES
        ---------------------------------------------------- */
        .daily-journal-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 24px;
          margin-top: 20px;
        }

        .meal-tables-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .meal-block {
          display: flex;
          background: #ffffff;
          border: 1.5px solid #a8c7a6;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(20, 33, 22, 0.04);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .meal-block:hover {
          border-color: #558756;
          box-shadow: 0 8px 22px rgba(20, 33, 22, 0.09);
          transform: translateY(-2px);
        }

        .meal-sidebar-tab {
          width: 68px;
          background: linear-gradient(180deg, #5b8a5d, #426e44);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px 6px;
          user-select: none;
          flex-shrink: 0;
          transition: background 0.3s ease;
        }

        .meal-block:hover .meal-sidebar-tab {
          background: linear-gradient(180deg, #49754b, #325634);
        }

        .tab-icon {
          font-size: 1.5rem;
          margin-bottom: 8px;
          transition: transform 0.3s ease;
        }

        .meal-block:hover .tab-icon {
          transform: scale(1.18) rotate(6deg);
        }

        .tab-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font: 700 1.15rem 'Otomanopee One', Georgia, serif;
          letter-spacing: 0.5px;
          text-transform: capitalize;
        }

        .meal-table-wrap {
          flex: 1;
          overflow-x: auto;
        }

        .daily-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .daily-table th {
          background: #f1f8f2;
          color: #2a472c;
          font-weight: 800;
          padding: 10px 12px;
          border-bottom: 1.5px solid #a8c7a6;
          border-right: 1px solid #d4e6d4;
          font-size: 0.78rem;
          letter-spacing: 0.6px;
        }

        .daily-table th:last-child { border-right: none; }

        .daily-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e1eee2;
          border-right: 1px solid #edf5ee;
          color: #213323;
          transition: background 0.2s ease;
        }

        .daily-table tr:hover td { background: #f6fcf7; }
        .food-name-cell { font-weight: 700; color: #122b1c; }

        .empty-td {
          text-align: center;
          color: #6a8c6c;
          font-style: italic;
          padding: 18px !important;
        }

        .entry-delete-btn {
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #e2a8a8;
          background: #fff4f4;
          color: #c92a2a;
          font-weight: 700;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .entry-delete-btn:hover:not(:disabled) {
          background: #ff4d4d;
          color: #ffffff;
          border-color: #ff4d4d;
          transform: scale(1.08);
        }

        .entry-delete-btn:active:not(:disabled) { transform: scale(0.94); }

        /* Daily Total Bar */
        .daily-total-bar {
          display: grid;
          grid-template-columns: 1.2fr repeat(4, 1fr);
          background: linear-gradient(135deg, #d8ebd9, #c3e2c5);
          border: 1.5px solid #a8c7a6;
          border-radius: 12px;
          padding: 10px 14px;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(20, 33, 22, 0.05);
        }

        .total-label {
          font: 800 1.05rem 'Otomanopee One', Georgia, serif;
          color: #102a1c;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .total-cell {
          font-size: 0.75rem;
          color: #3b5747;
          font-weight: 700;
          text-align: center;
          line-height: 1.3;
        }

        .total-cell strong { font-size: 0.95rem; color: #102a1c; }

        /* Widgets Column */
        .widgets-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .right-widget {
          background: #ffffff;
          border: 1.5px solid #a8c7a6;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 4px 14px rgba(20, 33, 22, 0.04);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .right-widget:hover {
          border-color: #558756;
          box-shadow: 0 8px 22px rgba(20, 33, 22, 0.08);
        }

        .widget-title {
          font: 800 0.98rem 'Otomanopee One', Georgia, serif;
          color: #102a1c;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }

        .widget-title.red-txt { color: #c93b3b; }

        .goals-edit-btn {
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid #a8c7a6;
          background: #f4fcf5;
          color: #1e7e48;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .goals-edit-btn:hover { background: #1e7e48; color: #ffffff; }

        .goals-mini-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .goal-box {
          background: #f6fbf7;
          border: 1px solid #d4ebd4;
          border-radius: 10px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease;
        }

        .goal-box:hover { transform: translateY(-2px); background: #eaf5eb; }
        .goal-lbl { font-size: 0.68rem; font-weight: 800; color: #4a6c4f; }
        .goal-val { font-size: 0.95rem; font-weight: 800; color: #102a1c; }

        /* Water Intake */
        .water-glasses-strip {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 14px;
        }

        .water-droplet-btn {
          background: #f0f7f1;
          border: 1px solid #b8dbba;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          font-size: 1.1rem;
          cursor: pointer;
          filter: grayscale(100%) opacity(0.4);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .water-droplet-btn.filled {
          filter: grayscale(0%) opacity(1);
          background: #e0f2fe;
          border-color: #38bdf8;
          animation: waterPop 0.35s ease-out;
          box-shadow: 0 4px 10px rgba(56, 189, 248, 0.3);
        }

        .water-droplet-btn:hover:not(:disabled) { transform: scale(1.18); }

        .water-counter button {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: 1px solid #a8c7a6;
          background: #ffffff;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .water-counter button:hover:not(:disabled) { background: #1e7e48; color: #ffffff; }

        /* Energy Level */
        .energy-boxes {
          display: flex;
          justify-content: space-between;
          gap: 6px;
        }

        .energy-item-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .energy-num {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1.5px solid #d1e5d2;
          background: #f8fcf8;
          color: #213323;
          font-weight: 800;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .energy-num:hover:not(:disabled) { background: #e2f2e4; transform: translateY(-2px); }

        .energy-num.active {
          background: #426e44;
          color: #ffffff;
          border-color: #426e44;
          box-shadow: 0 4px 12px rgba(66, 110, 68, 0.35);
          animation: energyBounce 0.4s ease-out;
        }

        .energy-sublabel { font-size: 0.65rem; font-weight: 700; color: #6a8c6c; }
        .motivation-box p { font-size: 0.85rem; color: #3b5747; line-height: 1.55; margin: 0; }

        @media (max-width: 992px) {
          .daily-journal-grid { grid-template-columns: 1fr; }
        }
      `}</style>

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
                          <td className="food-name-cell">{entry.foodName}</td>
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
            <div className="total-label">
              <span className="total-icon">📋</span> Daily Total
            </div>
            <div className="total-cell">CALORIES<br /><strong>{formatNumber(totals.calories)} kcal</strong></div>
            <div className="total-cell">PROTEIN<br /><strong>{formatNumber(totals.protein)} g</strong></div>
            <div className="total-cell">FAT<br /><strong>{formatNumber(totals.fat)} g</strong></div>
            <div className="total-cell">CARBS<br /><strong>{formatNumber(totals.carbs)} g</strong></div>
          </div>
        </div>

        <div className="widgets-column">
          <div className="card right-widget goals-card">
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
                <div className="goal-box">
                  <span className="goal-lbl">CALORIES</span>
                  <span className="goal-val">{goals.calories} kcal</span>
                </div>
                <div className="goal-box">
                  <span className="goal-lbl">PROTEIN</span>
                  <span className="goal-val">{goals.protein} g</span>
                </div>
                <div className="goal-box">
                  <span className="goal-lbl">FAT</span>
                  <span className="goal-val">{goals.fat} g</span>
                </div>
                <div className="goal-box">
                  <span className="goal-lbl">CARBS</span>
                  <span className="goal-val">{goals.carbs} g</span>
                </div>
              </div>
            )}
            {goalStorageError && <p className="daily-goals-error" role="alert">{goalStorageError}</p>}
          </div>

          <div className="card right-widget water-card">
            <div className="widget-title">WATER INTAKE 💧</div>
            <div className="water-glasses-strip">
              {Array.from({ length: 8 }).map((_, index) => {
                const isFilled = index < waterGlasses;
                return (
                  <button
                    key={index}
                    type="button"
                    className={`water-droplet-btn ${isFilled ? 'filled' : ''}`}
                    onClick={() => onWaterGlassesChange(isFilled && waterGlasses === index + 1 ? index : index + 1)}
                    aria-label={`Water glass ${index + 1}`}
                    disabled={controlsDisabled}
                  >
                    💧
                  </button>
                );
              })}
            </div>
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

          <div className="card right-widget energy-card">
            <div className="widget-title">ENERGY LEVEL ⚡</div>
            <div className="energy-boxes">
              {[1, 2, 3, 4, 5].map((level) => (
                <div key={level} className="energy-item-group">
                  <button
                    type="button"
                    className={`energy-num ${energyLevel === level ? 'active' : ''}`}
                    aria-label={`Set energy level to ${level}`}
                    aria-pressed={energyLevel === level}
                    disabled={controlsDisabled}
                    onClick={() => onEnergyLevelChange(level)}
                  >
                    {level}
                  </button>
                  <span className="energy-sublabel">{energyLabels[level]}</span>
                </div>
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