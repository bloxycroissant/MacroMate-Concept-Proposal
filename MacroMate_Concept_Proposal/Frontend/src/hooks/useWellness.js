import { useEffect, useRef, useState } from 'react';
import { cloudEnabled, supabase } from '../supabase/client';
import { useAuth } from '../supabase/authContext';
import { allRows, dayFromRow, preferencesFromRow, profileFromRow, unwrap } from '../supabase/database';

export const defaultDay = { mood: 'Okay', energyLevel: 3, sleepMinutes: 0, waterGlasses: 0, completedGoals: [] };
export const defaultPreferences = { highContrast: false, reduceMotion: false, enhancedFocus: false, announcements: true };

export default function useWellness(date) {
  const { user } = useAuth() || {};
  const [days, setDays] = useState({});
  const [profile, setProfile] = useState({ fullName: user?.user_metadata?.full_name || '' });
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [ready, setReady] = useState(!cloudEnabled);
  const [loadedUid, setLoadedUid] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const queue = useRef(Promise.resolve());
  const uid = user?.id;
  const fullName = user?.user_metadata?.full_name || '';
  const ready = !cloudEnabled || (!!uid && loadedUid === uid);
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
      setProfile(profileRow ? profileFromRow(profileRow) : { fullName });
      setPreferences({ ...defaultPreferences, ...preferencesFromRow(preferenceRow) });
      setError('');
      setLoadedUid(uid);
    }).catch(() => {
      if (alive) {
        setError('Could not load your saved records. Check the connection and try again.');
      }
    });
    return () => { alive = false; };
  }, [uid, reloadToken, fullName]);

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
  function updateDay(patch, targetDate = date) {
    if (!cloudEnabled) { setDays((current) => ({ ...current, [targetDate]: { ...current[targetDate], ...patch } })); return; }
    void enqueue(async () => {
      if (patch.mood === null) {
        const row = unwrap(await supabase.from('daily_checkins').update({ mood: null })
          .eq('user_id', uid).eq('entry_date', targetDate).select('*').maybeSingle());
        setDays((current) => {
          if (row) return { ...current, [targetDate]: dayFromRow(row) };
          const next = { ...current };
          delete next[targetDate];
          return next;
        });
        return;
      }
      const row = unwrap(await supabase.rpc('save_checkin', { p_date: targetDate, p_patch: patch }));
      setDays((current) => ({ ...current, [targetDate]: dayFromRow(row) }));
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
  const activeDays = cloudEnabled && loadedUid !== uid ? {} : days;
  const activeProfile = cloudEnabled && loadedUid !== uid ? { fullName } : profile;
  const activePreferences = cloudEnabled && loadedUid !== uid ? defaultPreferences : preferences;
  return { days: activeDays, day: { ...defaultDay, ...activeDays[date], mood: activeDays[date]?.mood || defaultDay.mood },
    profile: activeProfile, preferences: activePreferences, ready, pending, error,
    updateDay, updatePreference, saveProfile, reload: () => { setLoadedUid(null); setReloadToken((value) => value + 1); } };
}
