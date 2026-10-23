# MacroMate Firebase setup

Firebase project: **MacroMate** (`macromate-14dd2`). [Open the console](https://console.firebase.google.com/project/macromate-14dd2/overview).

## What uses which database?

| Feature | Storage in Firebase mode |
| --- | --- |
| Mood, water, sleep, energy, dated goal completion | Firestore: `users/{uid}/days/{YYYY-MM-DD}` |
| Name, age, height, weight, activity level, wellness goal | Firestore: `users/{uid}/settings/profile` |
| High contrast, reduced motion, focus, announcements | Firestore: `users/{uid}/settings/preferences` |
| Email and password-based account access | Firebase Authentication; passwords are never stored in app documents |
| Meals and workouts | Existing H2 database, separated by verified Firebase user ID |

The dashboard and history views calculate their summaries from these records. Health controls and goal checkboxes save automatically; profile details have a Save button. The status strip shows pending saves or errors. Accessibility preferences also apply to the actual app appearance and behavior.

Old local H2 records have no account owner. They remain available in local demo mode and are not automatically assigned to the first account that signs in. No existing data is uploaded to Firebase automatically. Food/workout data still lives on the backend computer; moving those tables to cloud storage is a separate migration.

## Activate the cloud services

1. In Firebase Console, open **Authentication → Sign-in method** and enable **Email/Password** (password sign-in, not email-link sign-in).
2. Use the existing Standard Firestore database in **asia-southeast1 (Singapore)**. Deploy the reviewed `firestore.rules` file. These rules allow a signed-in user to access only their own supported documents, validate values, and deny all other access. Never use public test-mode rules.
3. From `MacroMate_Concept_Proposal/Frontend`, install dependencies with `npm.cmd ci`.
4. Copy `.env.firebase.example` to `.env.local`. Copy the web app's public API key from **Project settings → Your apps → MacroMate Web** into `VITE_FIREBASE_API_KEY`. The other project identifiers are already filled in.
5. Open the repository root in VS Code and run **MacroMate: start Firebase app**. This starts the backend with its `firebase` profile and the frontend on port 5173. Restart an already-running frontend after changing `.env.local`.
6. Open http://127.0.0.1:5173 and create your own account. Enter the password yourself; no teammate needs your password.

The source code alone does not enable an authentication provider or deploy database permissions. Those Console steps must be completed before real cloud saving works.

### Alternative terminals

Backend, from `MacroMate_Concept_Proposal/Backend`:

```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=firebase
```

Frontend, from `MacroMate_Concept_Proposal/Frontend`:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

The backend verifies the Firebase token signature, issuer, expiry, audience, and subject using Google's public signing keys. It needs internet access for key retrieval, but does not need a service-account private key. Keep the project ID synchronized if adapting this to another Firebase project (`macromate.firebase.project-id` on the backend).

To deploy rules using the official CLI from the repository root after signing into the intended Google account:

```powershell
.\MacroMate_Concept_Proposal\Frontend\node_modules\.bin\firebase.cmd deploy --only firestore:rules --project macromate-14dd2
```

## Local demo mode

Set `VITE_FIREBASE_ENABLED=false` and use the original **MacroMate: start app** task. Signed-in data is never exposed through this local mode. Food and workout records without a user ID remain available; wellness changes in local demo mode are temporary. The app labels this explicitly.

## Verify and test

- Save mood, water, sleep, energy, and checklist completion for one date; refresh and revisit that date.
- Save profile details and accessibility switches; refresh and confirm their values and visible effects remain.
- Sign out, create another account, and confirm it starts with separate records.
- From the backend run `.\mvnw.cmd test` for API, persistence, and account-isolation tests.
- From the frontend run `npm.cmd run lint`, `npm.cmd run build`, and `npm.cmd run test:rules`.

Rules tests use the local Firestore emulator with the isolated `demo-macromate` project, not the real cloud database. Use JDK 21+ for the emulator. For interactive emulator testing, start Auth and Firestore with the root `firebase.json` config and set `VITE_FIREBASE_EMULATORS=true` plus `VITE_FIREBASE_PROJECT_ID=demo-macromate`. This switch is accepted only by a Vite development build.

The backend deliberately does not accept unsigned emulator tokens. Account-isolation tests mock verified principals; browser checks of the cloud-only modules can use emulators independently of the Java API. A real app session with food/workouts requires the real configured Firebase project and the backend `firebase` profile.

## Limits

These changes do not deploy a public website, invite teammates, upgrade billing, or migrate existing H2 records. Roles for project collaborators are managed separately in Firebase Console. Package audit results for development-only Firebase CLI dependencies should be reviewed before deploying developer tooling to shared environments.
