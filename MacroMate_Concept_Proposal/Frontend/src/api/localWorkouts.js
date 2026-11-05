const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}/api/workouts${path}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Workout request failed (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

export const listWorkouts = (signal) => request('', { signal });
export const addWorkout = (workout) => request('', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(workout),
});
export const deleteWorkout = (id) => request(`/${id}`, { method: 'DELETE' });
