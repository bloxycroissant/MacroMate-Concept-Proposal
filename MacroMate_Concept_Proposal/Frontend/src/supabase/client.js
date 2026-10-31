import { createClient } from '@supabase/supabase-js';

const env = import.meta.env || {};
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

export let cloudEnabled = env.VITE_STORAGE_MODE !== 'local' && Boolean(url && key);
export let supabase = null;
export let configurationError = '';

if (cloudEnabled) {
  try {
    if (!url || !key) throw new Error('Add the Supabase project URL and public browser key using the setup guide.');
    if (key.startsWith('sb_secret_')) throw new Error('Use a publishable key, never a secret key, in the browser.');
    if (key.split('.').length === 3) {
      const claims = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (claims.role !== 'anon') throw new Error('Use an anon or publishable key, never a service-role key.');
    }
    supabase = createClient(url, key);
  } catch (error) { 
    configurationError = error.message || 'The Supabase connection is not configured.'; 
    cloudEnabled = false;
  }
}