import { useEffect, useRef, useState } from 'react';
import { cloudEnabled, supabase } from '../supabase/client';
import { useAuth } from '../supabase/authContext';
import { allRows, dayFromRow, preferencesFromRow, profileFromRow, unwrap } from '../supabase/database';

export const defaultDay = { mood: 'Okay', energyLevel: 3, sleepMinutes: 0, waterGlasses: 0, completedGoals: [] };
export const defaultPreferences = { highContrast: false, reduceMotion: false, enhancedFocus: false, announcements: true };

export default function useWellness(date) {
  const { user } = useAuth();
  const [days, setDays] = useState({});
  const [profile, setProfile] = useState({ fullName: user?.user_metadata?.full_name || '' });
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [ready, setReady] = useState(!cloudEnabled);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const queue = useRef(Promise.resolve());
  const uid = user?.id;
  useEffect(() => {
    if (!cloudEnabled || !uid) return;
    let alive = true;
    Promise.all([
      allRows(() => supabase.from('daily_checkins').select('*').eq('user_id', uid).order('entry_date')),
      supabase.from('profiles').select('*').eq('user_id', uid).maybeSingle(),
      supabase.from('preferences').select('*').eq('user_id', uid).maybeSingle(),
    ]).then((results) => {
      if (!alive) return;
      const [dailyRows, profileResult, preferenceResult] = results;
      const profileRow = unwrap(profileResult);
      const preferenceRow = unwrap(preferenceResult);
      setDays(Object.fromEntries(dailyRows.map((row) => [row.entry_date, dayFromRow(row)])));
      if (profileRow) setProfile(profileFromRow(profileRow));
      setPreferences({ ...defaultPreferences, ...preferencesFromRow(preferenceRow) });
      setError(''); setReady(true);
    }).catch(() => { if (alive) setError('Could not load your saved records. Check the connection and try again.'); });
    return () => { alive = false; };
  }, [uid, reloadToken]);

  function enqueue(action) {
    if (!uid || !ready) return Promise.reject(new Error('Wait for your records to finish loading.'));
    setPending((count) => count + 1);
    const task = queue.current.then(async () => {
      setError('');
      try { return await action(); }
      catch (err) { setError('Your change was not saved. Check your connection and try again.'); throw err; }
      finally { setPending((count) => count - 1); }
    });
    queue.current = task.catch(() => {});
    return task;
  }
  function updateDay(patch) {
    if (!cloudEnabled) { setDays((current) => ({ ...current, [date]: { ...current[date], ...patch } })); return; }
    void enqueue(async () => {
      const row = unwrap(await supabase.rpc('save_checkin', { p_date: date, p_patch: patch }));
      setDays((current) => ({ ...current, [date]: dayFromRow(row) }));
    }).catch(() => {});
  }
  async function saveProfile(data) {
    if (!cloudEnabled) { setProfile(data); return; }
    return enqueue(async () => {
      const row = unwrap(await supabase.from('profiles').upsert({ user_id: uid, full_name: data.fullName,
        age: data.age, height_cm: data.heightCm, weight_kg: data.weightKg, activity_level: data.activityLevel,
        wellness_goal: data.wellnessGoal, avatar_data_url: data.pfpUrl || null }).select('*').single());
      setProfile(profileFromRow(row));
    });
  }
  function updatePreference(key, value) {
    if (!cloudEnabled) { setPreferences((current) => ({ ...current, [key]: value })); return; }
    void enqueue(async () => {
      const row = unwrap(await supabase.rpc('save_preference', { p_key: key, p_value: value }));
      setPreferences(preferencesFromRow(row));
    }).catch(() => {});
  }
  return { days, day: { ...defaultDay, ...days[date], mood: days[date]?.mood || defaultDay.mood }, profile, preferences, ready, pending, error,
    updateDay, updatePreference, saveProfile, reload: () => setReloadToken((value) => value + 1) };
}
