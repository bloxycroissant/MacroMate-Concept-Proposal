import { useEffect, useRef, useState } from 'react';
import JournalDateSelector from '../components/JournalDateSelector';
import { shiftDate } from '../utils/journalDates';

const moods = ['Low', 'Okay', 'Good', 'Great'];
const faces = ['😞', '😐', '🙂', '😄'];
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function averageMood(entries) {
  const values = entries.map(([, value]) => moods.indexOf(value.mood)).filter((value) => value >= 0);
  if (!values.length) return null;
  return moods[Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)];
}

export function HealthJournalCalendar({ date, onDateChange, day, days, onChange, disabled }) {
  const [period, setPeriod] = useState('month');
  const [selectedAverageKey, setSelectedAverageKey] = useState(null);
  const monthPickerRef = useRef(null);
  const selectedMonthRef = useRef(null);
  const selectedYear = Number(date.slice(0, 4));
  const yearOptions = [...new Set([
    ...Array.from({ length: 16 }, (_, index) => new Date().getFullYear() - 10 + index),
    selectedYear,
    ...Object.keys(days).map((key) => Number(key.slice(0, 4))),
  ])].sort((left, right) => right - left);
  const records = Object.entries(days).filter(([key, value]) => value.mood && (period === 'week'
    ? key >= shiftDate(date, -6) && key <= date : period === 'month' ? key.startsWith(date.slice(0, 7)) : key.startsWith(String(selectedYear))))
    .sort(([left], [right]) => left.localeCompare(right));
  let periodDates = [];
  if (period === 'week') {
    periodDates = Array.from({ length: 7 }, (_, index) => shiftDate(date, index - 6));
  } else if (period === 'month') {
    const [year, month] = date.split('-').map(Number);
    const count = new Date(year, month, 0).getDate();
    periodDates = Array.from({ length: count }, (_, index) => `${date.slice(0, 7)}-${String(index + 1).padStart(2, '0')}`);
  }
  const firstWeekday = periodDates.length ? new Date(`${periodDates[0]}T12:00:00`).getDay() : 0;
  const calendarCells = [...Array(firstWeekday).fill(null), ...periodDates];
  const moodByDate = new Map(records);
  const selectedMonth = Number(date.slice(5, 7)) - 1;
  const monthlyAverages = months.map((month, index) => {
    const key = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
    return {
      key,
      label: month,
      mood: averageMood(records.filter(([recordDate]) => recordDate.startsWith(key))),
    };
  });
  const averageItems = period === 'week'
    ? Array.from({ length: 7 }, (_, index) => {
      const key = shiftDate(date, index - 6);
      return { key, label: weekdays[new Date(`${key}T12:00:00`).getDay()], mood: moodByDate.get(key)?.mood || null };
    })
    : period === 'month'
      ? [{ key: date.slice(0, 7), label: 'Month average', mood: averageMood(records) }]
      : monthlyAverages;
  const selectedAverage = averageItems.find((item) => item.key === selectedAverageKey)
    || averageItems.find((item) => item.key === (period === 'week' ? date : period === 'month' ? date.slice(0, 7) : `${date.slice(0, 7)}`))
    || averageItems[0];
  useEffect(() => {
    if (period !== 'month' || !monthPickerRef.current || !selectedMonthRef.current) return;
    const picker = monthPickerRef.current;
    const selected = selectedMonthRef.current;
    const pickerBounds = picker.getBoundingClientRect();
    const selectedBounds = selected.getBoundingClientRect();
    picker.scrollTo({
      left: picker.scrollLeft + selectedBounds.left - pickerBounds.left - (picker.clientWidth - selectedBounds.width) / 2,
      behavior: 'smooth',
    });
  }, [period, selectedMonth]);
  const periodDescription = period === 'week'
    ? `${shiftDate(date, -6)} – ${date}`
    : period === 'month'
      ? new Date(`${date.slice(0, 7)}-01T12:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : String(selectedYear);
  return <div className="page-view"><h1 className="page-title">Health Journal</h1>
    <JournalDateSelector value={date} onChange={onDateChange} />
    <div className="health-grid-top">
      <section className="card checkin-card"><h2>Daily check-in</h2>
        <fieldset disabled={disabled} className="food-form-fields">
          <span>Mood</span><div className="mood-selector">{moods.map((mood, index) => <button key={mood} type="button" aria-label={`${mood} mood`} aria-pressed={day.mood === mood} className={`mood-btn ${day.mood === mood ? 'selected' : ''}`} onClick={() => onChange({ mood })}><span aria-hidden="true">{faces[index]}</span> {mood}</button>)}</div>
          <label>Energy: {day.energyLevel}/5<input aria-label="Energy level" type="range" min="1" max="5" step="1" value={day.energyLevel} onChange={(event) => onChange({ energyLevel: Number(event.target.value) })} /></label>
          <div className="slider-labels"><span>Drained</span><span>Energized</span></div>
          <div className="form-row-2">
            <label>Sleep hours<select aria-label="Sleep hours" value={Math.floor(day.sleepMinutes / 60)} onChange={(event) => onChange({ sleepMinutes: Number(event.target.value) * 60 + day.sleepMinutes % 60 })}>{Array.from({ length: 24 }, (_, index) => <option key={index} value={index}>{index} hrs</option>)}</select></label>
            <label>Sleep minutes<select aria-label="Sleep minutes" value={day.sleepMinutes % 60} onChange={(event) => onChange({ sleepMinutes: Math.floor(day.sleepMinutes / 60) * 60 + Number(event.target.value) })}>{Array.from({ length: 60 }, (_, index) => <option key={index} value={index}>{index} min</option>)}</select></label>
          </div>
          <div className="water-counter"><button aria-label="Decrease water" onClick={() => onChange({ waterGlasses: Math.max(0, day.waterGlasses - 1) })}>−</button><span>{day.waterGlasses} glasses</span><button aria-label="Increase water" onClick={() => onChange({ waterGlasses: Math.min(8, day.waterGlasses + 1) })}>+</button></div>
        </fieldset>
      </section>
      <section className="card snapshot-card">
        <div className="snapshot-header">
          <div><h2>{day.mood}</h2><p>Selected day</p></div>
          <span className="snapshot-heart" aria-hidden="true">♥</span>
        </div>
        <div className="snapshot-stats">
          <div>{day.energyLevel}/5 energy</div><div>{(day.sleepMinutes / 60).toFixed(1)} h sleep</div><div>{day.waterGlasses} glasses</div>
        </div>
      </section>
    </div>
    <div className="mood-calendar-grid">
      <section className="card mood-history-card">
        <h2>Mood</h2>
        <div className="timeframe-tabs">{['week', 'month', 'year'].map((value) => <button key={value} type="button" aria-pressed={period === value} className={period === value ? 'active' : ''} onClick={() => setPeriod(value)}>{value}</button>)}</div>
        {period === 'month' && <div ref={monthPickerRef} className="mood-month-picker" aria-label="Choose month">{months.map((month, index) => <button key={month} ref={selectedMonth === index ? selectedMonthRef : null} type="button" aria-pressed={selectedMonth === index} className={selectedMonth === index ? 'active' : ''} onClick={() => onDateChange(`${date.slice(0, 4)}-${String(index + 1).padStart(2, '0')}-01`)}>{month}</button>)}</div>}
        {period === 'year' ? <>
          <label className="mood-year-picker">Choose year
            <select aria-label="Choose year" value={selectedYear} onChange={(event) => onDateChange(`${event.target.value}-${date.slice(5, 7)}-01`)}>
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <div className="mood-month-grid" role="grid" aria-label={`Monthly moods for ${selectedYear}`}>
            {monthlyAverages.map(({ key, label, mood }) => <button key={key} type="button" role="gridcell" aria-label={`${label}${mood ? `, ${mood} average mood` : ', no mood recorded'}`} aria-pressed={selectedMonth === months.indexOf(label)} title={mood ? `${label}: ${mood} average mood` : `${label}: no mood recorded`} className={`mood-month-summary ${selectedMonth === months.indexOf(label) ? 'selected' : ''} ${mood ? 'has-mood' : ''}`} onClick={() => onDateChange(`${key}-01`)}><span>{label.slice(0, 3)}</span><span className="mood-month-summary-face" aria-hidden="true">{mood ? faces[moods.indexOf(mood)] : '–'}</span></button>)}
          </div>
        </> : <>
          <p className="wellness-period-label">{period === 'week' ? `Check-ins for ${periodDescription}` : periodDescription}</p>
          <div className="mood-calendar" role="grid" aria-label={`Mood calendar for ${periodDescription}`}>
            {weekdays.map((label) => <strong key={label} className="mood-calendar-weekday" role="columnheader">{label}</strong>)}
            {calendarCells.map((key, index) => {
              if (!key) return <span key={`blank-${index}`} className="mood-calendar-blank" aria-hidden="true" />;
              const mood = moodByDate.get(key)?.mood;
              const dayNumber = Number(key.slice(-2));
              return <button key={key} type="button" role="gridcell" aria-label={`${key}${mood ? `, ${mood} mood` : ', no mood recorded'}`} aria-pressed={date === key} title={mood ? `${key}: ${mood}` : `${key}: no mood recorded`} className={`mood-calendar-day ${date === key ? 'selected' : ''} ${mood ? 'has-mood' : ''}`} onClick={() => onDateChange(key)}><span aria-hidden="true">{period === 'week' ? weekdays[new Date(`${key}T12:00:00`).getDay()] : dayNumber}</span>{mood && <span className="mood-calendar-face" aria-hidden="true">{faces[moods.indexOf(mood)]}</span>}</button>;
            })}
          </div>
          {records.length === 0 && <p className="mood-calendar-empty">No mood check-ins in this period yet.</p>}
        </>}
      </section>
      <section className="card avg-mood-card">
        <h2>Average Mood</h2>
        <p>{period === 'week' ? 'Daily mood over the last 7 days' : period === 'month' ? 'Average mood for the selected month' : `Average mood by month in ${selectedYear}`}</p>
        <p className="average-mood-selection" role="status">{selectedAverage?.label}: {selectedAverage?.mood ? `${selectedAverage.mood} mood` : 'No mood recorded'}</p>
        <div className={`average-mood-period-grid ${period === 'year' ? 'year-average-grid' : ''}`} role="grid" aria-label={`Average moods for ${periodDescription}`}>
          {averageItems.map(({ key, label, mood }) => <button key={key} type="button" role="gridcell" aria-label={`${label}${mood ? `: ${mood} mood` : ': no mood recorded'}`} aria-pressed={selectedAverage?.key === key} title={mood ? `${label}: ${mood} mood` : `${label}: no mood recorded`} className={`average-mood-day ${mood ? 'has-mood' : ''} ${selectedAverage?.key === key ? 'selected' : ''}`} onClick={() => setSelectedAverageKey(key)}><span className="average-mood-label">{label}</span><span aria-hidden="true">{mood ? faces[moods.indexOf(mood)] : '–'}</span></button>)}
        </div>
      </section>
    </div>
  </div>;
}

export default function HealthJournalPage({ date, onDateChange, day = {}, days = {}, onChange, disabled }) {
  const [period, setPeriod] = useState('month');
  const [month, setMonth] = useState(date ? date.slice(0, 7) : new Date().toISOString().slice(0, 7));
  const [activePickerDate, setActivePickerDate] = useState(null);
  const [avgPickerDay, setAvgPickerDay] = useState(null);

  const safeDay = day || {};
  const safeDays = days || {};

  // Filter records based on selected timeframe (Week, Month, Year)
  const records = Object.entries(safeDays).filter(([key, value]) => value && value.mood && (
    period === 'week' ? key >= shiftDate(date, -6) && key <= date :
    period === 'month' ? key.startsWith(month) : key.startsWith(month.slice(0, 4))
  )).sort(([left], [right]) => left.localeCompare(right));

  // Calendar calculations for current month view
  const yearNum = Number(month.slice(0, 4)) || new Date().getFullYear();
  const monthNum = Number(month.slice(5, 7)) - 1 || new Date().getMonth();
  const firstDayOfWeek = new Date(yearNum, monthNum, 1).getDay();
  const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate();

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

  const fullCalendarGrid = [...calendarPadding, ...calendarDays];

  // Calculate Average Mood index (0: Low, 1: Okay, 2: Good, 3: Great)
  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const values = records.filter(([key]) => new Date(`${key}T12:00:00`).getDay() === index)
      .map(([, value]) => moods.indexOf(value.mood));
    const validValues = values.filter((val) => val !== -1);
    const average = validValues.length ? Math.round(validValues.reduce((sum, val) => sum + val, 0) / validValues.length) : null;
    return { label: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][index], average, dayIndex: index };
  });

  const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
    setAvgPickerDay(null);
  };

  return (
    <div className="page-view" style={{ position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.15); }
          28% { transform: scale(1); }
          42% { transform: scale(1.15); }
          70% { transform: scale(1); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .heart-icon-animated {
          animation: heartbeat 1.6s infinite ease-in-out;
          display: inline-block;
          transform-origin: center;
        }
        .mood-circle-btn {
          transition: all 0.2s ease;
        }
        .mood-circle-btn:hover {
          transform: scale(1.12);
        }
      `}</style>

      <span className="sub-heading" style={{ color: '#3c5a47', fontSize: '0.9rem', fontWeight: '700' }}>Whole-person-wellness</span>
      <h1 className="page-title" style={{ fontSize: '2.5rem', margin: '2px 0 16px 0', fontWeight: '900' }}>Health Journal</h1>
      <p style={{ margin: '-10px 0 16px 0', color: '#557361', fontSize: '0.95rem' }}>Notice how your daily habits shape the way you feel.</p>

      {/* TOP DATE SELECTOR */}
      <JournalDateSelector 
        value={date} 
        onChange={(newDate) => {
          onDateChange?.(newDate);
          if (newDate && newDate.slice(0, 7) !== month) {
            setMonth(newDate.slice(0, 7));
          }
        }} 
      />

      {/* TOP ROW */}
      <div className="health-grid-top" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <section className="card checkin-card" style={{ background: '#eaf4eb', borderRadius: '20px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#102a1c', margin: '0 0 4px 0' }}>Today's check-in</h2>
          <p style={{ fontSize: '0.85rem', color: '#557361', margin: '0 0 16px 0' }}>A quick reflection takes less than a minute</p>
          
          <fieldset disabled={disabled} style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="mood-selector" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {moods.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={safeDay.mood === m}
                  className={`mood-btn ${safeDay.mood === m ? 'selected' : ''}`}
                  onClick={() => handleSelectDateAndMood(date, m)}
                  style={{
                    flex: '1 1 70px', padding: '10px 4px', borderRadius: '20px', border: safeDay.mood === m ? '2px solid #108a43' : '1px solid #c2dec9',
                    background: safeDay.mood === m ? '#108a43' : '#ffffff', color: safeDay.mood === m ? '#ffffff' : '#102a1c',
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
                value={safeDay.energyLevel || 3}
                onChange={(event) => onChange?.({ energyLevel: Number(event.target.value) }, date)}
                style={{ width: '100%', accentColor: '#108a43' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid #c2dec9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem' }}>🌙 Sleep</span>
                <select
                  aria-label="Sleep duration"
                  value={Math.floor((safeDay.sleepMinutes || 390) / 60)}
                  onChange={(event) => onChange?.({ sleepMinutes: Number(event.target.value) * 60 + ((safeDay.sleepMinutes || 0) % 60) }, date)}
                  style={{ border: 'none', background: 'transparent', fontWeight: '800', cursor: 'pointer', flex: 1 }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i} hrs {(safeDay.sleepMinutes || 0) % 60} mins</option>
                  ))}
                </select>
              </div>

              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid #c2dec9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb' }}>💧 Water</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button type="button" onClick={() => onChange?.({ waterGlasses: Math.max(0, (safeDay.waterGlasses || 0) - 1) }, date)} style={{ border: 'none', background: '#e2f2e5', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}>-</button>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#2563eb' }}>{safeDay.waterGlasses || 6}</span>
                  <button type="button" onClick={() => onChange?.({ waterGlasses: Math.min(8, (safeDay.waterGlasses || 0) + 1) }, date)} style={{ border: 'none', background: '#e2f2e5', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}>+</button>
                </div>
              </div>
            </div>
          </fieldset>
        </section>

        <section className="card snapshot-card" style={{ background: '#0a4225', color: '#ffffff', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', opacity: 0.8 }}>LATEST SNAPSHOT</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <div>
                <h1 style={{ fontSize: '2.8rem', fontWeight: '900', margin: 0 }}>{safeDay.mood || 'Okay'}</h1>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '0.85rem' }}>Overall Mood</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="heart-icon-animated" style={{ fontSize: '2rem' }}>💚</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '900' }}>{safeDay.energyLevel || 3}/5</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Energy</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '900' }}>{((safeDay.sleepMinutes || 450) / 60).toFixed(1)} h</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Sleep</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '900' }}>{safeDay.waterGlasses || 6}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Water</span>
            </div>
          </div>
        </section>
      </div>

      {/* BOTTOM ROW */}
      <div className="health-grid-bottom" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <section className="card mood-history-card" style={{ background: '#eaf4eb', borderRadius: '20px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#102a1c', margin: '0 0 12px 0', textAlign: 'center' }}>MOOD</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            {['Week', 'Month', 'Year'].map((val) => {
              const lower = val.toLowerCase();
              return (
                <button
                  key={lower}
                  aria-pressed={period === lower}
                  onClick={() => setPeriod(lower)}
                  style={{
                    padding: '8px 20px', borderRadius: '20px', border: 'none',
                    background: period === lower ? '#0a4225' : '#c2dec9', color: period === lower ? '#ffffff' : '#102a1c',
                    fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {val}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
            {monthsList.map((m, idx) => {
              const mNum = String(idx + 1).padStart(2, '0');
              const isSelected = month.endsWith(mNum);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    const newMonth = `${yearNum}-${mNum}`;
                    setMonth(newMonth);
                    onDateChange?.(`${newMonth}-01`);
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

          {/* CALENDAR GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', background: '#d5e8da', padding: '16px', borderRadius: '16px' }}>
            {fullCalendarGrid.map((item) => {
              if (item.isPadding) {
                return <div key={item.key} style={{ width: '32px', height: '32px', margin: 'auto' }} />;
              }

              return (
                <div key={item.date} style={{ position: 'relative', textAlign: 'center' }}>
                  <button
                    type="button"
                    className="mood-circle-btn"
                    onClick={() => {
                      onDateChange?.(item.date);
                      setAvgPickerDay(null);
                      setActivePickerDate(activePickerDate === item.date ? null : item.date);
                    }}
                    title={`${item.date}: ${item.mood || 'Click to select mood'}`}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%', border: item.date === date ? '2px solid #000' : 'none',
                      background: item.mood ? '#ffffff' : '#c2dec9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', margin: 'auto'
                    }}
                  >
                    {item.mood ? faces[moods.indexOf(item.mood)] : ''}
                  </button>

                  {/* MOOD SELECTION POPOVER */}
                  {activePickerDate === item.date && (
                    <div style={{
                      position: 'absolute', bottom: '38px', left: '50%', transform: 'translateX(-50%)',
                      background: '#ffffff', borderRadius: '12px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      display: 'flex', gap: '4px', zIndex: 20, animation: 'popIn 0.18s ease-out'
                    }}>
                      {moods.map((m, mIdx) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleSelectDateAndMood(item.date, m)}
                          style={{ border: 'none', background: 'transparent', fontSize: '1.1rem', cursor: 'pointer', padding: '2px' }}
                          title={m}
                        >
                          {faces[mIdx]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* AVERAGE MOOD CARD */}
        <section className="card avg-mood-card" style={{ background: '#eaf4eb', borderRadius: '20px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#102a1c', margin: '0 0 4px 0' }}>Average Mood</h2>
          <p style={{ fontSize: '0.85rem', color: '#557361', margin: '0 0 16px 0' }}>Your average mood by day</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
            {weekdays.map(({ label, average, dayIndex }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#557361' }}>{label}</span>
                <button
                  type="button"
                  className="mood-circle-btn"
                  onClick={() => {
                    const match = records.find(([key]) => new Date(`${key}T12:00:00`).getDay() === dayIndex);
                    const targetDate = match ? match[0] : date;
                    onDateChange?.(targetDate);
                    setActivePickerDate(null);
                    setAvgPickerDay(avgPickerDay === dayIndex ? null : dayIndex);
                  }}
                  title={average !== null ? `${label} Average Mood: ${moods[average]}` : `Click to log mood for ${label}`}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', background: average !== null ? '#ffffff' : '#c2dec9',
                    border: '1px solid #b2d4bb', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', padding: 0
                  }}
                >
                  {average !== null ? faces[average] : ''}
                </button>

                {/* AVERAGE MOOD POPOVER */}
                {avgPickerDay === dayIndex && (
                  <div style={{
                    position: 'absolute', bottom: '38px', left: '50%', transform: 'translateX(-50%)',
                    background: '#ffffff', borderRadius: '12px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex', gap: '4px', zIndex: 20, animation: 'popIn 0.18s ease-out'
                  }}>
                    {moods.map((m, mIdx) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          const match = records.find(([key]) => new Date(`${key}T12:00:00`).getDay() === dayIndex);
                          const targetDate = match ? match[0] : date;
                          handleSelectDateAndMood(targetDate, m);
                        }}
                        style={{ border: 'none', background: 'transparent', fontSize: '1.1rem', cursor: 'pointer', padding: '2px' }}
                        title={m}
                      >
                        {faces[mIdx]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 
