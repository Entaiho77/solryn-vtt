# Tabletop

A generic, browser-based virtual tabletop. System-agnostic — built for
the game I actually run, not a feature checklist. See `ARCHITECTURE.md`
for the full design and phase plan.

## Phase 1 (current): static board

- Canvas grid with pan (drag empty space) and zoom (scroll wheel,
  zooms toward cursor).
- "Load map" loads a local image file, drawn from the grid origin.
- "Add token" drops a colored circle; drag it and it snaps to the
  nearest cell with a weighted settle on drop.
- Theme toggle (top right) switches dark ↔ parchment instantly.

## Run it

```bash
npm install
npm run dev
```

## Firebase setup (needed starting Phase 2)

1. Create a project at the Firebase Console.
2. Enable **Realtime Database**, **Storage**, and **Authentication →
   Anonymous**.
3. Register a Web App to get your `firebaseConfig` values.
4. Copy `.env.example` to `.env.local` and fill in the `VITE_FIREBASE_*`
   values. `.env.local` is gitignored — never commit it.
   (The Firebase web config itself isn't a true secret — access control
   is enforced by Security Rules, not by hiding these values — but we
   still keep it out of git so per-environment config stays clean.)
5. Never commit a service-account JSON key; those are real secrets and
   only belong in CI environment variables, never in this repo.
