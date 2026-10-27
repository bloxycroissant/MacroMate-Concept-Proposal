import { cloudEnabled, supabase } from '../supabase/client';
import { allRows, foodColumns, requireUserId, unwrap } from '../supabase/database';
import * as local from './localFoodEntries';

const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}/api/food-entries${path}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Food journal request failed (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

export async function listFoodEntries(signal) {
  if (!cloudEnabled) return local.listFoodEntries(signal);
  const uid = await requireUserId();
  return allRows(() => supabase.from('food_entries').select(foodColumns).eq('user_id', uid).order('entry_date').order('id'), signal);
}

export async function addFoodEntry(entry) {
  if (!cloudEnabled) return local.addFoodEntry(entry);
  const uid = await requireUserId();
  return unwrap(await supabase.from('food_entries').insert({ user_id: uid, meal: entry.meal,
    food_name: entry.foodName, calories: entry.calories, protein: entry.protein, carbs: entry.carbs,
    fat: entry.fat, entry_date: entry.entryDate }).select(foodColumns).single());
}

export async function deleteFoodEntry(id) {
  if (!cloudEnabled) return local.deleteFoodEntry(id);
  const uid = await requireUserId();
  const rows = unwrap(await supabase.from('food_entries').delete().eq('id', id).eq('user_id', uid).select('id'));
  if (!rows.length) throw new Error('Food entry not found.');
}