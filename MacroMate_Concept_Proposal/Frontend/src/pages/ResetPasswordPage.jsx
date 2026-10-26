import { useState } from 'react';
import { supabase } from '../supabase/client';

export default function ResetPasswordPage({ onDone }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('password') !== form.get('confirm')) { setMessage('The passwords do not match.'); return; }
    setBusy(true); setMessage('');
    try {
      const { error } = await supabase.auth.updateUser({ password: form.get('password') });
      if (error) throw error;
      setSaved(true); setMessage('Password updated.');
    } catch (error) { setMessage(error.message || 'Could not update your password.'); }
    finally { setBusy(false); }
  }
  return <main className="account-page"><form className="card account-card" onSubmit={submit}>
    <h1>Choose a new password</h1>
    {!saved && <><label>New password<input name="password" type="password" autoComplete="new-password" required minLength="8" maxLength="128" disabled={busy} /></label>
      <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" required minLength="8" maxLength="128" disabled={busy} /></label>
      <button className="primary-green-btn" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></>}
    <p role="status">{message}</p>
    {saved && <button type="button" className="primary-green-btn" onClick={onDone}>Continue to dashboard</button>}
  </form></main>;
}
