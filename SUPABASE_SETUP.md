# MacroMate Supabase setup

Project: **MacroMate** (`mprawxjvsnbbzubhlhml`), Free plan, Singapore (`ap-southeast-1`).

- [Project dashboard](https://supabase.com/dashboard/project/mprawxjvsnbbzubhlhml)
- Project URL: `https://mprawxjvsnbbzubhlhml.supabase.co`

## Architecture

React uses the official Supabase JavaScript client. Supabase Auth handles email/password signup, login, email confirmation, session restoration, logout and password recovery. PostgreSQL row-level security (RLS) restricts every supported record to its authenticated owner. The browser uses only a publishable key; it never receives a database password, service-role key or secret API key. Passwords are not stored in profile documents or shared application state.

| Module | Table |
| --- | --- |
| Food journals, macros, calories, recent meals and weekly calorie summaries | `food_entries` |
| Workout logs, weekly distance and best workout day | `workouts` |
| Dated mood, energy, sleep, water and goal checklist | `daily_checkins` |
| Profile name, age, measurements, activity level, wellness goal and photo | `profiles` |
| High contrast, reduced motion, keyboard focus and announcements | `preferences` |

Charts calculate from the signed-in user's records. Check-ins and preferences save automatically; profiles use Save Profile. A status strip and error notices show saves and failures. Signing out unmounts the account's application state. Photos are limited to PNG/JPEG/WebP up to 1 MB and stored as a data URL in the private profile row. This keeps the student app's photo setup simple; large media libraries should use a private Storage bucket instead.

## One-time project setup

1. Open the SQL Editor for the project and execute `supabase/migrations/202610260001_macromate.sql` once. It creates five tables, indexes, validated atomic save functions and owner-only policies in a transaction. It revokes anonymous access and explicitly grants the required operations to authenticated users. Do not disable RLS or use a secret key in the browser.
2. Under **Authentication → URL Configuration**, set the Site URL to the app's intended address. For this local setup use `http://127.0.0.1:5173`, and add `http://127.0.0.1:5173/**` and `http://localhost:5173/**` as allowed redirect URLs for confirmation and password recovery. Add the real HTTPS site when deploying.
3. Keep Email/Password authentication and email confirmation enabled. Verify the project's email delivery settings and limits before inviting users. This code handles both confirmation-required signup and projects that immediately return a session.
4. Do not automatically deploy SQL changes through a GitHub connection until your team has chosen a deployment workflow. The application connection uses the project URL and public key; linking a repository in the Supabase dashboard is optional.

The migration changes project access and must be reviewed before it is applied to a live project. Check the PR's status for whether live activation and verification have been completed.

## Run the app

1. In `MacroMate_Concept_Proposal/Frontend`, run `npm.cmd ci`.
2. Copy `.env.example` to `.env.local` and enter the project's URL and **publishable key** from the dashboard's connection details. Keep `VITE_STORAGE_MODE=supabase`. The local file is ignored by Git. Restart Vite after changing it.
3. In VS Code choose **Terminal → Run Task → MacroMate: start Supabase app**, or run:

   ```powershell
   npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
   ```

4. Open `http://127.0.0.1:5173`. Sign up with your own email/password, confirm the email if requested, then log in. No Java backend is needed in Supabase mode.

Never share a password here or commit it. A publishable/anon key is intended for browser use; the database's RLS rules enforce privacy.

## Verify

- Sign up and confirm an account, log in, refresh and verify the session restores.
- Log food and a workout, refresh and confirm the journal and charts retain both.
- Save a dated mood, sleep, energy, water and checklist; revisit that date after a refresh.
- Save a profile/photo and accessibility switches; refresh and verify values and effects.
- Log out and sign in as a second test account. It must not see the first account's records.
- Request a password recovery email and use its link to choose a new password yourself.
- Temporarily interrupt the connection; errors must remain visible rather than claiming a successful save.

From `Frontend`, run `npm.cmd run lint`, `npm.cmd run build`, and `npm.cmd run test:database`. Database tests execute the actual migration in an isolated PostgreSQL runtime, using test equivalents of Supabase's Auth roles and `auth.uid()`. They test owner access, blocked cross-account operations, anonymous denial, value constraints and atomic updates; they do not exercise the hosted Auth service.

## Existing H2 data and local mode

H2 files are retained and are not uploaded or assigned to an account automatically. Importing existing shared records requires a separate explicit migration and ownership decision. All new records in Supabase mode use Supabase, including meals and workouts.

For the original offline, single-user food/workout demo, set `VITE_STORAGE_MODE=local` and run the original **MacroMate: start app** task. That task starts Java/H2 and a local-mode frontend. Use **Open local demo** on the welcome page. Other module changes in this mode reset on refresh. It has no real account authentication and should remain on the loopback address. No fallback to H2 occurs when a cloud operation fails.

The Firebase project and any cloud data are not deleted by these source changes. This integration replaces Firebase code and does not deploy a public website, change billing or grant collaborator access.
