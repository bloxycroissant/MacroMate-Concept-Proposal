import { useState } from 'react';
import WorkoutEntryForm from '../components/WorkoutEntryForm';
import useWorkouts from '../hooks/useWorkouts';
import { localDate, shiftDate } from '../utils/journalDates';

function formatDistance(distanceKm) {
  return `${Number(distanceKm).toLocaleString(undefined, { maximumFractionDigits: 2 })} km`;
}

function formatWorkoutDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function GoalsPage() {
  const { workouts, loading, error, busy, reload, save, remove } = useWorkouts();
  const [showForm, setShowForm] = useState(false);
  const today = localDate();
  const weekStartOffset = new Date(`${today}T12:00:00`).getDay();
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(today, index - weekStartOffset);
    const distanceKm = workouts
      .filter((workout) => workout.workoutDate === date)
      .reduce((total, workout) => total + workout.distanceKm, 0);
    return {
      date,
      day: new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' }),
      distanceKm,
    };
  });
  const maxDayDistance = Math.max(0, ...week.map((day) => day.distanceKm));
  const bestDay = week.reduce((best, day) => day.distanceKm > (best?.distanceKm ?? 0) ? day : best, null);
  const weekTotal = week.reduce((total, day) => total + day.distanceKm, 0);
  const recentWorkouts = [...workouts]
    .sort((left, right) => right.workoutDate.localeCompare(left.workoutDate) || right.id - left.id)
    .slice(0, 5);

  return (
    <div className="page-view">
      <div className="goals-page-header">
        <h1 className="giant-title">Your Goals, Your Future!</h1>
        <button
          type="button"
          className="primary-green-btn"
          disabled={loading || !!error || busy}
          onClick={() => setShowForm((visible) => !visible)}
        >
          + Log workout
        </button>
      </div>

      {loading && <p className="journal-notice" role="status">Loading workouts…</p>}
      {error && (
        <div className="journal-notice journal-error" role="alert">
          <p>{error}</p>
          <button type="button" disabled={loading || busy} onClick={reload}>Retry</button>
        </div>
      )}
      {showForm && !error && <WorkoutEntryForm busy={busy} onSave={save} onCancel={() => setShowForm(false)} />}

      <div className="goals-grid">
        <div className="card workout-card">
          <div className="workout-list-header">
            <h3 className="section-green-title">Recent workouts</h3>
            {!loading && <span className="stat-sub">{workouts.length} logged</span>}
          </div>
          {recentWorkouts.length === 0 && !loading && !error && (
            <p className="stat-sub">No workouts yet. Log a walk, jog, or run to get started.</p>
          )}
          {recentWorkouts.map((workout) => (
            <div key={workout.id} className="workout-row">
              <div>
                <div className="stat-sub">{workout.workoutType}</div>
                <strong className="dist-num">{formatDistance(workout.distanceKm)}</strong>
              </div>
              <div className="workout-row-details">
                <span className="stat-sub">{formatWorkoutDate(workout.workoutDate)}</span>
                <button
                  type="button"
                  className="entry-delete-btn"
                  disabled={busy}
                  onClick={() => remove(workout.id)}
                  aria-label={`Delete ${workout.workoutType} workout from ${formatWorkoutDate(workout.workoutDate)}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="goals-right-col">
          <div className="card bar-chart-card">
            <div className="workout-chart-header">
              <strong>This week</strong>
              <span className="stat-sub">{formatDistance(weekTotal)} total</span>
            </div>
            <div className="days-bars-container">
              {week.map((day) => {
                const height = maxDayDistance === 0 ? 0 : day.distanceKm / maxDayDistance * 100;
                return (
                  <div key={day.date} className="bar-col" title={`${day.date}: ${formatDistance(day.distanceKm)}`}>
                    <span className="bar-day">{day.day}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ height: `${height}%` }}></div>
                    </div>
                    <span className="bar-val">{day.distanceKm ? formatDistance(day.distanceKm) : '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card best-day-card">
            <span className="stat-sub">Your best day this week</span>
            <h2 className="best-day-title">
              {bestDay && bestDay.distanceKm > 0
                ? `${bestDay.day} · ${formatDistance(bestDay.distanceKm)}`
                : 'No workouts this week yet'}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
