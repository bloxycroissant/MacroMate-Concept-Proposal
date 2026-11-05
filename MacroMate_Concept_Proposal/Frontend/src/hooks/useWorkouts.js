import { useEffect, useRef, useState } from 'react';
import { addWorkout, deleteWorkout, listWorkouts } from '../api/workouts';
import { useAuth } from '../supabase/authContext';

export default function useWorkouts() {
  const { user } = useAuth() || {};
  const uid = user?.id;
  const uidRef = useRef(uid);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedUid, setLoadedUid] = useState(null);
  const [errorState, setErrorState] = useState({ uid: null, message: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    uidRef.current = uid;
    const controller = new AbortController();
    listWorkouts(controller.signal)
      .then((loadedWorkouts) => {
        if (controller.signal.aborted) return;
        setWorkouts(loadedWorkouts);
        setLoadedUid(uid);
        setErrorState({ uid, message: '' });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setErrorState({ uid, message: `Could not load workouts. ${err.message}` });
          setLoadedUid(uid);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [uid]);

  async function reload() {
    const requestedUid = uid;
    setLoading(true);
    setErrorState({ uid, message: '' });
    try {
      const loadedWorkouts = await listWorkouts();
      if (requestedUid === uidRef.current) {
        setWorkouts(loadedWorkouts);
        setLoadedUid(requestedUid);
      }
    } catch (err) {
      if (requestedUid === uidRef.current) setErrorState({ uid: requestedUid, message: `Could not load workouts. ${err.message}` });
    } finally {
      setLoading(false);
    }
  }

  async function save(workout) {
    setBusy(true);
    setErrorState({ uid, message: '' });
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
    setErrorState({ uid, message: '' });
    try {
      await deleteWorkout(id);
      setWorkouts((current) => current.filter((workout) => workout.id !== id));
    } catch (err) {
      setErrorState({ uid, message: `Could not delete the workout. ${err.message}` });
    } finally {
      setBusy(false);
    }
  }

  return {
    workouts: loadedUid === uid ? workouts : [],
    loading: loading || loadedUid !== uid,
    error: errorState.uid === uid ? errorState.message : '',
    busy, reload, save, remove,
  };
}
