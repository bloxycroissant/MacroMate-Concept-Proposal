import { useState } from 'react';
import JournalDateSelector from '../components/JournalDateSelector';
import { shiftDate } from '../utils/journalDates';

const moods = ['Low', 'Okay', 'Good', 'Great'];
const faces = ['😞', '😐', '🙂', '😄'];
export default function HealthJournalPage({ date, onDateChange, day, days, onChange, disabled }) {
  const [period, setPeriod] = useState('month');
  const [month, setMonth] = useState(date.slice(0, 7));
  const records = Object.entries(days).filter(([key, value]) => value.mood && (period === 'week'
    ? key >= shiftDate(date, -6) && key <= date : period === 'month' ? key.startsWith(month) : key.startsWith(month.slice(0, 4))))
    .sort(([left], [right]) => left.localeCompare(right));
  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const values = records.filter(([key]) => new Date(`${key}T12:00:00`).getDay() === index).map(([, value]) => moods.indexOf(value.mood) + 1);
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    return { label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index], average };
  });
  return <div className="page-view"><h1 className="page-title">Health Journal</h1>
    <JournalDateSelector value={date} onChange={onDateChange} />
    <div className="health-grid-top">
      <section className="card checkin-card"><h2>Daily check-in</h2>
        <fieldset disabled={disabled} className="food-form-fields">
          <span>Mood</span><div className="mood-selector">{moods.map((mood) => <button key={mood} type="button" aria-pressed={day.mood === mood} className={`mood-btn ${day.mood === mood ? 'selected' : ''}`} onClick={() => onChange({ mood })}>{mood}</button>)}</div>
          <label>Energy: {day.energyLevel}/5<input aria-label="Energy level" type="range" min="1" max="5" step="1" value={day.energyLevel} onChange={(event) => onChange({ energyLevel: Number(event.target.value) })} /></label>
          <div className="slider-labels"><span>Drained</span><span>Energized</span></div>
          <div className="form-row-2">
            <label>Sleep hours<select aria-label="Sleep hours" value={Math.floor(day.sleepMinutes / 60)} onChange={(event) => onChange({ sleepMinutes: Number(event.target.value) * 60 + day.sleepMinutes % 60 })}>{Array.from({ length: 24 }, (_, index) => <option key={index} value={index}>{index} hrs</option>)}</select></label>
            <label>Sleep minutes<select aria-label="Sleep minutes" value={day.sleepMinutes % 60} onChange={(event) => onChange({ sleepMinutes: Math.floor(day.sleepMinutes / 60) * 60 + Number(event.target.value) })}>{Array.from({ length: 60 }, (_, index) => <option key={index} value={index}>{index} min</option>)}</select></label>
          </div>
          <div className="water-counter"><button aria-label="Decrease water" onClick={() => onChange({ waterGlasses: Math.max(0, day.waterGlasses - 1) })}>−</button><span>{day.waterGlasses} glasses</span><button aria-label="Increase water" onClick={() => onChange({ waterGlasses: Math.min(8, day.waterGlasses + 1) })}>+</button></div>
        </fieldset>
      </section>
      <section className="card snapshot-card"><h2>{day.mood}</h2><p>Selected day</p><div className="snapshot-stats">
        <div>{day.energyLevel}/5 energy</div><div>{(day.sleepMinutes / 60).toFixed(1)} h sleep</div><div>{day.waterGlasses} glasses</div>
      </div></section>
    </div>
    <section className="card mood-history-card"><h2>Mood history</h2>
      <div className="timeframe-tabs">{['week', 'month', 'year'].map((value) => <button key={value} aria-pressed={period === value} className={period === value ? 'active' : ''} onClick={() => setPeriod(value)}>{value}</button>)}</div>
      <label>History month<input type="month" value={month} onChange={(event) => { if (event.target.value) setMonth(event.target.value); }} /></label>
      {records.length === 0 && <p>No mood check-ins in this period yet.</p>}
      <div className="wellness-history">{records.map(([key, value]) => <button key={key} title={`${key}: ${value.mood}`} onClick={() => onDateChange(key)}><span>{faces[moods.indexOf(value.mood)]}</span><span>{key}</span></button>)}</div>
    </section>
    <section className="card avg-mood-card"><h2>Average mood by weekday</h2><p>Based on saved check-ins in the selected period.</p>
      <div className="wellness-weekdays">{weekdays.map(({ label, average }) => <div key={label}><strong>{label}</strong><span>{average ? faces[Math.round(average) - 1] : '—'}</span><span>{average ? `${average.toFixed(1)}/4` : 'No entries'}</span></div>)}</div>
    </section>
  </div>;
}
