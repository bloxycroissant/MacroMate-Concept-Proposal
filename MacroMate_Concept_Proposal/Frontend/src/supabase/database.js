import { supabase } from './client.js';

export async function requireUserId() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Sign in to access your records.');
  return data.user.id;
}
export function unwrap({ data, error }) {
  if (error) throw new Error(error.message || 'The database request failed.');
  return data;
}
export async function allRows(queryFactory, signal) {
  const rows = [];
  for (let start = 0; ; start += 1000) {
    let query = queryFactory().range(start, start + 999);
    if (signal) query = query.abortSignal(signal);
    const page = unwrap(await query);
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}
export const foodColumns = 'id,meal,foodName:food_name,calories,protein,carbs,fat,entryDate:entry_date';
export const workoutColumns = 'id,workoutType:workout_type,distanceKm:distance_km,workoutDate:workout_date';
export const dayFromRow = (row) => ({ mood: row.mood, energyLevel: row.energy_level, sleepMinutes: row.sleep_minutes, waterGlasses: row.water_glasses, completedGoals: row.completed_goals });
export const profileFromRow = (row) => row ? ({ fullName: row.full_name, age: row.age, heightCm: row.height_cm, weightKg: row.weight_kg, activityLevel: row.activity_level, wellnessGoal: row.wellness_goal, pfpUrl: row.avatar_data_url }) : {};
export const preferencesFromRow = (row) => row ? ({ highContrast: row.high_contrast, reduceMotion: row.reduce_motion, enhancedFocus: row.enhanced_focus, announcements: row.announcements }) : {};
