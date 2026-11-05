import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const ERRORS = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
  'auth/weak-password': 'Use a password with at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': 'Check your internet connection and try again.',
};

export default function LoginPage() {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Use a password with at least 6 characters.');
    if (signup && password !== confirm) return setError('The passwords do not match.');
    setBusy(true);
    try {
      if (signup) await createUserWithEmailAndPassword(auth, email.trim(), password);
      else await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(ERRORS[err.code] || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-wrap">
      <form className="card login-card" onSubmit={submit} noValidate>
        <h1 className="brand">MacroMate</h1>
        <h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
        <p className="muted">
          {signup ? 'Start tracking meals, mood, and goals.' : 'Sign in to see your wellness dashboard.'}
        </p>

        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete={signup ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {signup && (
          <>
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </>
        )}

        {error && <p className="error" role="alert">{error}</p>}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Please wait...' : signup ? 'Create account' : 'Sign in'}
        </button>
        <button
          className="link-btn"
          type="button"
          onClick={() => { setMode(signup ? 'signin' : 'signup'); setError(''); }}
        >
          {signup ? 'I already have an account' : 'Create a new account'}
        </button>
      </form>
    </main>
  );
}