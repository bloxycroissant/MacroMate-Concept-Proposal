import { useState } from 'react';

export const defaultDay = { mood: 'Okay', energyLevel: 3, sleepMinutes: 0, waterGlasses: 0, completedGoals: [] };
export const defaultPreferences = { highContrast: false, reduceMotion: false, enhancedFocus: false, announcements: true };

export default function useWellness(date) {
  const [days, setDays] = useState({});
  const [profile, setProfile] = useState({});
  const [preferences, setPreferences] = useState(defaultPreferences);
  function updateDay(patch) {
    setDays((current) => ({ ...current, [date]: { ...current[date], ...patch } }));
  }
  async function saveProfile(data) {
    setProfile(data);
  }
  function updatePreference(key, value) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }
  return { days, day: { ...defaultDay, ...days[date] }, profile, preferences, updateDay, saveProfile, updatePreference };
}
