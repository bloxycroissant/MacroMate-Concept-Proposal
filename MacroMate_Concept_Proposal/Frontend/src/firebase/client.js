import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const env = import.meta.env;
export const cloudEnabled = env.VITE_FIREBASE_ENABLED === 'true';
export let auth = null;
export let firestore = null;
export let configurationError = '';

if (cloudEnabled) {
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  if (Object.values(config).some((value) => !value)) {
    configurationError = 'Firebase configuration is incomplete. Follow the Firebase setup guide.';
  } else {
    const app = initializeApp(config);
    auth = getAuth(app);
    firestore = getFirestore(app);
    if (env.DEV && env.VITE_FIREBASE_EMULATORS === 'true') {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099');
      connectFirestoreEmulator(firestore, '127.0.0.1', 8085);
    }
  }
}

export async function authenticatedOptions(options) {
  if (!cloudEnabled) return options;
  if (!auth?.currentUser) throw new Error('Sign in before accessing your journal.');
  return { ...options, headers: { ...options.headers, Authorization: `Bearer ${await auth.currentUser.getIdToken()}` } };
}
