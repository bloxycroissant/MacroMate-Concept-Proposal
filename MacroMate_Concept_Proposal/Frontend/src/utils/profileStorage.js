const KEY = "macromate_profile";

// Works right now using the browser's storage.
// Later, swap these two functions to use your Supabase client.
export async function readProfile() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function writeProfile(profile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
  return profile;
}