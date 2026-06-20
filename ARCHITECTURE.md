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
- **Map storage:** Firebase Storage requires the paid Blaze plan now (no
  longer available on free Spark). To stay on Spark, the map image is
  downscaled/re-encoded client-side (`src/utils/resizeImage.js`, capped
  at 1600px / JPEG q=0.82) and stored as a data URL string directly at
  `rooms/{roomId}/map` in the Realtime Database. Works for normal map
  images; if this ever needs to handle very large/many images, revisit
  Storage (requires Blaze) as the clean fix.
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
- `Toolbar.jsx` — map file picker, add-token, copy-room-link, and a
  presence/connection pill.

## Sync (`src/sync/`, Phase 2)

- `roomId.js` — a room is just a `?room=<id>` query param. No id means
  "create one and put it in the URL" — that's the whole room-creation
  flow; sharing the URL *is* the invite.
- `useRoomSync.js` — the only place that talks to Firebase. Subscribes to
  `rooms/{roomId}/tokens`, `/map`, and `/presence`; exposes plain
  functions (`addToken`, `moveToken`, `setMap`) that write to those
  paths. Presence uses `onDisconnect()` registered inside the
  `.info/connected` listener, so it re-arms automatically after a
  reconnect (tab close, refresh, or network drop all clean up the same
  way).
- **Token sync is target-only.** A token has a synced `target` (the
  snapped cell it's heading to) and a local-only `render` position that
  Board eases toward it every frame (`Board.jsx`'s existing spring).
  Drags only write to Firebase on drop (`onTokenDrop`), not every
  mousemove — cheap, and the spring makes the eventual jump still read
  as "settling into place" rather than a teleport. If live mid-drag
  motion across clients is wanted later, the clean fix is throttled
  position writes during the drag; not built now since it's not needed
  yet.

## Roles, dice, turn order (`src/drawers/`, `src/utils/diceRoller.js`, Phase 3)

- **GM claim.** `rooms/{roomId}/gmUid` is empty in a fresh room. The first
  client to see it empty claims it via a Realtime Database transaction
  (`runTransaction`), which only commits if the value is still null — so
  two tabs opening the same fresh link at once still resolve to a single
  GM. `useRoomSync` derives `isGm = uid === gmUid` and exposes both.
- **Token ownership.** Every token now carries `ownerUid` (set at
  creation, in `addToken`). `Board.jsx` only starts a drag if
  `isGm || token.ownerUid === uid`; the equivalent check is mirrored in
  `database.rules.json` so a modified client can't bypass it.
- **Dice roller** (`src/utils/diceRoller.js`, `DiceDrawer.jsx`) — parses
  simple `NdM±K` notation (e.g. `2d6+3`), rolls client-side, and pushes
  the result to `rooms/{roomId}/diceLog`. Log entries are write-once
  (Rules reject edits to an existing entry) and tagged with the roller's
  `uid`, so the shared log can't be tampered with after the fact.
- **Turn tracker** (`TurnDrawer.jsx`) — the GM picks tokens into
  `rooms/{roomId}/turn.order` and advances `currentIndex`; only the GM
  can write `turn` (enforced in Rules, not just by hiding the controls in
  the UI). Players see the same drawer, read-only.
- **Drawers** (`src/drawers/Drawer.jsx`) — shared slide-in shell: fixed to
  a side (`left`/`right`), translucent + blurred background
  (`--color-drawer-bg`, `--drawer-blur`) so the map stays visible
  underneath, same `--motion-drawer-*` timing as everything else. Dice
  lives on the left, turn order on the right — the two-drawer, one-per-side
  cap from the design brief.

## Character sheets and fog of war (`src/drawers/SheetDrawer.jsx`, `FogDrawer.jsx`, Phase 4)

- **Sheet schema.** The GM defines a list of fields (`{id, label, type}`,
  type one of `text`/`number`/`longtext`) stored at
  `rooms/{roomId}/sheetSchema`. This is system-agnostic by design — the
  app has no idea what "HP" or "Sanity" means, it just renders whatever
  fields the GM defines. Each token carries its own `sheet` data object
  (`{fieldId: value}`) at `tokens/{tokenId}/sheet`; there's no separate
  Rules path for it since it's a sub-object of the token, so it falls
  under the existing per-token ownership rule (owner or GM can write).
- **Selecting a token to view/edit its sheet** needed a "click" gesture
  distinct from "drag" on the same canvas pointer handlers. `Board.jsx`
  records the mousedown screen position and, on mouseup, only treats it
  as a drop if the cursor moved past `CLICK_MOVE_THRESHOLD` (4px) —
  otherwise it's a click and fires `onSelectToken`, which opens the Sheet
  drawer for that token.
- **Fog of war.** `rooms/{roomId}/fog = { enabled, revealed: {"col,row":
  true} }`. Only the GM can write the `fog` node (Rules), and only the GM
  can paint it (gated client-side too, since the brush is a GM-only
  toolbar/drawer feature, not something a player even has UI for). Each
  cell is toggled independently via `runTransaction` (`toggleFogCell`),
  same atomic-flip pattern as the GM claim, so rapid brush strokes can't
  race each other into a wrong state. The GM renders unrevealed cells at
  partial opacity (so they can still see the board underneath); players
  render them fully opaque — same fog data, different rendering, decided
  entirely in `Board.jsx` from the `isGm` prop it already had.
- **Drawer cap stays at two.** Adding two more drawer types (Sheet, Fog)
  without breaking "max one per side, two total" meant moving from two
  boolean toggles to two enum slots: `leftDrawer: null|'dice'|'sheet'`
  and `rightDrawer: null|'turn'|'fog'` in `App.jsx`. Same drawer shell,
  same physics, just a four-way state machine instead of two independent
  booleans.

## Edge button tabs (`src/board/EdgeButtonTabs.jsx`, `EdgeButton.jsx`, post-grid-scaling)

- Drawer access moved off the toolbar onto two persistent 48px vertical
  button columns fixed to the left/right edges of the viewport, below the
  toolbar. Left holds **Character Sheet** and (GM-only) **Bestiary**;
  right holds **Dice Roller** and **Turn Order**. **Fog** stayed a
  toolbar button (GM-only, infrequent) rather than moving to an edge tab.
- `leftDrawer`/`rightDrawer` in `App.jsx` are still the same two enum
  slots as before, just fed by edge buttons instead of toolbar buttons:
  `leftDrawer: null|'sheet'|'bestiary'`, `rightDrawer:
  null|'dice'|'turn'|'fog'` — same one-per-side cap, same `Drawer.jsx`
  shell and slide animation, no change to drawer internals.
- `Drawer.css`'s `--left`/`--right` offsets moved from `0` to `48px` so
  the open drawer no longer covers the edge tab it was opened from — the
  tab stays clickable (and visibly "active") the whole time the drawer is
  open, so clicking it again still closes the drawer.
- `board.css`'s canvas/texture insets grew from a flat `20px` to `68px`
  on the left/right (20px frame margin + 48px tab width) so the board
  itself doesn't render underneath the tabs; top/bottom stayed `20px`
  since the toolbar already overlays rather than pushing the board down.
- **Bestiary** is a new GM-only feature, not just a relocated drawer: a
  flat list of `{id, name, notes}` creature entries at
  `rooms/{roomId}/bestiary`, edited the same way `sheetSchema` is (GM
  free-edits the array, write goes straight to Firebase on each change —
  no draft/save step needed since there's no schema-vs-data split here,
  just notes). GM-only-write in `database.rules.json`, same `gmUid`
  check as `sheetSchema`/`fog`/`mapType`. The edge button itself is
  hidden from players, and the drawer also refuses to render its content
  for a non-GM as a second guard.

## Grid scaling and map types (`src/utils/distanceCalculator.js`, post-Phase-4)

- **Map type** (`world`/`area`/`city`/`battle`) and **terrain difficulty**
  (`normal`/`difficult`/`favored`) together determine what one grid
  square is worth in real distance — purely a display/measurement
  concept for now, not enforced against token movement. The lookup table
  (`SCALE_MAPS`) lives in one place (`distanceCalculator.js`) so the
  scale values are easy to tune later.
- The grid's *visual* pixel size (`GRID_SIZE`) never changes — only the
  meaning of a square changes. This keeps camera/zoom math untouched and
  keeps the feature display-only, matching "validate movement" being an
  explicitly deferred future enhancement.
- **Map type is chosen when the GM loads a map** (`MapTypeModal.jsx`),
  defaulting to Battle since that's the most common immediate-play
  scale. Both `mapType` and `terrainDifficulty` can also be changed
  anytime from toolbar dropdowns — GM-write, but visible (disabled) to
  players so everyone sees the current scale, same read-visible/GM-write
  pattern as `fog`/`sheetSchema`. Synced at `rooms/{roomId}/mapType` and
  `rooms/{roomId}/terrainDifficulty`, both GM-only-write in
  `database.rules.json`.
- A small corner label on the board (`.scale-label` in `App.jsx`) shows
  the current map type, terrain, and resulting distance per square, so
  the scale is visible without opening a drawer.

## Security notes (flag explicitly as they land)

- **Phase 1:** no backend, no security surface — everything is local
  browser state.
- **Phase 2 (current):** `database.rules.json` requires `auth != null`
  for any read/write under `rooms/{roomId}` — not left at the default
  open "test mode" rules (which also expire after 30 days). This is
  *room-scoped-by-link, not role-scoped*: anyone with the room link gets
  an anonymous UID and can read/write everything in that room, including
  other players' tokens. That's intentional for now — Phase 3 is exactly
  where "can only move your own token" gets enforced, in Rules, not just
  UI. Anyone without the link has no path to guess into a room (room ids
  are random, rules require auth but don't allow listing rooms).
- **Phase 3 (current):** role enforcement now exists in *both* places.
  Rules: only the GM (`gmUid`) can write `map` and `turn`; a token can
  only be written by its `ownerUid` or the GM; `diceLog` entries are
  create-only and must be tagged with the writer's own `uid`. UI: the
  "Load map" button and turn-order controls are hidden from players, and
  `Board.jsx` won't even start a drag on a token a player doesn't own —
  but the Rules are the actual enforcement; the UI hiding is just so
  players aren't shown controls that would fail anyway.
- **Phase 4 (current):** `sheetSchema` and `fog` are both GM-only-write
  in Rules (same `gmUid` check as `map`/`turn`). Per-token `sheet` data
  has no separate rule — it's covered by the existing `tokens/$tokenId`
  rule (owner-or-GM), which is correct since a sheet belongs to its
  token. The Sheet drawer additionally checks `isGm || token.ownerUid ===
  uid` client-side before letting fields be edited, mirroring the
  Rules-level enforcement.
- **Grid scaling (post-Phase-4):** `mapType` and `terrainDifficulty` are
  GM-only-write in Rules, same `gmUid` check as the other GM-controlled
  room state. They're display/measurement only right now — no movement
  is blocked based on them — so there's no enforcement gap to flag yet;
  that becomes relevant if movement validation against these values is
  built later.
- **Edge button tabs / Bestiary (current):** no new security surface
  from the edge-tab relocation itself — same drawers, same Rules. The new
  `bestiary` node is GM-only-write in Rules (same `gmUid` check as
  `sheetSchema`); the edge button that opens it is also hidden from
  players client-side, so there's no UI path for a player to reach it,
  but the Rules check is what actually prevents a modified client from
  writing to it.

## Directory layout

```
src/
  board/        canvas rendering, grid math, toolbar
  theme/         ThemeContext + toggle
  styles/        design tokens (colors) + global/board CSS
  sync/          (Phase 2) Firebase RTDB read/write + presence
  drawers/       (Phase 3) drawer shell + dice roller + turn tracker
                 (Phase 4) character sheet schema/editor + fog of war
                 (post-grid-scaling) bestiary (GM-only creature notes)
  utils/         resizeImage.js (Phase 2), diceRoller.js (Phase 3)
```

## Phase status

- [x] Phase 1 — static board: grid, pan/zoom, local map image, draggable
      snapping tokens, dark/parchment theme toggle, weighted drop motion.
- [x] Phase 2 — Firebase Realtime DB sync, shareable room links, presence
      + reconnect handling, map shared via RTDB (Storage skipped, see
      above — Blaze-plan requirement).
- [x] Phase 3 — dice roller with shared log, GM turn tracker, GM/player
      roles enforced in both UI and Database Rules.
- [x] Phase 4 — flexible GM-defined character sheet schema, fog of war.
