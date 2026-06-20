# Tabletop — Design Brief

What's built and working today, for design review. This is a functional
prototype, not a polished product — visuals are placeholder-quality.
The goal of this brief is to show what exists so we can figure out what
needs to change.

## What it is

A browser-based virtual tabletop (VTT) — a shared digital game table for
running tabletop RPGs remotely. One person is the GM (game master), the
rest are players. Everyone opens the same link and sees the same board,
live.

## Core screen layout

- **Full-bleed canvas board** fills the entire window — this is the map.
  Pan by dragging empty space, zoom with the scroll wheel.
- **Toolbar**, fixed across the top: buttons for the actions below, plus
  a role pill (GM/Player) and a connection status pill, top-right.
- **Drawers** are the only other UI. They're panels that slide in from
  the left or right edge over the board (semi-transparent, blurred
  background so the map stays visible underneath) and slide back out —
  nothing is permanently on-screen except the toolbar and the board.
  Only one drawer per side can be open at a time (left: Dice or
  Character Sheet; right: Turn Order or Fog of War), so at most two are
  open at once.
- **Theme toggle**, top-right: switches between a dark theme and a
  "parchment" (light, paper-like) theme. Only color changes between
  themes — layout, motion, and spacing are identical in both.

## Features (all working end-to-end)

1. **The board** — grid-snapped tokens (colored circles), drag to move,
   pan/zoom camera. Tokens "settle" into place with a little weighted
   bounce when dropped, rather than snapping instantly.
2. **Map loading** — GM can load any image as the table's map/background.
3. **Multiplayer sync** — everyone sees the same board, tokens, and map
   live. A presence pill shows how many people are currently connected.
4. **Roles** — whoever opens a brand-new room link first becomes GM
   automatically. GM gets extra controls (map loading, turn order, fog);
   players can roll dice and move only the tokens they own.
5. **Dice roller** (left drawer) — type notation like `2d6+3`, roll, see
   a running shared log of everyone's rolls.
6. **Turn/initiative tracker** (right drawer) — GM builds a turn order
   from the tokens on the board and steps through it; players see the
   same order, read-only.
7. **Character sheets** (left drawer) — the GM defines whatever custom
   fields the game needs (there's no fixed "HP"/"Sanity" — it's
   blank-slate per game system). Click any token on the board to open
   its sheet; the token's owner (or the GM) can fill it in.
8. **Fog of war** (right drawer, GM-only) — GM paints which grid cells
   are hidden vs. revealed directly on the map. Players see hidden
   cells as solid black; the GM sees them dimmed instead of fully
   blacked out, so the GM always knows where things are.

## What's intentionally *not* built yet

- No deployed/hosted version — runs locally only, for now.
- No persistent accounts — anonymous per-browser identity, tied to
  whichever room link you opened.
- No animations/transitions beyond the token "settle" and drawer
  slide-in.
- No mobile-specific layout — built and tested on desktop browsers only.
- No sound, no map drawing/annotation tools, no token art (just flat
  colored circles right now).

## Where design input is most wanted

- **Visual identity** — current look is bare-bones default styling
  (system fonts, flat colors, no texture/iconography). Looking for an
  actual visual direction for both themes.
- **Token appearance** — right now tokens are just solid-color circles.
  Open to a real token design (shape, border, selected/owned states,
  maybe portraits later).
- **Drawer content layout** — especially the character sheet drawer,
  since field count/type varies per game and the layout needs to stay
  usable whether there are 3 fields or 30.
- **Toolbar** — currently a flat row of text buttons; icons, grouping,
  and visual hierarchy (GM-only controls vs. everyone controls) could
  use a real pass.
- **Fog-of-war rendering** — currently a flat black/dim overlay; open to
  better visual treatment (texture, edge softening, reveal animation).

Happy to do a live walkthrough on a call if that's easier than working
from this doc alone.
