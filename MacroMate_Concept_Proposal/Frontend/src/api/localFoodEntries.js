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

export const listFoodEntries = (signal) => request('', { signal });
export const addFoodEntry = (entry) => request('', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(entry),
});
export const deleteFoodEntry = (id) => request(`/${id}`, { method: 'DELETE' });