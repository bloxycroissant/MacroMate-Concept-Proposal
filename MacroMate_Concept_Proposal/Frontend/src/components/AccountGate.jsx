import { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, cloudEnabled, configurationError } from '../firebase/client';

export default function AccountGate({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!cloudEnabled);
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (account) => { setUser(account); setReady(true); });
  }, []);
  if (!cloudEnabled) return children('local');
  if (configurationError) return <main className="account-page"><p role="alert">{configurationError}</p></main>;
  if (!ready) return <main className="account-page"><p role="status">Opening your account…</p></main>;
  if (user) return children(user.uid);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const action = register ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
      await action(auth, form.get('email').trim(), form.get('password'));
    } catch (err) {
      setError(err.code === 'auth/operation-not-allowed' ? 'Email/password sign-in needs to be enabled in Firebase Console.'
        : err.code === 'auth/network-request-failed' ? 'Could not connect. Check your internet connection and try again.'
          : err.code === 'auth/weak-password' ? 'Choose a password with at least 8 characters.'
            : 'Could not sign in or create the account. Check your details and try again.');
    } finally { setBusy(false); }
  }
  return <main className="account-page"><form className="card account-card" onSubmit={submit}>
    <h1>MacroMate</h1><h2>{register ? 'Create your account' : 'Welcome back'}</h2>
    <label>Email<input name="email" type="email" autoComplete="email" required disabled={busy} className="grey-input" /></label>
    <label>Password<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 8 : 1} maxLength="128" disabled={busy} className="grey-input" /></label>
    {error && <p role="alert" className="journal-error">{error}</p>}
    <button className="primary-green-btn" disabled={busy}>{busy ? 'Please wait…' : register ? 'Sign up' : 'Log in'}</button>
    <button type="button" className="entry-delete-btn" disabled={busy} onClick={() => { setRegister(!register); setError(''); }}>
      {register ? 'Already have an account? Log in' : 'New to MacroMate? Sign up'}
    </button>
  </form></main>;
}
