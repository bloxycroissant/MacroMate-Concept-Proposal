import { useEffect, useState } from 'react';
import { addWorkout, deleteWorkout, listWorkouts } from '../api/workouts';

export default function useWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    listWorkouts(controller.signal)
      .then(setWorkouts)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(`Could not load workouts. ${err.message}`);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function reload() {
    setLoading(true);
    setError('');
    try {
      setWorkouts(await listWorkouts());
    } catch (err) {
      setError(`Could not load workouts. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function save(workout) {
    setBusy(true);
    setError('');
    try {
      const saved = await addWorkout(workout);
      setWorkouts((current) => [...current, saved].sort((left, right) =>
        right.workoutDate.localeCompare(left.workoutDate) || right.id - left.id));
      return saved;
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    setBusy(true);
    setError('');
    try {
      await deleteWorkout(id);
      setWorkouts((current) => current.filter((workout) => workout.id !== id));
    } catch (err) {
      setError(`Could not delete the workout. ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return { workouts, loading, error, busy, reload, save, remove };
}
