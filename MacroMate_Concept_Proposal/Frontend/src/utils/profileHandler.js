import { readProfile, writeProfile } from "./profileStorage";

export const ACTIVITY_LEVELS = [
  "Sedentary",
  "Lightly Active",
  "Moderately Active",
  "Very Active",
];

export const DEFAULT_PROFILE = {
  fullName: "",
  email: "",
  age: "",
  heightCm: "",
  weightKg: "",
  activityLevel: "Moderately Active",
  wellnessGoal: "Maintain a balanced lifestyle",
  calorieGoal: 2200,
  proteinGoal: 150,
  carbsGoal: 270,
  fatGoal: 65,
  dietaryPreference: "",
  allergies: "",
  remindersEnabled: true,
};

export function validateProfile(p) {
  const errors = {};
  if (!p.fullName.trim()) errors.fullName = "Full name is required.";
  if (p.age !== "" && (p.age < 1 || p.age > 120)) errors.age = "Enter a valid age.";
  if (p.heightCm !== "" && p.heightCm <= 0) errors.heightCm = "Enter a valid height.";
  if (p.weightKg !== "" && p.weightKg <= 0) errors.weightKg = "Enter a valid weight.";
  return errors;
}

export async function loadProfile() {
  const saved = await readProfile();
  return { ...DEFAULT_PROFILE, ...(saved || {}) };
}

export async function saveProfile(profile) {
  const errors = validateProfile(profile);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  await writeProfile(profile);
  return { ok: true, profile };
}
export const DEFAULT_EXTRAS = {
  calorieGoal: 2200,
  proteinGoal: 150,
  carbsGoal: 270,
  fatGoal: 65,
  dietaryPreference: '',
  allergies: '',
  remindersEnabled: true,
};

export async function loadExtras() {
  const saved = await readProfile();
  return { ...DEFAULT_EXTRAS, ...(saved || {}) };
}

export async function saveExtras(extras) {
  await writeProfile(extras);
  return extras;
}