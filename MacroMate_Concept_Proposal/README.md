# MacroMate

The food journal and workout tracker connect React to Spring Boot and a file-based H2 database. Meals, dates, calories, macros, and walking, jogging, or running workouts (distance and date) are saved on disk. The food views, sidebar totals, recent food activity, weekly calorie chart, workout list, weekly distance chart, and best workout day use saved entries.

Daily mood, sleep, water, energy, checklist completion, profile details, and accessibility preferences use temporary React state and reset on refresh. Choose **Open local demo** on the welcome screen to enter without signup or login. The welcome, login and sign-up designs remain as prototypes; they do not create accounts, verify passwords or separate user data. Nutrition targets remain fixed demonstration values.
Supabase mode is the default. It saves food, workouts, daily mood, sleep, water, energy, checklist completion, profile details/photos and accessibility preferences in private PostgreSQL tables. Supabase Auth provides real signup/login, confirmation, logout and password recovery. See [Supabase setup](../SUPABASE_SETUP.md) for the primary startup and verification steps. Nutrition targets remain fixed demonstration values.

## Optional local H2 demo in VS Code

Install Node.js 22.12+ (or a supported newer release) and a JDK 17 or newer. Set `JAVA_HOME` to your JDK folder if Java is not configured. The included Maven wrapper downloads Maven on its first run.

1. Open the **repository root** in VS Code (containing `.vscode` and `MacroMate_Concept_Proposal`).
2. Install frontend dependencies in a terminal:

   ```powershell
   cd MacroMate_Concept_Proposal/Frontend
   npm.cmd ci
   ```

3. Choose **Terminal → Run Task → MacroMate: start app**.
4. Open **http://127.0.0.1:5173**. The first backend start creates the database automatically.

Alternatively, use two terminals:

```powershell
cd MacroMate_Concept_Proposal/Backend
.\mvnw.cmd spring-boot:run
```

```powershell
cd MacroMate_Concept_Proposal/Frontend
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

On macOS/Linux use `./mvnw` and `npm` instead.

## Database

Started from `Backend`, H2 creates `Backend/data/macromate.mv.db`. Food and workout entries survive refreshing the browser and restarting the backend. This file is ignored by Git; each developer has their own local database. Keep starting the backend from the same folder so it opens the same file.

Choose **Food Journal → Daily Food Journal**, select a date, and use **Log Food**. Enter calories and all three macros (use zero where appropriate). Entries appear in both journal views. Delete removes an entry from the database. A failed save keeps the form open and displays an error.

This is a local single-user demo with no account authentication. The backend binds to `127.0.0.1`; use it on your own computer. The food/workout API reads all records in the configured local database. Existing H2 files are retained; older extra account-owner columns are no longer used. Cloud records are not imported into H2. Shared hosting requires adding authentication and an explicit deployment and CORS configuration.
With `VITE_STORAGE_MODE=local`, this is a single-user food/workout demo without account authentication. The backend binds to `127.0.0.1`. Other module values reset on refresh. Existing H2 files remain on the local computer and are not automatically uploaded to Supabase. The Java endpoints below apply only to this local mode; Supabase mode uses its protected Data API directly.

| Environment variable | Purpose |
| --- | --- |
| `MACROMATE_DB_URL` | H2 JDBC URL; default `jdbc:h2:file:./data/macromate;DB_CLOSE_ON_EXIT=FALSE` |
| `MACROMATE_DB_USERNAME` | Database username; default `sa` |
| `MACROMATE_DB_PASSWORD` | Database password; default blank for local development |
| `MACROMATE_H2_CONSOLE_ENABLED` | Set `true` for the local H2 console; default `false` |
| `VITE_API_BASE_URL` | Optional frontend backend origin; development proxy works without it |

For inspection, set `MACROMATE_H2_CONSOLE_ENABLED=true` before starting the backend. Open **http://127.0.0.1:8080/h2-console** and use the JDBC URL and configured username/password above. Stop the backend before copying the database file for backup. Keep database files and credentials out of Git.

Vite forwards `/api` to port 8080 during development. A production build needs a reverse proxy for `/api`, or `VITE_API_BASE_URL` with a corresponding backend CORS configuration. Vite's development proxy does not apply after building.

## API

- `GET /api/food-entries` — entries ordered by date and ID.
- `GET /api/food-entries?date=2026-10-14` — entries for one date.
- `POST /api/food-entries` — create an entry; requires all fields below and returns a generated ID.
- `DELETE /api/food-entries/{id}` — delete; returns 404 if not found.

```json
{
  "meal": "Breakfast",
  "foodName": "Oatmeal",
  "calories": 250,
  "protein": 8.5,
  "carbs": 40,
  "fat": 5,
  "entryDate": "2026-10-14"
}
```

Meals must be Breakfast, Lunch, Dinner, or Snacks. Validation rejects missing fields, blank names, invalid dates, negative numbers, and excessive values. A submitted ID cannot overwrite an entry.

### Workouts

Choose **My Goals → Log workout** to save a walk, jog, or run. Each workout records its type, distance in kilometers, and date. The recent-workout list, current week's distance bars, and best day are calculated from saved workouts. You can delete a workout from the list.

- `GET /api/workouts` — workouts ordered newest date first.
- `POST /api/workouts` — create a workout with `workoutType`, `distanceKm`, and `workoutDate`.
- `DELETE /api/workouts/{id}` — delete; returns 404 if not found.

Workout types must be Walking, Jogging, or Running. Distance must be greater than zero and can have up to two decimal places; dates use `YYYY-MM-DD`.

```json
{
  "workoutType": "Walking",
  "distanceKm": 2.5,
  "workoutDate": "2026-10-14"
}
```

## Checks

From `Frontend`: `npm.cmd run lint` and `npm.cmd run build`.

From `Backend`: `.\mvnw.cmd test`. Tests use isolated in-memory H2 and do not change your journal file. Build a fresh JAR with `.\mvnw.cmd package`; the old committed JAR does not include these source changes.
