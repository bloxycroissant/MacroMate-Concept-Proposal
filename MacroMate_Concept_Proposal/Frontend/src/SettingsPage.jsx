import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { db } from './firebase';

const TABS = ['My Details', 'Profile', 'Password', 'Team', 'Notification', 'Accessibility'];
const LEVELS = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'];
const EMPTY = { name: '', age: '', height: '', weight: '', activityLevel: 'Moderately Active', goal: '' };
const SWITCHES = [
  ['highContrast', 'High Contrast Mode', 'Increase the difference between text, controls, and background.'],
  ['reducedMotion', 'Reduce Motion', 'Minimize animations and smooth scrolling throughout the app.'],
  ['enhancedFocus', 'Enhanced Keyboard Focus', 'Show a stronger outline when you navigate with a keyboard.'],
  ['announcements', 'Screen-Reader Announcements', 'Speak a short confirmation when an accessibility setting changes.'],
];

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Enter your full name.';
  const age = Number(f.age);
  if (!Number.isInteger(age) || age < 1 || age > 120) e.age = 'Enter an age from 1 to 120.';
  const h = Number(f.height);
  if (!(h >= 50 && h <= 260)) e.height = 'Enter a height from 50 to 260 cm.';
  const w = Number(f.weight);
  if (!(w >= 20 && w <= 400)) e.weight = 'Enter a weight from 20 to 400 kg.';
  return e;
}

function Field({ id, label, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="error" id={`${id}-err`}>{error}</p>}
    </div>
  );
}

function Switch({ checked, onChange, label, desc, id }) {
  return (
    <div className="toggle-row">
      <div>
        <strong id={`${id}-l`}>{label}</strong>
        <p className="muted" id={`${id}-d`}>{desc}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        aria-describedby={`${id}-d`}
        className={`switch ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}

export default function SettingsPage({ user, prefs, updatePref, prefStatus }) {
  const [tab, setTab] = useState('My Details');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saveMsg, setSaveMsg] = useState('');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ text: '', bad: false });
  const profileRef = doc(db, 'users', user.uid, 'settings', 'profile');

  useEffect(() => {
    getDoc(profileRef)
      .then((snap) => {
        const d = snap.data() || {};
        setForm({
          ...EMPTY,
          ...d,
          name: d.name ?? user.displayName ?? '',
          age: d.age ?? '',
          height: d.height ?? '',
          weight: d.weight ?? '',
        });
      })
      .catch(() => setSaveMsg('Could not load your profile. Check your connection.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const initials = form.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
  const complete = Object.keys(validate(form)).length === 0 && form.goal.trim() !== '';

  async function saveProfile(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return setSaveMsg('Fix the highlighted fields, then save again.');
    setSaveMsg('Saving...');
    try {
      await setDoc(
        profileRef,
        {
          name: form.name.trim(),
          age: Number(form.age),
          height: Number(form.height),
          weight: Number(form.weight),
          activityLevel: form.activityLevel,
          goal: form.goal.trim(),
        },
        { merge: true }
      );
      setSaveMsg('Profile saved.');
    } catch {
      setSaveMsg('Could not save. Check your connection and try again.');
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    const bad = (text) => setPwMsg({ text, bad: true });
    if (pw.next.length < 6) return bad('Use a new password with at least 6 characters.');
    if (pw.next !== pw.confirm) return bad('The new passwords do not match.');
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, pw.current));
      await updatePassword(user, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      setPwMsg({ text: 'Password updated.', bad: false });
    } catch (err) {
      bad(err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Your current password is incorrect.'
        : 'Could not update the password. Try again.');
    }
  }

  const statusText = { saving: 'Saving...', saved: 'Setting saved.', error: 'Could not save. Check your connection.' }[prefStatus] || '';

  return (
    <div className="page">
      <p className="muted">Manage your personal wellness details</p>
      <h1>Settings</h1>

      <div className="settings-grid">
        <nav className="card settings-nav" aria-label="Settings sections">
          {TABS.map((t) => (
            <button key={t} className={`nav-item ${tab === t ? 'active' : ''}`} aria-current={tab === t ? 'page' : undefined} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>

        <section className="card settings-body">
          {tab === 'My Details' && (
            <form onSubmit={saveProfile} noValidate>
              <h2>Personal information</h2>
              <p className="muted">Used to personalize your nutrition and wellness targets.</p>
              <Field id="name" label="Full name" error={errors.name}>
                <input id="name" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} />
              </Field>
              <Field id="email" label="Email address">
                <input id="email" value={user.email} readOnly />
              </Field>
              <div className="row2">
                <Field id="age" label="Age" error={errors.age}>
                  <input id="age" inputMode="numeric" value={form.age} onChange={set('age')} aria-invalid={!!errors.age} />
                </Field>
                <Field id="height" label="Height (cm)" error={errors.height}>
                  <input id="height" inputMode="decimal" value={form.height} onChange={set('height')} aria-invalid={!!errors.height} />
                </Field>
              </div>
              <div className="row2">
                <Field id="weight" label="Weight (kg)" error={errors.weight}>
                  <input id="weight" inputMode="decimal" value={form.weight} onChange={set('weight')} aria-invalid={!!errors.weight} />
                </Field>
                <Field id="level" label="Activity level">
                  <select id="level" value={form.activityLevel} onChange={set('activityLevel')}>
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </Field>
              </div>
              <Field id="goal" label="Primary wellness goal">
                <input id="goal" value={form.goal} onChange={set('goal')} placeholder="Maintain a balanced lifestyle" />
              </Field>
              <button className="btn" type="submit">Save changes</button>
              <span className="status" role="status">{saveMsg}</span>
            </form>
          )}

          {tab === 'Profile' && (
            <div className="profile-summary">
              <div className="avatar" aria-hidden="true">{initials}</div>
              <h2>{form.name || 'Your name'}</h2>
              <p className="muted">{user.email}</p>
              <span className={`pill ${complete ? '' : 'warn'}`}>{complete ? 'Profile complete' : 'Profile incomplete'}</span>
              <h3>Your wellness goal</h3>
              <p>{form.goal || 'Add a goal under My Details.'}</p>
            </div>
          )}

          {tab === 'Password' && (
            <form onSubmit={changePassword} noValidate>
              <h2>Change password</h2>
              <Field id="pw-cur" label="Current password">
                <input id="pw-cur" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              </Field>
              <Field id="pw-new" label="New password">
                <input id="pw-new" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              </Field>
              <Field id="pw-conf" label="Confirm new password">
                <input id="pw-conf" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              </Field>
              <button className="btn" type="submit">Update password</button>
              <span className={pwMsg.bad ? 'error status' : 'status'} role="status">{pwMsg.text}</span>
            </form>
          )}

          {tab === 'Team' && (
            <div>
              <h2>Team</h2>
              <p className="muted">No team yet. Sharing progress with friends or a coach will appear here.</p>
            </div>
          )}

          {tab === 'Notification' && (
            <div>
              <h2>Notifications</h2>
              <Switch
                id="sw-remind"
                label="Daily reminders"
                desc="Receive gentle prompts to log meals and wellness."
                checked={prefs.dailyReminders}
                onChange={(v) => updatePref('dailyReminders', v)}
              />
              <span className="status" role="status">{statusText}</span>
            </div>
          )}

          {tab === 'Accessibility' && (
            <div>
              <h2>Accessibility</h2>
              {SWITCHES.map(([key, label, desc]) => (
                <Switch key={key} id={`sw-${key}`} label={label} desc={desc} checked={prefs[key]} onChange={(v) => updatePref(key, v)} />
              ))}
              <span className="status" role="status">{statusText}</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}