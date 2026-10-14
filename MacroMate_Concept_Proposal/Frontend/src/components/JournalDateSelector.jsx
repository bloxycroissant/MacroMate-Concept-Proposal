import { shiftDate } from '../utils/journalDates';

export default function JournalDateSelector({ value, onChange }) {
  return (
    <div className="date-strip-card">
      <button className="arrow-btn" aria-label="Previous day" onClick={() => onChange(shiftDate(value, -1))}>‹</button>
      <label className="journal-date-label">
        Journal date
        <input type="date" value={value} required onChange={(event) => {
          if (event.target.value) onChange(event.target.value);
        }} />
      </label>
      <button className="arrow-btn" aria-label="Next day" onClick={() => onChange(shiftDate(value, 1))}>›</button>
    </div>
  );
}
