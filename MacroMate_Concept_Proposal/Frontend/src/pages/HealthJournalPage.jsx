import { useEffect, useRef, useState } from 'react';
import JournalDateSelector from '../components/JournalDateSelector';
import { localDate, shiftDate } from '../utils/journalDates';

const moods = ['Low', 'Okay', 'Good', 'Great'];
const faces = ['😞', '😐', '🙂', '😄'];

export default function HealthJournalPage({ date = localDate(), onDateChange, day = {}, days = {}, onChange, disabled }) {
  const [period, setPeriod] = useState('month');
  const [month, setMonth] = useState(date ? date.slice(0, 7) : localDate().slice(0, 7));
  const [activePickerDate, setActivePickerDate] = useState(null);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [averageMoodOpen, setAverageMoodOpen] = useState(false);
  const monthControlsRef = useRef(null);

  const safeDay = day || {};
  const safeDays = days || {};
  const currentMood = safeDays[date]?.mood ?? null;
  const sleepMinutes = Number.isFinite(safeDay.sleepMinutes) ? safeDay.sleepMinutes : 0;
  const sleepHours = Math.floor(sleepMinutes / 60);
  const sleepRemainderMinutes = sleepMinutes % 60;
  const waterGlasses = Number.isFinite(safeDay.waterGlasses) ? safeDay.waterGlasses : 0;
  const energyValue = Number.isInteger(safeDay.energyLevel) && safeDay.energyLevel >= 1 && safeDay.energyLevel <= 5
    ? safeDay.energyLevel
    : 3;
  const energyProgress = `${((energyValue - 1) / 4) * 100}%`;

  const records = Object.entries(safeDays)
    .filter(([key, value]) => value?.mood && /^\d{4}-\d{2}-\d{2}$/.test(key))
    .sort(([left], [right]) => left.localeCompare(right));

  // Calendar calculations for current month view
  const yearNum = Number(month.slice(0, 4)) || new Date().getFullYear();
  const monthNum = Math.max(0, Math.min(11, Number(month.slice(5, 7)) - 1));
  const firstDayOfWeek = new Date(yearNum, monthNum, 1).getDay();
  const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate();
  const selectedDate = new Date(`${date}T12:00:00`);
  const weekStart = shiftDate(date, -selectedDate.getDay());
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const fullDate = shiftDate(weekStart, index);
    return { isPadding: false, date: fullDate, dayNum: Number(fullDate.slice(8, 10)), mood: safeDays[fullDate]?.mood };
  });
  const selectedYear = Number(month.slice(0, 4));
  const currentYear = new Date().getFullYear();
  const recordedYears = records.map(([key]) => Number(key.slice(0, 4)));
  const firstYear = Math.min(selectedYear, currentYear - 10, ...recordedYears);
  const lastYear = Math.max(selectedYear, currentYear, ...recordedYears);
  const yearOptions = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => lastYear - index);

  const averageRecords = records.filter(([key]) => (
    period === 'week' ? key >= weekStart && key <= shiftDate(weekStart, 6) :
    period === 'month' ? key.startsWith(month) :
    key.startsWith(String(selectedYear))
  ));
  const averageValues = averageRecords
    .map(([, value]) => moods.indexOf(value.mood))
    .filter((value) => value >= 0);
  const averageMood = averageValues.length
    ? Math.round(averageValues.reduce((sum, value) => sum + value, 0) / averageValues.length)
    : null;
  const averageMoodScore = averageValues.length
    ? averageValues.reduce((sum, value) => sum + value + 1, 0) / averageValues.length
    : null;
  const averagePeriodLabel = period === 'week'
    ? `Week of ${weekStart}`
    : period === 'month'
      ? new Date(yearNum, monthNum, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : String(selectedYear);

  // Padding slots so days align under SUN-SAT columns
  const calendarPadding = Array.from({ length: firstDayOfWeek }, (_, i) => ({
    isPadding: true,
    key: `pad-${i}`
  }));

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayStr = String(i + 1).padStart(2, '0');
    const fullDate = `${month}-${dayStr}`;
    const record = safeDays[fullDate] || {};
    return { isPadding: false, date: fullDate, dayNum: i + 1, mood: record.mood };
  });

  const fullCalendarGrid = period === 'week' ? weekDates : [...calendarPadding, ...calendarDays];
  const calendarWeekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthGrid = period !== 'week';

  const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    if (period === 'week') return;
    const container = monthControlsRef.current;
    const selectedButton = container?.querySelector('[aria-pressed="true"]');
    if (!container || !selectedButton) return;
    const left = selectedButton.offsetLeft - (container.clientWidth - selectedButton.clientWidth) / 2;
    container.scrollTo({ left, behavior: 'smooth' });
  }, [month, period]);

  // Direct Synchronous Saver
  const handleSelectDateAndMood = (targetDate, moodValue) => {
    const activeTarget = targetDate || date;

    if (onChange) {
      onChange({ mood: moodValue }, activeTarget);
    }

    if (onDateChange && activeTarget !== date) {
      onDateChange(activeTarget);
    }

    setActivePickerDate(null);
  };

  const changeYear = (nextYear) => {
    const nextMonth = `${nextYear}-${String(monthNum + 1).padStart(2, '0')}`;
    const dayOfMonth = Math.min(Number(date.slice(8, 10)), new Date(nextYear, monthNum + 1, 0).getDate());
    setMonth(nextMonth);
    onDateChange?.(`${nextMonth}-${String(dayOfMonth).padStart(2, '0')}`);
    setYearPickerOpen(false);
  };

  return (
    <div className="page-view health-journal-page" style={{ position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box', containerType: 'inline-size' }}>
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes heartbeat {
          0%, 28%, 70%, 100% { transform: scale(1); }
          14%, 42% { transform: scale(1.16); }
        }
        .snapshot-heart-icon {
          display: inline-block;
          transform-origin: center;
        }
        .mood-circle-btn {
          transition: all 0.2s ease;
        }
        .mood-circle-btn:hover {
          transform: scale(1.12);
        }
        @keyframes health-card-enter {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes health-value-pop {
          0% { opacity: 0.55; transform: scale(0.82); }
          65% { transform: scale(1.16); }
          100% { opacity: 1; transform: scale(1); }
        }
        .health-journal-page .health-animated-card {
          animation: health-card-enter 0.45s ease-out both;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .health-journal-page {
          max-width: 1200px !important;
          margin: 0 auto !important;
          gap: 12px !important;
        }
        .health-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 4px;
        }
        .health-page-heading { min-width: 0; }
        .health-page-heading h1 {
          margin: 0 0 4px !important;
          font-size: clamp(1.8rem, 3vw, 2.4rem) !important;
          line-height: 1.05 !important;
        }
        .health-page-heading p {
          margin: 0 !important;
          color: #557361;
          font-size: 0.92rem;
        }
        .health-page-header .date-strip-card {
          flex: 0 0 auto;
          width: auto;
          gap: 8px;
          padding: 7px 12px;
          border: 1px solid #bfdcc3;
          border-radius: 14px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .health-page-header .journal-date-label {
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 800;
          white-space: nowrap;
        }
        .health-page-header .journal-date-label input {
          padding: 5px 7px;
          border-color: transparent;
          background: #f5faf5;
          font-weight: 800;
        }
        .health-grid-top {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(270px, 0.85fr) !important;
          gap: 12px !important;
          margin: 0 !important;
          align-items: stretch;
        }
        .health-grid-bottom {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(270px, 0.85fr) !important;
          gap: 12px !important;
          align-items: stretch;
        }
        .health-journal-page .checkin-card,
        .health-journal-page .snapshot-card,
        .health-journal-page .mood-history-card,
        .health-journal-page .avg-mood-card {
          min-width: 0;
          border-radius: 14px !important;
          padding: 16px !important;
        }
        .health-journal-page .checkin-heading {
          margin: -16px -16px 14px;
          padding: 11px 12px;
          border-radius: 12px;
          background: #78d2a7;
        }
        .health-journal-page .checkin-heading h2 {
          font-size: 1.65rem !important;
          line-height: 1.15;
        }
        .health-journal-page .checkin-heading p { margin: 0 !important; }
        .health-journal-page .mood-selector { margin: 0 0 2px; gap: 8px; flex-wrap: nowrap !important; }
        .health-journal-page .mood-selector .mood-btn {
          min-width: 0;
          min-height: 36px;
          padding: 7px 4px !important;
          border-width: 1px !important;
          background: #fff !important;
          color: #102a1c !important;
          font-size: 0.8rem;
        }
        .health-journal-page .mood-selector .mood-btn.selected {
          border: 2px solid #0b9b56 !important;
          color: #102a1c !important;
        }
        .health-journal-page .checkin-card fieldset { gap: 11px !important; }
        .health-journal-page .checkin-card fieldset > div:nth-child(2) { margin-top: -3px; }
        .health-journal-page .wellness-energy-slider {
          appearance: none;
          height: 18px;
          margin: 0;
          background: transparent;
          cursor: pointer;
        }
        .health-journal-page .wellness-energy-slider::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(to right, #108a43 0%, #108a43 var(--energy-progress), #d7d7d7 var(--energy-progress), #d7d7d7 100%);
          box-shadow: inset 0 0 0 1px #aab7ad;
        }
        .health-journal-page .wellness-energy-slider::-moz-range-track {
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(to right, #108a43 0%, #108a43 var(--energy-progress), #d7d7d7 var(--energy-progress), #d7d7d7 100%);
          box-shadow: inset 0 0 0 1px #aab7ad;
        }
        .health-journal-page .wellness-energy-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          margin-top: -4px;
          border: 0;
          border-radius: 50%;
          background: #108a43;
        }
        .health-journal-page .wellness-energy-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border: 0;
          border-radius: 50%;
          background: #108a43;
        }
        .health-journal-page .checkin-controls-grid {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 12px !important;
        }
        .health-journal-page .sleep-control,
        .health-journal-page .water-control {
          min-width: 0;
          min-height: 74px;
          border: 1px solid #34463a !important;
          border-radius: 12px !important;
        }
        .health-journal-page .sleep-control {
          display: grid !important;
          grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr);
          gap: 4px !important;
          padding: 8px !important;
        }
        .health-journal-page .sleep-control > span { font-size: 0.76rem !important; white-space: nowrap; }
        .health-journal-page .sleep-control label { justify-content: center; gap: 2px !important; min-width: 0; font-size: 0.62rem !important; white-space: nowrap; }
        .health-journal-page .sleep-control select { width: 40px; min-width: 0 !important; padding: 4px 1px !important; font-size: 0.72rem; }
        .health-journal-page .water-control { gap: 5px; padding: 8px !important; }
        .health-journal-page .water-control > span { flex: 0 0 auto; font-size: 0.72rem !important; white-space: nowrap; }
        .health-journal-page .water-counter { display: grid !important; grid-template-columns: 20px minmax(50px, 1fr) 20px; gap: 3px !important; min-width: 96px; }
        .health-journal-page .water-counter > span { min-width: 50px !important; font-size: 0.68rem !important; white-space: nowrap; }
        .health-journal-page .water-counter > button { width: 20px !important; height: 20px !important; flex: 0 0 20px; }
        .health-journal-page .sleep-control { background: #edf2ef !important; }
        .health-journal-page .water-control { background: #d9f1f7 !important; }
        .health-journal-page .snapshot-card { background: #0b7847 !important; }
        .health-journal-page .snapshot-mood-title {
          font-size: clamp(1.6rem, 2.5vw, 2rem) !important;
          line-height: 1.1;
        }
        .health-journal-page .snapshot-heart-button {
          width: 58px;
          height: 58px;
          padding: 0 !important;
          border: 0 !important;
          background: transparent !important;
        }
        .health-journal-page .snapshot-heart-button svg {
          width: 40px;
          height: 40px;
          fill: none;
          stroke: #fff;
          stroke-width: 1.5;
        }
        .health-journal-page .snapshot-stat { background: #16a663 !important; }
        .health-journal-page .health-heartbeat {
          animation: heartbeat 1.6s infinite ease-in-out;
          transform-origin: center;
        }
        .health-journal-page .snapshot-stat { padding: 9px 5px !important; }
        .health-journal-page .snapshot-stat > span:first-child { font-size: clamp(0.9rem, 1.5vw, 1.2rem) !important; white-space: nowrap; }
        .health-journal-page .mood-history-card { background: #eaf4eb !important; }
        .health-journal-page .avg-mood-card { background: #eaf4eb !important; }
        .health-journal-page .mood-history-card > h2,
        .health-journal-page .avg-mood-card > h2 { margin: 0 0 10px !important; }
        .health-journal-page .mood-history-card .mood-period-controls { margin-bottom: 10px !important; }
        .health-journal-page .mood-period-controls button,
        .health-journal-page .mood-month-controls button {
          min-height: 32px;
          padding: 6px 12px !important;
          border-radius: 12px !important;
        }
        .health-journal-page .mood-month-controls {
          scrollbar-width: thin;
          scrollbar-color: #777 #3d3d3d;
          padding-bottom: 7px !important;
        }
        .health-journal-page .mood-month-controls::-webkit-scrollbar { height: 12px; }
        .health-journal-page .mood-month-controls::-webkit-scrollbar-track { background: #3d3d3d; }
        .health-journal-page .mood-month-controls::-webkit-scrollbar-thumb { background: #777; border: 2px solid #3d3d3d; border-radius: 8px; }
        .health-journal-page .mood-calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 7px;
          padding: 12px;
          border-radius: 14px;
          background: #d7e9da;
        }
        .health-journal-page .mood-calendar-grid > div { min-width: 0; }
        .health-journal-page .mood-calendar-grid .mood-circle-btn {
          width: min(100%, 36px) !important;
          height: auto !important;
          aspect-ratio: 1;
          background: #c2dec9 !important;
          font-size: clamp(0.85rem, 1.5vw, 1.1rem) !important;
        }
        .health-journal-page .mood-calendar-grid .mood-circle-btn.has-recorded-mood {
          background: #fff !important;
        }
        .health-journal-page .avg-mood-card > p {
          margin-bottom: 10px !important;
          color: #244b34 !important;
        }
        .health-journal-page .average-mood-circle {
          width: 60px !important;
          height: 60px !important;
          border: 2px solid #0b9b56 !important;
          background: #fff !important;
        }

        /* ----------------------------------------------------
           HIGH CONTRAST & DARK MODE OVERRIDES
        ---------------------------------------------------- */
        .wellness-high-contrast .health-journal-page {
          color: #f8fafc !important;
        }
        .wellness-high-contrast .checkin-card,
        .wellness-high-contrast .snapshot-card,
        .wellness-high-contrast .mood-history-card,
        .wellness-high-contrast .avg-mood-card {
          background-color: #0f172a !important;
          border: 1px solid #94a3b8 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .checkin-heading {
          background: #1e293b !important;
          border-bottom: 1px solid #475569;
        }
        .wellness-high-contrast .checkin-heading h2,
        .wellness-high-contrast .checkin-heading p {
          color: #f8fafc !important;
        }
        .wellness-high-contrast .mood-selector .mood-btn {
          background-color: #1e293b !important;
          border-color: #475569 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .mood-selector .mood-btn.selected {
          border-color: #38bdf8 !important;
          background-color: #0284c7 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .sleep-control,
        .wellness-high-contrast .water-control {
          background-color: #1e293b !important;
          border-color: #475569 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .sleep-control select {
          background-color: #0f172a !important;
          border-color: #475569 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .water-counter button {
          background-color: #334155 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .water-counter span {
          color: #38bdf8 !important;
        }
        .wellness-high-contrast .snapshot-card {
          background-color: #0f172a !important;
          border: 1px solid #94a3b8 !important;
        }
        .wellness-high-contrast .snapshot-stat {
          background-color: #1e293b !important;
          border: 1px solid #475569 !important;
        }
        .wellness-high-contrast .mood-period-controls button {
          background-color: #1e293b !important;
          color: #f8fafc !important;
          border: 1px solid #475569 !important;
        }
        .wellness-high-contrast .mood-period-controls button[aria-pressed="true"] {
          background-color: #38bdf8 !important;
          color: #0f172a !important;
          border-color: #38bdf8 !important;
        }
        .wellness-high-contrast .mood-month-controls button {
          background-color: #1e293b !important;
          color: #f8fafc !important;
          border: 1px solid #475569 !important;
        }
        .wellness-high-contrast .mood-month-controls button[aria-pressed="true"] {
          background-color: #38bdf8 !important;
          color: #0f172a !important;
        }
        .wellness-high-contrast .mood-calendar-grid {
          background-color: #1e293b !important;
          border: 1px solid #475569 !important;
        }
        .wellness-high-contrast .mood-calendar-grid .mood-circle-btn {
          background-color: #334155 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .mood-calendar-grid .mood-circle-btn.has-recorded-mood {
          background-color: #0284c7 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .average-mood-circle {
          background-color: #1e293b !important;
          border-color: #38bdf8 !important;
          color: #f8fafc !important;
        }
        .wellness-high-contrast .health-page-heading h1,
        .wellness-high-contrast .mood-history-card h2,
        .wellness-high-contrast .avg-mood-card h2 {
          color: #f8fafc !important;
        }
        .wellness-high-contrast .health-page-heading p,
        .wellness-high-contrast .avg-mood-card p {
          color: #94a3b8 !important;
        }

        /* ----------------------------------------------------
           ZOOM & RESPONSIVE COMPONENT STRUCTURE BREAKPOINTS
        ---------------------------------------------------- */
        @media (max-width: 1100px), (max-device-width: 1100px) {
          .health-grid-top,
          .health-grid-bottom {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
        @media (max-width: 800px), (max-device-width: 800px) {
          .health-page-header { align-items: flex-start; flex-direction: column; }
          .health-page-header .date-strip-card { align-self: stretch; justify-content: center; }
          .health-grid-top,
          .health-grid-bottom { grid-template-columns: minmax(0, 1fr) !important; }
          .health-journal-page .checkin-controls-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
        @media (max-width: 500px), (max-device-width: 500px) {
          .health-journal-page { padding: 0 !important; }
          .health-page-header .date-strip-card { padding: 6px !important; }
          .health-page-header .journal-date-label { flex-wrap: wrap; justify-content: center; }
          .health-journal-page .checkin-card,
          .health-journal-page .snapshot-card,
          .health-journal-page .mood-history-card,
          .health-journal-page .avg-mood-card { padding: 12px !important; }
          .health-journal-page .checkin-heading { margin: -12px -12px 12px; }
          .health-journal-page .checkin-controls-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }

        .health-journal-page .health-animated-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(16, 42, 28, 0.1);
        }
        .health-journal-page .health-animated-control {
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .health-journal-page .health-animated-control:hover {
          transform: translateY(-1px);
          border-color: #108a43 !important;
          box-shadow: 0 4px 10px rgba(16, 42, 28, 0.1);
        }
        .health-journal-page .health-animated-control:focus-visible {
          outline: 2px solid #108a43;
          outline-offset: 2px;
        }
        .health-journal-page button:not(:disabled),
        .health-journal-page select,
        .health-journal-page input {
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .health-journal-page button:not(:disabled):active {
          transform: scale(0.94);
        }
        .health-journal-page button:not(:disabled):hover {
          filter: brightness(1.05);
        }
        .health-journal-page select:hover {
          border-color: #108a43 !important;
          box-shadow: 0 3px 8px rgba(16, 42, 28, 0.1);
        }
        .health-journal-page .snapshot-card > div:last-child > div {
          animation: health-card-enter 0.4s ease-out both;
        }
        .health-journal-page .snapshot-card > div:last-child > div:nth-child(2) {
          animation-delay: 0.08s;
        }
        .health-journal-page .snapshot-card > div:last-child > div:nth-child(3) {
          animation-delay: 0.16s;
        }
        .health-value-pop {
          display: inline-block;
          animation: health-value-pop 0.28s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .health-journal-page *, .health-journal-page *::before, .health-journal-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <header className="health-page-header">
        <div className="health-page-heading">
          <span className="sub-heading" style={{ color: '#3c5a47', fontSize: '0.9rem', fontWeight: '700' }}>Whole-person wellness</span>
          <h1 className="page-title">Health Journal</h1>
          <p>Notice how your daily habits shape the way you feel.</p>
        </div>
        <JournalDateSelector
          value={date}
          onChange={(newDate) => {
            onDateChange?.(newDate);
            setYearPickerOpen(false);
            if (newDate && newDate.slice(0, 7) !== month) {
              setMonth(newDate.slice(0, 7));
            }
          }}
        />
      </header>

      {/* TOP ROW */}
      <div className="health-grid-top">
        <section className="card checkin-card health-animated-card" style={{ background: '#eaf4eb' }}>
          <div className="checkin-heading">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#102a1c', margin: '0 0 4px 0' }}>Today's check-in</h2>
            <p style={{ fontSize: '0.85rem', color: '#244b34', margin: 0 }}>A quick reflection takes less than a minute</p>
          </div>
          
          <fieldset disabled={disabled} style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="mood-selector" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {moods.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={currentMood === m}
                  className={`mood-btn ${currentMood === m ? 'selected' : ''}`}
                  onClick={() => handleSelectDateAndMood(date, m)}
                  style={{
                    flex: '1 1 70px', padding: '10px 4px', borderRadius: '20px', border: currentMood === m ? '2px solid #108a43' : '1px solid #c2dec9',
                    background: '#ffffff', color: '#102a1c',
                    fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '800', color: '#557361', marginBottom: '4px' }}>
                <span>Drained</span>
                <span>Energized</span>
              </div>
              <input
                aria-label="Energy level"
                type="range"
                min="1"
                max="5"
                step="1"
                value={energyValue}
                onChange={(event) => onChange?.({ energyLevel: Number(event.target.value) }, date)}
                className="wellness-energy-slider"
                style={{ width: '100%', '--energy-progress': energyProgress }}
              />
            </div>

            <div className="checkin-controls-grid">
              <div className="health-animated-control sleep-control" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem' }}>🌙 Sleep</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                  <select
                    aria-label="Sleep hours"
                    value={sleepHours}
                    onChange={(event) => onChange?.({ sleepMinutes: Number(event.target.value) * 60 + sleepRemainderMinutes }, date)}
                    style={{ border: '1px solid #d5e8da', background: '#ffffff', color: '#102a1c', borderRadius: '6px', padding: '5px', fontWeight: '800', cursor: 'pointer', minWidth: '50px' }}
                  >
                    {Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour} style={{ background: '#ffffff', color: '#102a1c' }}>{hour}</option>)}
                  </select>
                  hrs
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                  <select
                    aria-label="Sleep minutes"
                    value={sleepRemainderMinutes}
                    onChange={(event) => onChange?.({ sleepMinutes: sleepHours * 60 + Number(event.target.value) }, date)}
                    style={{ border: '1px solid #d5e8da', background: '#ffffff', color: '#102a1c', borderRadius: '6px', padding: '5px', fontWeight: '800', cursor: 'pointer', minWidth: '50px' }}
                  >
                    {Array.from({ length: 60 }, (_, minute) => <option key={minute} value={minute} style={{ background: '#ffffff', color: '#102a1c' }}>{minute}</option>)}
                  </select>
                  mins
                </label>
              </div>

              <div className="health-animated-control water-control" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb' }}>💧 Water</span>
                <div className="water-counter" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    aria-label="Remove one glass of water"
                    disabled={waterGlasses <= 0}
                    onClick={() => onChange?.({ waterGlasses: Math.max(0, waterGlasses - 1) }, date)}
                    className="health-animated-control"
                    style={{ border: 'none', background: '#e2f2e5', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}
                  >-</button>
                  <span key={waterGlasses} className="health-value-pop" aria-live="polite" style={{ fontWeight: '800', fontSize: '0.85rem', color: '#2563eb', minWidth: '72px', textAlign: 'center' }}>
                    {waterGlasses} {waterGlasses === 1 ? 'glass' : 'glasses'}
                  </span>
                  <button
                    type="button"
                    aria-label="Add one glass of water"
                    onClick={() => onChange?.({ waterGlasses: waterGlasses + 1 }, date)}
                    className="health-animated-control"
                    style={{ border: 'none', background: '#e2f2e5', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}
                  >+</button>
                </div>
              </div>
            </div>
          </fieldset>
        </section>

        <section className="card snapshot-card health-animated-card" style={{ color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', opacity: 0.8 }}>LATEST SNAPSHOT</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <div>
                <h1 className="snapshot-mood-title" style={{ fontWeight: '900', margin: 0 }}>{currentMood || 'No mood'}</h1>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '0.85rem' }}>Overall Mood</p>
              </div>
              <div
                className="health-heartbeat"
                aria-hidden="true"
                style={{ display: 'grid', placeItems: 'center', width: '58px', height: '58px', fontSize: '2.5rem', lineHeight: 1 }}
              >
                ❤️
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px' }}>
            <div className="snapshot-stat" style={{ padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '900' }}>{energyValue}/5</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Energy</span>
            </div>
            <div className="snapshot-stat" style={{ padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <span key={sleepMinutes} className="health-value-pop" style={{ display: 'block', fontSize: '1.2rem', fontWeight: '900' }}>{(sleepMinutes / 60).toFixed(1)} h</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Sleep</span>
            </div>
            <div className="snapshot-stat" style={{ padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <span key={waterGlasses} className="health-value-pop" style={{ display: 'block', fontSize: '1.2rem', fontWeight: '900' }}>{waterGlasses}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Water</span>
            </div>
          </div>
        </section>
      </div>

      {/* BOTTOM ROW */}
      <div className="health-grid-bottom">
        <section className="card mood-history-card health-animated-card" style={{ background: '#eaf4eb' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#102a1c', margin: '0 0 12px 0', textAlign: 'center' }}>MOOD</h2>
          
          <div className="mood-period-controls" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            {['Week', 'Month', 'Year'].map((val) => {
              const lower = val.toLowerCase();
              return (
                <button
                  key={lower}
                  type="button"
                  aria-pressed={period === lower}
                  onClick={() => {
                    if (lower === 'year') {
                      setPeriod('year');
                      setYearPickerOpen((open) => !open);
                    } else {
                      setPeriod(lower);
                      setYearPickerOpen(false);
                    }
                    setActivePickerDate(null);
                    setAverageMoodOpen(false);
                  }}
                  style={{
                    padding: '8px 20px', borderRadius: '20px', border: 'none',
                    background: period === lower ? '#000000' : '#ffffff', color: period === lower ? '#ffffff' : '#102a1c',
                    fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {val}
                </button>
              );
            })}
          </div>

          {yearPickerOpen && (
            <label style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '800' }}>
              Choose year
              <select
                aria-label="Choose mood history year"
                value={selectedYear}
                onChange={(event) => changeYear(Number(event.target.value))}
                style={{ padding: '6px 10px', border: '1px solid #b2d4bb', borderRadius: '10px', background: '#ffffff', fontWeight: '700' }}
              >
                {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
          )}

          {period !== 'week' && (
            <div ref={monthControlsRef} className="mood-month-controls" role="region" aria-label="Scroll to choose a month" tabIndex={0} style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
              {monthsList.map((m, idx) => {
                const mNum = String(idx + 1).padStart(2, '0');
                const isSelected = month.endsWith(mNum);
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      const newMonth = `${yearNum}-${mNum}`;
                      const selectedDay = Math.min(Number(date.slice(8, 10)), new Date(yearNum, idx + 1, 0).getDate());
                      setMonth(newMonth);
                      onDateChange?.(`${newMonth}-${String(selectedDay).padStart(2, '0')}`);
                    }}
                    style={{
                      padding: '6px 14px', borderRadius: '16px', border: 'none',
                      background: isSelected ? '#000000' : '#ffffff', color: isSelected ? '#ffffff' : '#102a1c',
                      fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.8rem'
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          )}

          {/* CALENDAR GRID */}
          {!monthGrid && (
            <div className="days-header" style={{ marginBottom: '8px' }}>
              {calendarWeekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
            </div>
          )}
          <div className="mood-calendar-grid">
            {fullCalendarGrid.map((item) => {
              if (item.isPadding) {
                return <div key={item.key} style={{ width: '32px', height: '32px', margin: 'auto' }} />;
              }

              const moodIndex = moods.indexOf(item.mood);
              const hasRecordedMood = moodIndex >= 0;

              return (
                <div key={item.date} style={{ position: 'relative', textAlign: 'center' }}>
                  <button
                    type="button"
                    className={`mood-circle-btn${hasRecordedMood ? ' has-recorded-mood' : ''}`}
                    data-has-mood={hasRecordedMood ? 'true' : 'false'}
                    onClick={() => {
                      onDateChange?.(item.date);
                      if (period === 'week' && item.date.slice(0, 7) !== month) {
                        setMonth(item.date.slice(0, 7));
                      }
                      setActivePickerDate(activePickerDate === item.date ? null : item.date);
                      setAverageMoodOpen(false);
                    }}
                    aria-label={`${item.date}: ${hasRecordedMood ? item.mood : 'No mood recorded'}. Click to view or change mood.`}
                    title={`${item.date}: ${hasRecordedMood ? item.mood : 'Click to select mood'}`}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%', border: item.date === date ? '2px solid #000' : 'none',
                      background: hasRecordedMood ? '#ffffff' : '#c2dec9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', margin: 'auto'
                    }}
                  >
                    {hasRecordedMood ? faces[moodIndex] : ''}
                  </button>

                  {/* MOOD SELECTION POPOVER */}
                  {activePickerDate === item.date && (
                    <div style={{
                      position: 'absolute', top: '38px', left: '50%', transform: 'translateX(-50%)',
                      background: '#ffffff', borderRadius: '12px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 20, animation: 'popIn 0.18s ease-out',
                      whiteSpace: 'nowrap'
                    }}>
                      <strong>{hasRecordedMood ? `${faces[moodIndex]} ${item.mood}` : 'Choose mood'}</strong>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {moods.map((m, mIdx) => (
                          <button
                            key={m}
                            type="button"
                            aria-label={`Set mood to ${m} for ${item.date}`}
                            onClick={() => handleSelectDateAndMood(item.date, m)}
                            style={{ border: 'none', background: 'transparent', fontSize: '1.1rem', cursor: 'pointer', padding: '2px' }}
                            title={m}
                          >
                            {faces[mIdx]}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectDateAndMood(item.date, null)}
                        style={{ border: 'none', background: 'transparent', color: '#557361', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: '4px 8px' }}
                      >
                        Remove mood
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* AVERAGE MOOD CARD */}
        <section className="card avg-mood-card health-animated-card" style={{ background: '#eaf4eb' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#102a1c', margin: '0 0 4px 0', textAlign: 'center' }}>Average Mood</h2>
          <p style={{ fontSize: '0.85rem', color: '#557361', margin: '0 0 16px 0', textAlign: 'center' }}>
            {`Average mood from this ${period}'s recorded check-ins`}
          </p>

          <div className="average-mood-summary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <button
              type="button"
              className="mood-circle-btn average-mood-circle"
              aria-label={averageMood === null ? `No average mood for ${averagePeriodLabel}` : `Show average mood for ${averagePeriodLabel}: ${moods[averageMood]}`}
              aria-expanded={averageMoodOpen}
              onClick={() => setAverageMoodOpen((open) => !open)}
              title={averageMood === null ? 'No check-ins for this period' : `${averagePeriodLabel}: ${moods[averageMood]}`}
              style={{
                width: '64px', height: '64px', borderRadius: '50%', background: averageMood !== null ? '#ffffff' : '#c2dec9',
                border: '1px solid #b2d4bb', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', padding: 0
              }}
            >
              {averageMood !== null ? faces[averageMood] : ''}
            </button>
            <span style={{ fontSize: '0.8rem', color: '#557361', fontWeight: '700' }}>{averagePeriodLabel}</span>
            <span aria-live="polite" style={{ fontSize: '0.8rem', color: '#557361', textAlign: 'center' }}>
              {averageMoodScore === null
                ? 'No mood check-ins'
                : period === 'year'
                  ? `Annual average ${averageMoodScore.toFixed(2)} / 4`
                  : `Average ${averageMoodScore.toFixed(2)} / 4 from ${averageValues.length} check-in${averageValues.length === 1 ? '' : 's'}`}
            </span>
            {averageMoodOpen && (
              <div role="status" style={{
                position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                background: '#ffffff', borderRadius: '12px', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 20, animation: 'popIn 0.18s ease-out', whiteSpace: 'nowrap', fontWeight: '800'
              }}>
                {averageMood === null
                  ? `No mood check-ins for ${averagePeriodLabel}`
                  : period === 'year'
                    ? `${faces[averageMood]} ${moods[averageMood]} average (${averageMoodScore.toFixed(2)} / 4) for ${averagePeriodLabel}`
                    : `${faces[averageMood]} ${moods[averageMood]} average (${averageMoodScore.toFixed(2)} / 4) from ${averageValues.length} check-in${averageValues.length === 1 ? '' : 's'}`}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}