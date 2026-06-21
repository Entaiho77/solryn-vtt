# Tabletop

A generic, browser-based virtual tabletop. System-agnostic — built for
the game I actually run, not a feature checklist. See `ARCHITECTURE.md`
for the full design and phase plan.

## Map load dialog: grid presets & automatic scaling (current)

- "Load map" now opens a setup dialog instead of loading the image
  straight away. Pick a map type — **Battle** (20×15 squares, default),
  **City** (25×25), **Area** (30×20), **World** (40×30) — or **Custom
  Grid** to type your own width/height (up to 99×99).
- The dialog calculates pixels-per-square from your actual image
  dimensions and the chosen grid size, so the grid lines line up with
  the art instead of using one fixed size for every map. If the result
  would be too fine to see clearly, or the grid dimensions are invalid,
  it shows an error instead of loading.
- This pixel size is locked in per map (stored with the room) — loading
  a new map re-asks and recalculates; it's not a one-time global
  setting.
- ⚠️ `database.rules.json` changed again — re-publish it the same way as
  before.

## UI redesign: edge button tabs

- Drawer access moved off the toolbar onto two vertical button columns
  fixed to the left and right edges of the screen. Left: **Character
  Sheet** and (GM-only) **Bestiary**. Right: **Dice Roller** and **Turn
  Order**. Click a button to open its drawer; click it again to close.
  Only one drawer per side can be open at once, same as before.
- **Fog** stayed on the toolbar (still GM-only) since it's used less
  often than the others.
- **Bestiary** is new: a GM-only drawer for free-form creature notes
  (name + notes per entry) — add, edit, or remove entries any time.
  Players never see the Bestiary button.
- ⚠️ `database.rules.json` changed again — re-publish it the same way as
  before.

## Grid scaling and map types

- When the GM loads a map, a small popup asks what kind of map it is —
  **World** (20 mi/square), **Area** (10 mi/square), **City** (20
  ft/square), or **Battle** (5 ft/square, default). This sets how
  distance on the grid should be read for that map.
- **Map Type** and **Terrain** dropdowns in the toolbar let the GM
  change the scale anytime (e.g. switching from a battle map back to a
  world map, or marking terrain as Difficult/Favored to adjust travel
  speed). Everyone sees the current scale; only the GM can change it.
- A small label in the bottom-left corner of the board always shows the
  current map type, terrain, and distance per square.
- This is display/measurement only for now — it doesn't block token
  movement yet.
- ⚠️ `database.rules.json` changed again — re-publish it the same way as
  before.

## Phase 4: character sheets and fog of war

- **Sheet** drawer (left, everyone can open it): the GM defines custom
  fields (text/number/long text) for whatever game system you're running
  — there's no built-in "HP" or "Sanity", you make the fields you need.
  Click a token on the board (a quick click, not a drag) to open its
  sheet; only the GM or the token's owner can edit its values.
- **Fog of war** drawer (right, GM only): turn fog on, then use the
  reveal/hide brush to paint cells directly on the board. The GM still
  sees hidden cells faintly (so you know where you are); players see
  them as solid black.
- ⚠️ `database.rules.json` changed again for Phase 4 — re-publish it the
  same way as before: Firebase Console → Realtime Database → Rules,
  paste in the current contents of `database.rules.json` from this repo,
  click Publish.

## Phase 3: game table

- Whoever opens a fresh room link first becomes the GM (shown as a "GM" /
  "Player" pill in the toolbar). Only the GM can load a map or run the
  turn tracker; anyone can roll dice and move their own tokens.
- **Dice** drawer (left): type something like `2d6+3` or use the quick
  buttons; rolls land in a shared log everyone in the room can see.
- **Turn order** drawer (right): the GM picks tokens into an initiative
  order and steps through turns; players see the same order, read-only.
- ⚠️ If you already published `database.rules.json` for Phase 2, you need
  to re-publish it — Phase 3 added rules for roles/dice/turn order. Go to
  Firebase Console → Realtime Database → Rules, paste in the current
  contents of `database.rules.json` from this repo, and click Publish.

## Phase 2: multiplayer

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
