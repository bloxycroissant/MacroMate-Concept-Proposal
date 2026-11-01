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

export default function HealthJournalPage({ date, onDateChange, day, days, onChange, disabled }) {
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
