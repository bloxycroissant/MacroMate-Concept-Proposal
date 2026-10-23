import { after, before, beforeEach, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
let environment;
before(async () => {
  environment = await initializeTestEnvironment({ projectId: 'demo-macromate', firestore: {
    host: '127.0.0.1', port: 8085, rules: readFileSync(new URL('../../../firestore.rules', import.meta.url), 'utf8'),
  } });
});
beforeEach(() => environment.clearFirestore());
after(() => environment?.cleanup());
const profile = { fullName: 'Test Person', age: 24, heightCm: 170, weightKg: 65, activityLevel: 'Moderately Active', wellnessGoal: 'Track my habits' };
const db = (uid) => uid ? environment.authenticatedContext(uid).firestore() : environment.unauthenticatedContext().firestore();
test('owner can save and retrieve all previously missing module records', async () => {
  const data = db('alice');
  await assertSucceeds(setDoc(doc(data, 'users/alice/days/2026-10-23'), { mood: 'Great', energyLevel: 4, sleepMinutes: 450, waterGlasses: 7, completedGoals: ['breakfast', 'reflection'] }));
  await assertSucceeds(setDoc(doc(data, 'users/alice/settings/profile'), profile));
  await assertSucceeds(setDoc(doc(data, 'users/alice/settings/preferences'), { highContrast: true, reduceMotion: true, enhancedFocus: true, announcements: false }));
  await assertSucceeds(getDoc(doc(data, 'users/alice/days/2026-10-23')));
  await assertSucceeds(getDoc(doc(data, 'users/alice/settings/profile')));
  await assertSucceeds(getDoc(doc(data, 'users/alice/settings/preferences')));
});
test('guests and other accounts cannot read or write another user records', async () => {
  for (const user of [null, 'bob']) {
    for (const [path, value] of [['days/2026-10-23', { mood: 'Good' }], ['settings/profile', profile], ['settings/preferences', { highContrast: true }]]) {
      await assertFails(getDoc(doc(db(user), `users/alice/${path}`)));
      await assertFails(setDoc(doc(db(user), `users/alice/${path}`), value));
    }
  }
});
test('invalid health values, unknown goals and extra fields are rejected', async () => {
  for (const data of [{ mood: 'Invalid' }, { energyLevel: 6 }, { waterGlasses: -1 }, { waterGlasses: 9 }, { waterGlasses: 1.5 }, { sleepMinutes: 1441 }, { completedGoals: ['admin'] }, { admin: true }]) {
    await assertFails(setDoc(doc(db('alice'), 'users/alice/days/2026-10-23'), data));
  }
  await assertFails(setDoc(doc(db('alice'), 'users/alice/days/2026-99-99'), { mood: 'Good' }));
});
test('invalid profile and accessibility values are rejected', async () => {
  await assertFails(setDoc(doc(db('alice'), 'users/alice/settings/profile'), { ...profile, age: 0 }));
  await assertFails(setDoc(doc(db('alice'), 'users/alice/settings/profile'), { ...profile, admin: true }));
  await assertFails(setDoc(doc(db('alice'), 'users/alice/settings/preferences'), { highContrast: 'yes' }));
});
test('partial day updates preserve independent fields', async () => {
  const ref = doc(db('alice'), 'users/alice/days/2026-10-23');
  await assertSucceeds(setDoc(ref, { mood: 'Good' }));
  await assertSucceeds(setDoc(ref, { waterGlasses: 3 }, { merge: true }));
  const snapshot = await getDoc(ref);
  if (snapshot.data().mood !== 'Good' || snapshot.data().waterGlasses !== 3) throw new Error('Daily fields were overwritten.');
});
