import { useEffect, useState } from 'react';
import { addFoodEntry, deleteFoodEntry, listFoodEntries } from '../api/foodEntries';

export default function useFoodEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    listFoodEntries(controller.signal)
      .then(setEntries)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(`Could not load your journal. ${err.message}`);
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
      setEntries(await listFoodEntries());
    } catch (err) {
      setError(`Could not load your journal. ${err.message}`);
    } finally {
      setLoading(false);
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
    setError('');
    try {
      await deleteFoodEntry(id);
      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (err) {
      setError(`Could not delete the entry. ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return { entries, loading, error, busy, reload, save, remove };
}
