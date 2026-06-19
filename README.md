# Tabletop

A generic, browser-based virtual tabletop. System-agnostic — built for
the game I actually run, not a feature checklist. See `ARCHITECTURE.md`
for the full design and phase plan.

## Phase 2 (current): multiplayer

- Open the app, it puts a room id in the URL (`?room=abc123`). "Copy room
  link" shares it — anyone who opens that link joins the same room.
- Token positions, the map, and presence are synced live via Firebase
  Realtime Database.
- The presence pill (top-right of the toolbar) shows how many tabs are
  connected to the room, and flips to "reconnecting…" if the connection
  drops, recovering automatically (close/refresh/network drop all clean
  up via Firebase's `onDisconnect`).
- Map images are stored as a compressed data URL in the database (not
  Firebase Storage — see `ARCHITECTURE.md` for why).

## Run it

```bash
npm install
npm run dev
```

Requires a `.env.local` with Firebase config (see below) to actually
connect — without it, Firebase calls will fail.

## Firebase setup

1. Create a project at the Firebase Console.
2. Enable **Realtime Database** (start in test mode) and
   **Authentication → Anonymous**.
   - Firebase **Storage** now requires the paid Blaze plan, so this app
     does *not* use it — map images go through the Realtime Database
     instead (see `ARCHITECTURE.md`).
3. Register a Web App (Project Settings → Your apps → `</>`) to get your
   `firebaseConfig` values.
4. Copy `.env.example` to `.env.local` and fill in the `VITE_FIREBASE_*`
   values. `.env.local` is gitignored — never commit it.
   (The Firebase web config itself isn't a true secret — access control
   is enforced by Security Rules, not by hiding these values — but we
   still keep it out of git so per-environment config stays clean.)
5. Never commit a service-account JSON key; those are real secrets and
   only belong in CI environment variables, never in this repo.
6. In the Firebase Console, go to **Realtime Database → Rules**, paste
   in the contents of `database.rules.json` from this repo, and click
   **Publish**. (Default "test mode" rules expire after 30 days — these
   replace that with "must be signed in" rules instead.)
