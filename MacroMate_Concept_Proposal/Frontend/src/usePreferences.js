import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const DEFAULT_PREFS = {
  highContrast: false,
  reducedMotion: false,
  enhancedFocus: false,
  announcements: false,
  dailyReminders: false,
};

const LABELS = {
  highContrast: 'High contrast mode',
  reducedMotion: 'Reduce motion',
  enhancedFocus: 'Enhanced keyboard focus',
  announcements: 'Screen-reader announcements',
  dailyReminders: 'Daily reminders',
};

// Saved at users/{uid}/settings/preferences, applied to the whole app.
export function usePreferences(uid) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!uid) {
      setPrefs(DEFAULT_PREFS);
      return undefined;
    }
    const ref = doc(db, 'users', uid, 'settings', 'preferences');
    return onSnapshot(
      ref,
      (snap) => setPrefs({ ...DEFAULT_PREFS, ...(snap.data() || {}) }),
      () => setStatus('error')
    );
  }, [uid]);

  useEffect(() => {
    const cl = document.documentElement.classList;
    cl.toggle('high-contrast', prefs.highContrast);
    cl.toggle('reduce-motion', prefs.reducedMotion);
    cl.toggle('strong-focus', prefs.enhancedFocus);
  }, [prefs]);

  const update = useCallback(
    async (key, value) => {
      setPrefs((p) => ({ ...p, [key]: value }));
      const speak = key === 'announcements' ? value : prefs.announcements;
      if (speak) setAnnouncement(`${LABELS[key]} turned ${value ? 'on' : 'off'}.`);
      setStatus('saving');
      try {
        await setDoc(doc(db, 'users', uid, 'settings', 'preferences'), { [key]: value }, { merge: true });
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    },
    [uid, prefs.announcements]
  );

  return { prefs, update, status, announcement };
}