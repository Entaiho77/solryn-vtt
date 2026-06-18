# Architecture

A generic, browser-based virtual tabletop. The board is the persistent
truth; tools (drawers) are summoned over it, never resident.

## Stack

- **Frontend:** React + Vite. Board/grid/tokens render on HTML5 Canvas;
  everything else (toolbar, drawers, theme toggle) is normal DOM/React.
- **Realtime sync (Phase 2+):** Firebase Realtime Database. State is a set
  of discrete owned objects (`tokens/{id}/x`, `tokens/{id}/y`, ...) — a
  last-write-wins-per-field problem, not concurrent text editing — so
  Firebase's path-write/subscribe model fits directly. No CRDT library.
- **Map storage (Phase 2+):** Firebase Storage, so every player loads the
  same image from one URL instead of a local file.
- **Auth (Phase 2+):** Firebase Anonymous Auth — click the room link, get
  a UID, no signup. Real accounts can be added later by linking an
  anonymous UID to an email/password or OAuth credential
  (`linkWithCredential`), which preserves the player's existing tokens/UID.
- **Hosting:** Firebase Hosting.

> Far-future note: if this outgrows Firebase economically, the migration
> target is self-hosted Node + WebSocket. That boundary would live behind
> the `src/sync/` layer (Phase 2) — swap the Firebase calls there for a
> WebSocket client without touching board/UI code. Not built now.

## Design system

All color is expressed as CSS custom properties with role-based names
(`--color-surface`, `--color-text`, `--color-accent`, `--color-drawer-bg`,
...) defined in `src/styles/tokens.css` under `[data-theme="dark"]` and
`[data-theme="parchment"]`. Components reference roles only — never raw
hex values — so the theme toggle (`src/theme/ThemeContext.jsx`) is a
single attribute swap on `<html>`. Motion timing/easing
(`--motion-settle-*`, `--motion-drawer-*`) is theme-independent: only
color changes between themes.

## Board rendering (`src/board/`)

- `grid.js` — pure math: world↔screen conversion for the camera (pan +
  zoom), grid cell↔world conversion. No DOM/canvas references, so it's
  testable in isolation.
- `Board.jsx` — owns the canvas, the render loop (`requestAnimationFrame`),
  pointer event handling (pan when no token is hit, drag when one is),
  and the wheel-zoom-toward-cursor math. Token positions have a `target`
  (snapped cell center) and a `render` (animated) coordinate; a simple
  spring (`SETTLE_RATE`) eases `render` toward `target` each frame —
  this is the "weighted settle on drop" feel, and the same constant will
  back drawer motion later so the whole app reads as one physical object.
- `Toolbar.jsx` — local map file picker (Phase 1) / add-token button.
  In Phase 2 "load map" becomes "upload to Storage", not a structural
  change.

## Security notes (flag explicitly as they land)

- **Phase 1 (current):** no backend, no security surface — everything is
  local browser state.
- **Phase 2:** Firebase Realtime Database rules will be written
  alongside the sync code, not left at the default "test mode" open
  rules. Anonymous Auth UID becomes the basis for "who owns this write."
- **Phase 3:** role enforcement (GM vs. player) must exist in *both* the
  UI (so players don't see controls they can't use) and the Database
  Rules (so a modified client can't move another player's token). UI
  checks alone are not security — call this out again when it's built.

## Directory layout

```
src/
  board/        canvas rendering, grid math, toolbar
  theme/         ThemeContext + toggle
  styles/        design tokens (colors) + global/board CSS
  sync/          (Phase 2) Firebase RTDB read/write + presence
  drawers/       (Phase 3+) the drawer shell (slide-in panels over the map)
```

## Phase status

- [x] Phase 1 — static board: grid, pan/zoom, local map image, draggable
      snapping tokens, dark/parchment theme toggle, weighted drop motion.
- [ ] Phase 2 — Firebase Realtime DB sync, room links, presence, map in
      Storage.
- [ ] Phase 3 — dice roller, turn tracker, GM/player roles enforced in
      Rules.
- [ ] Phase 4 — flexible character sheet schema, fog of war.
