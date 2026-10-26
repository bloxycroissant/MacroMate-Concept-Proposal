import { cloudEnabled, supabase } from '../supabase/client';
import { allRows, requireUserId, unwrap, workoutColumns } from '../supabase/database';
import * as local from './localWorkouts';

export async function listWorkouts(signal) {
  if (!cloudEnabled) return local.listWorkouts(signal);
  const uid = await requireUserId();
  return allRows(() => supabase.from('workouts').select(workoutColumns).eq('user_id', uid).order('workout_date', { ascending: false }).order('id', { ascending: false }), signal);
}
export async function addWorkout(workout) {
  if (!cloudEnabled) return local.addWorkout(workout);
  const uid = await requireUserId();
  return unwrap(await supabase.from('workouts').insert({ user_id: uid, workout_type: workout.workoutType,
    distance_km: workout.distanceKm, workout_date: workout.workoutDate }).select(workoutColumns).single());
}
export async function deleteWorkout(id) {
  if (!cloudEnabled) return local.deleteWorkout(id);
  const uid = await requireUserId();
  const rows = unwrap(await supabase.from('workouts').delete().eq('id', id).eq('user_id', uid).select('id'));
  if (!rows.length) throw new Error('Workout not found.');
}
