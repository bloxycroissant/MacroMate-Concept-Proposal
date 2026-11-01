import { useEffect, useRef, useState } from 'react';
import { addFoodEntry, deleteFoodEntry, listFoodEntries } from '../api/foodEntries';
import { useAuth } from '../supabase/authContext';

export default function useFoodEntries() {
  const { user } = useAuth() || {};
  const uid = user?.id;
  const uidRef = useRef(uid);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedUid, setLoadedUid] = useState(null);
  const [errorState, setErrorState] = useState({ uid: null, message: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    uidRef.current = uid;
    const controller = new AbortController();
    listFoodEntries(controller.signal)
      .then((loadedEntries) => {
        if (controller.signal.aborted) return;
        setEntries(loadedEntries);
        setLoadedUid(uid);
        setErrorState({ uid, message: '' });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setErrorState({ uid, message: `Could not load your journal. ${err.message}` });
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
      const loadedEntries = await listFoodEntries();
      if (requestedUid === uidRef.current) {
        setEntries(loadedEntries);
        setLoadedUid(requestedUid);
      }
    } catch (err) {
      if (requestedUid === uidRef.current) setErrorState({ uid: requestedUid, message: `Could not load your journal. ${err.message}` });
    } finally {
      if (requestedUid === uidRef.current) setLoading(false);
    }
  }

  async function save(entry) {
    setBusy(true);
    try {
      const saved = await addFoodEntry(entry);
      setEntries((current) => [...current, saved]);
      return saved;
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    setBusy(true);
    try {
      await deleteFoodEntry(id);
      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (err) {
      setErrorState({ uid, message: `Could not delete the entry. ${err.message}` });
    } finally {
      setBusy(false);
    }
  }

  return {
    entries: loadedUid === uid ? entries : [],
    loading: loading || loadedUid !== uid,
    error: errorState.uid === uid ? errorState.message : '',
    busy, reload, save, remove,
  };
}
