import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, cloudEnabled, firestore } from '../firebase/client';

export const defaultDay = { mood: 'Okay', energyLevel: 3, sleepMinutes: 0, waterGlasses: 0, completedGoals: [] };
export const defaultPreferences = { highContrast: false, reduceMotion: false, enhancedFocus: false, announcements: true };

export default function useWellness(date) {
  const [days, setDays] = useState({});
  const [profile, setProfile] = useState({});
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [ready, setReady] = useState(!cloudEnabled);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(0);
  const uid = auth?.currentUser?.uid;
  useEffect(() => {
    if (!cloudEnabled || !uid) return;
    const loaded = new Set();
    const mark = (part) => { loaded.add(part); if (loaded.size === 3) setReady(true); };
    const failed = () => setError('Cloud records could not load. Check your connection and Firebase access configuration, then reload.');
    const stops = [
      onSnapshot(collection(firestore, 'users', uid, 'days'), (snapshot) => {
        setDays(Object.fromEntries(snapshot.docs.map((item) => [item.id, item.data()]))); mark('days');
      }, failed),
      onSnapshot(doc(firestore, 'users', uid, 'settings', 'profile'), (snapshot) => { setProfile(snapshot.data() || {}); mark('profile'); }, failed),
      onSnapshot(doc(firestore, 'users', uid, 'settings', 'preferences'), (snapshot) => { setPreferences({ ...defaultPreferences, ...snapshot.data() }); mark('preferences'); }, failed),
    ];
    return () => stops.forEach((stop) => stop());
  }, [uid]);

  async function write(path, data) {
    if (!cloudEnabled) return;
    if (!uid || !ready) throw new Error('Cloud records are still loading.');
    setPending((count) => count + 1); setError('');
    try { await setDoc(doc(firestore, 'users', uid, ...path), data, { merge: true }); }
    catch (err) { setError('Your change was not saved to Firebase. Check your connection and try again.'); throw err; }
    finally { setPending((count) => count - 1); }
  }
  function updateDay(patch) {
    if (!cloudEnabled) { setDays((current) => ({ ...current, [date]: { ...current[date], ...patch } })); return; }
    void write(['days', date], patch).catch(() => {});
  }
  async function saveProfile(data) {
    await write(['settings', 'profile'], data);
    if (!cloudEnabled) setProfile(data);
  }
  function updatePreference(key, value) {
    if (!cloudEnabled) { setPreferences((current) => ({ ...current, [key]: value })); return; }
    void write(['settings', 'preferences'], { [key]: value }).catch(() => {});
  }
  return { days, day: { ...defaultDay, ...days[date] }, profile, preferences, ready, error, pending, updateDay, saveProfile, updatePreference };
}
