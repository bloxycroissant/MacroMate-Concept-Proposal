import { useState } from 'react';
import { localDate } from '../utils/journalDates';

export default function WorkoutEntryForm({ busy, onSave, onCancel }) {
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setError('');
    try {
      await onSave({
        workoutType: data.get('workoutType'),
        distanceKm: Number(data.get('distanceKm')),
        workoutDate: data.get('workoutDate'),
      });
      onCancel();
    } catch (err) {
      setError(`Workout was not saved. ${err.message}`);
    }
  }

  return (
    <form className="card workout-form" onSubmit={submit}>
      <h3>Log a workout</h3>
      <div className="workout-form-fields">
        <label className="form-group">
          Workout type
          <select name="workoutType" className="grey-input" defaultValue="Walking" required disabled={busy}>
            <option>Walking</option>
            <option>Jogging</option>
            <option>Running</option>
          </select>
        </label>
        <label className="form-group">
          Distance (km)
          <input name="distanceKm" type="number" min="0.01" max="9999.99" step="0.01" required className="grey-input" disabled={busy} />
        </label>
        <label className="form-group">
          Date
          <input name="workoutDate" type="date" defaultValue={localDate()} required className="grey-input" disabled={busy} />
        </label>
      </div>
      {error && <p className="journal-error" role="alert">{error}</p>}
      <div className="workout-form-actions">
        <button type="submit" className="primary-green-btn" disabled={busy}>{busy ? 'Saving…' : 'Save workout'}</button>
        <button type="button" className="entry-delete-btn" disabled={busy} onClick={onCancel}> Cancel </button>
      </div>
    </form>
  );
}
