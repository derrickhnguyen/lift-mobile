# CLAUDE.md

## What this repo is

React Native (Expo) mobile app for the Lift bodybuilding workout tracker. The NestJS backend is in `../lift/`.

## Commands

```bash
npm start           # start Expo dev server
npm run android     # open in Android emulator
npm run ios         # open in iOS simulator (macOS only)
npm run web         # open in browser
```

## Architecture — Feature Slice Design (FSD)

```
src/
├── app/          # Navigation, global providers — imports from all layers
├── pages/        # Screens — compose widgets + features
├── widgets/      # Composite UI components — use features + entities
├── features/     # Zustand stores + business logic — use entities
├── entities/     # API types + API calls (no business logic)
└── shared/       # ui/, lib/, api/, config/ — zero app-layer imports
```

**Import rule:** layers only import from layers below them. `app → pages → widgets → features → entities → shared`. Never import upward.

Each slice exposes its public API via `index.ts`. Import from the slice root, not internal paths.

## State management

Zustand stores in `src/features/*/model/`:

| Store | Key state |
|---|---|
| `useAuthStore` | user, token, isSignedIn, isHydrating |
| `useUserPreferencesStore` | unit (lbs/kg), defaultRest, theme (dark/light) |
| `useWorkoutHistoryStore` | sessions[], nextCursor, cursor-based pagination |
| `useActiveSessionStore` | local session being logged; syncs to API in real-time |
| `useExerciseLibraryStore` | exercises[], CRUD |

## API

Backend at `http://localhost:3000/api/v1`. Client in `src/shared/api/client.ts` — injects `Authorization: Bearer <token>` from `expo-secure-store` on every request.

All endpoints require auth. Key routes:

- `GET /workouts?limit=20&cursor=uuid` — paginated history
- `GET /workouts/:id` — full detail with exercises + sets
- `POST /workouts` — create session `{ name?, started_at }`
- `PATCH /workouts/:id` — update session `{ name?, started_at? }`
- `DELETE /workouts` — soft-delete ALL of the user's workout sessions
- `DELETE /workouts/:id` — soft-delete a single workout session
- `POST /workouts/:id/exercises` — add exercise `{ exercise_id, superset_group_id? }`
- `DELETE /workouts/:id/exercises/:weId` — remove exercise from session
- `POST /workouts/:id/exercises/:weId/sets` — create set `{ weight, unit, reps, dropset_group_id? }`
- `PATCH /workouts/:id/exercises/:weId/sets/:setId` — update set `{ weight?, unit?, reps? }`
- `DELETE /workouts/:id/exercises/:weId/sets/:setId` — delete set
- `GET /exercises?muscle_group=chest&limit=50`
- `GET /exercises/:id/progress`
- `GET /users/me` / `PATCH /users/me`

## Data model notes

- `workout_exercises.superset_group_id` — UUID shared by exercises in the same superset (null = standalone)
- `sets.dropset_group_id` — UUID shared by sets in the same drop chain (null = standalone)
- `set.weight` comes back as numeric string from the DB — the API client normalises it to `number`
- `set.unit` is stored per-set so history always shows the original unit even after preference changes

## Design system

- **Primary accent:** `#C6F432` (electric lime)
- **Dark bg:** `#0A0A0B` / **Light bg:** `#F6F6F4`
- **Dropset color:** `#FF8A3C` (orange, distinct from lime)
- Fonts: Archivo 800 (display), Hanken Grotesk (body), JetBrains Mono (numbers)
- Theme tokens in `src/shared/config/theme.ts`; accessed via `useTheme()` hook

## Authentication

OAuth is stubbed in `src/pages/auth/ui/AuthPage.tsx`. To wire real Supabase OAuth:
1. Add `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` to `.env`
2. Call `supabase.auth.signInWithOAuth({ provider })` in the stub location
3. Pass the resulting `access_token` + user to `useAuthStore.signIn()`

## Conventions

- Branch: `feat/<issue>-<description>`
- Commits: conventional (`feat:`, `fix:`, `chore:`)
- PRs to merge into `main`
