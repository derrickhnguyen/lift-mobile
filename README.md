# Lift Mobile

React Native (Expo) mobile app for the Lift bodybuilding workout tracker. Companion to the [lift](../lift) NestJS backend.

## Stack

- **Expo** (SDK 56, managed workflow)
- **React Navigation** — native stack + bottom tabs
- **Zustand** — state management
- **Axios** — API client (points to `http://localhost:3000/api/v1`)
- **react-native-svg** — progress charts
- **expo-secure-store** — secure token storage
- **@expo-google-fonts** — Archivo, Hanken Grotesk, JetBrains Mono
- **Feature Slice Design** architecture

## Architecture

```
src/
├── app/          # Navigation, providers
├── pages/        # Screen components (auth, home, session, library, progress, profile, summary)
├── widgets/      # Composite UI (workout-card, exercise-block, set-row, rest-timer, line-chart, …)
├── features/     # Business logic stores (auth, active-session, workout-history, exercise-library, user-preferences)
├── entities/     # API types + API calls (workout, exercise, user)
└── shared/       # Infrastructure (ui kit, theme, lib, api client)
```

Imports flow strictly one way: `app → pages → widgets → features → entities → shared`.

## Screens

| Screen | Description |
|---|---|
| Auth | Sign in with Apple / Google / Facebook OAuth |
| Home | Scrollable workout history feed (cursor-based infinite scroll) |
| Active Session | Hero logging screen — sets, supersets (lime bracket + A1/A2 tags), dropsets (orange connector), rest timer |
| Session Detail | Read-only view of a completed workout |
| Exercise Library | Searchable + muscle-group filtered list; create / delete custom exercises |
| Progress Detail | Max weight, Est. 1RM, Volume charts with time ranges; tap points for tooltip |
| Workout Summary | Post-finish summary — duration, sets, volume, PR detection |
| Profile / Settings | Default unit (lbs/kg), rest timer default, dark/light theme |

## Setup

```bash
npm install
```

Start the dev server:

```bash
npm start
```

Then scan the QR code with the **Expo Go** app, or press `a` for Android / `i` for iOS simulator.

### Backend

This app expects the Lift backend running at `http://localhost:3000`. See [../lift/README.md](../lift/README.md) to start the backend.

On a physical device, replace `localhost` with your machine's LAN IP in `src/shared/config/constants.ts`.

## Authentication

OAuth is **stubbed** — real sign-in requires Supabase credentials. To wire it up:

1. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to a `.env` file.
2. Install `@supabase/supabase-js` + `expo-web-browser`.
3. In `src/pages/auth/ui/AuthPage.tsx`, replace the stub with:
   ```ts
   const { data } = await supabase.auth.signInWithOAuth({ provider });
   // then pass data.session.access_token + user to useAuthStore.signIn()
   ```

## Scripts

| Script | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Open in Android emulator |
| `npm run ios` | Open in iOS simulator (macOS only) |
| `npm run web` | Open in browser |

## Branch and commit conventions

Same as the backend repo:

- Branch names: `feat/<issue-number>-<short-description>`
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, etc.)
- PRs required to merge into `main`

## PR description format

```
## Summary
- [bullet points of what changed]

## Test plan
- [ ] [manual steps to verify the change works]

🤖 Generated with Claude Code
```
