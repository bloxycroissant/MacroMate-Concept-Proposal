import { useState } from 'react';

export default function ProfilePage({ profile, onSave, busy }) {
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault(); setMessage(''); setSaving(true);
    const form = new FormData(event.currentTarget);
    const data = { fullName: form.get('fullName').trim(), age: Number(form.get('age')), heightCm: Number(form.get('heightCm')),
      weightKg: Number(form.get('weightKg')), activityLevel: form.get('activityLevel'), wellnessGoal: form.get('wellnessGoal').trim() };
    if (!data.fullName || !data.wellnessGoal) { setMessage('Enter your name and wellness goal.'); setSaving(false); return; }
    try { await onSave(data); setMessage('Profile updated for this session. Changes reset on refresh.'); }
    catch { setMessage('Profile was not saved. Please try again.'); }
    finally { setSaving(false); }
  }
  return <div className="page-view"><h1 className="page-title">My Profile</h1>
    <form className="card profile-form-card" onSubmit={submit}><h2>Personal information</h2>
      <fieldset disabled={busy || saving} className="food-form-fields">
        <label>Full name<input name="fullName" defaultValue={profile.fullName || ''} required maxLength="120" className="grey-input" /></label>
        <div className="form-row-2">
          <label>Age<input name="age" type="number" required min="1" max="120" step="1" defaultValue={profile.age || ''} className="grey-input" /></label>
          <label>Height (cm)<input name="heightCm" type="number" required min="30" max="300" step="0.1" defaultValue={profile.heightCm || ''} className="grey-input" /></label>
        </div>
        <label>Weight (kg)<input name="weightKg" type="number" required min="1" max="700" step="0.1" defaultValue={profile.weightKg || ''} className="grey-input" /></label>
        <label>Activity level<select name="activityLevel" aria-label="Activity level" defaultValue={profile.activityLevel || 'Moderately Active'} className="grey-input">
          <option>Sedentary</option><option>Lightly Active</option><option>Moderately Active</option><option>Very Active</option>
        </select></label>
        <label>Wellness goal<input name="wellnessGoal" defaultValue={profile.wellnessGoal || ''} required maxLength="300" className="grey-input" /></label>
        <button className="primary-green-btn">{saving ? 'Saving…' : 'Save profile'}</button>
      </fieldset><p role="status">{message}</p>
    </form></div>;
}
