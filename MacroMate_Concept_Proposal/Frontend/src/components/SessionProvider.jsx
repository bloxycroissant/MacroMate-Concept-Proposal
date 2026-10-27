import { useEffect, useState } from 'react';
import { useAuth } from '../supabase/authContext';
import { cloudEnabled, configurationError, supabase } from '../supabase/client';

export default function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(cloudEnabled && !!supabase);
  const [recovery, setRecovery] = useState(false);
  const [error, setError] = useState(configurationError);
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!alive) return;
      setSession(nextSession); setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') setRecovery(false);
    });
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return;
      if (sessionError) setError('Your session could not be restored. Reload and sign in again.');
      else setSession(data.session);
      setLoading(false);
    }).catch(() => { if (alive) { setError('Could not connect to your account. Reload to try again.'); setLoading(false); } });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);
  if (loading) return <main className="account-page"><p role="status">Opening your account…</p></main>;
  if (error) return <main className="account-page"><p role="alert">{error}</p><button onClick={() => window.location.reload()}>Reload</button></main>;
  return <AuthContext.Provider value={{ user: session?.user || null, loading, recovery, finishRecovery: () => setRecovery(false) }}>
    {children(session?.user.id || 'guest')}
  </AuthContext.Provider>;
}
