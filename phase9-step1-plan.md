# Phase 9 Step 1 — AoE/measurement shape toolbox: findings + plan

Investigation only. No code changed. Branch `claude/eribor-srd-bestiary-port`.

## Findings

### 1. The existing Measure tool (can we build on it?)
`BoardCanvas.tsx` already has a `measure` tool: mousedown sets a `Segment {sc,sr,ec,er}`,
drag updates the end cell, and `draw()` renders a dashed line + a "N sq · X ft" label.
**But it's ephemeral, local, per-client** — plain React state (`useState<Segment>`), cleared on
Escape / right-click / leaving the tool, never written to Firebase. So it's a great
**pattern to reuse** (canvas drawing in world space, `eventCell()` snapping, click-drag to set a
vector, the `measureScale` ft conversion) but it is **not** a persistence base. Shapes are a new
persisted layer that borrows its interaction code.

Crucially, the **ft→squares conversion already exists**: `measureScale = activeMap.customSquare ??
mapType.perSquare ?? {value:1,unit:'sq'}`. So "20 ft radius" → `20 / measureScale.value` squares →
`× gridSize` px. Typed exact values map cleanly to pixels.

### 2. How board state persists/syncs (and the empty-array gotcha)
All board state lives under `games/{gameId}` and rides the same realtime sync. The key pattern:
**collections are objects keyed by push-id, never arrays** — tokens are `games/{gameId}/tokens/{id}`,
fog is an object keyed by `"col,row"`. Deletion writes `null` to a key; "clear all" writes `null`
to the parent. The crash we hit earlier was an **array** (`initiative.order`) that Firebase dropped
when emptied. **Object-keyed maps don't have that failure mode** — an empty map just comes back
`undefined`, which `?? {}` handles.

→ **Recommendation: store shapes the same way tokens are stored** — `games/{gameId}/shapes/{id}`,
an object map, and keep arrays out of the shape record too (anchor as `{col,row}`, not `[col,row]`).

### 3. Anchoring + direction
- Tokens have `col/row`; `cellCenter()` → pixel. A **token-anchored** shape stores `{tokenId}` and
  reads that token's current cell each render, so it **follows the token live** (same id-link the
  stat card/art use). A **grid-anchored** shape stores its own `{col,row}`.
- **Direction (cone/line):** the Measure tool already does exactly the needed gesture — click an
  anchor, drag, and the anchor→cursor vector gives an angle. Recommended interaction: **type the
  size in the drawer, click to anchor (grid cell, or click a token to bind it), then drag to aim**
  for cone/line; circle/square commit on the anchor click (no aim needed). Store `angleDeg` for
  cone/line only.

### 4. Where the tools-box UI lives
`BoardScreen` builds right-edge toolbars from `BarItem[]` (drawers + actions), already shared by
GM and players (both have the Measure action). **Recommendation: a new right-side drawer "Shapes"
(◎)** added to both the GM and player right lists. The drawer holds: the four shape buttons, a ft
size input, an anchor-mode toggle (Grid / Token), an outline color, a GM-only "Show to table"
toggle (GM only), and a list of active shapes with per-row dismiss + Clear. Picking a shape arms a
new `BoardTool` (`'shape'`); the canvas then handles the anchor/aim click-drag, reusing
`eventCell()` and a token hit-test (`tokensAtCell`). This mirrors how `fog`/`measure` already flip
the active tool — no new layout system.

### 5. Dismissal model
Each shape carries `ownerUid`. Recommended: **per-shape dismiss** (the owner, or the GM, can clear
any one), a **"Clear mine"** for each user, and a **GM "Clear all"**. Deletion = `writeValue(
`games/{gameId}/shapes/{id}`, null)`; clear-all = `writeValue(`games/{gameId}/shapes`, null)`.
A player can clear their own; only the GM can clear others'.

### 6. Visibility
Both GM and players place shapes, and the whole point is communicating an AoE to the table, so
**default = shown to everyone** (shared tactical aid). Recommended nuance: a per-shape **GM-only
`hidden` flag** (GM can place a secret template while planning), filtered out for players in
`draw()` exactly like hidden tokens. Players' shapes are always table-visible. This fits the
existing GM/player split (`role`, `tokenVisibility`, `fogStyle`) without a new permissions concept.

## Recommended data model

```ts
// games/{gameId}/shapes/{id}  — object map, no arrays
interface BoardShape {
  id: string;
  mapId: string;                 // scoped to a map, like tokens
  kind: 'circle' | 'cone' | 'line' | 'square';
  ownerUid: string;
  color?: string;                // outline/fill tint (per placer)
  sizeFt: number;                // radius (circle) | length (cone/line) | side (square)
  anchor: { col: number; row: number } | { tokenId: string };  // grid point OR token
  angleDeg?: number;             // cone/line only (0 = east)
  hidden?: boolean;              // GM-only when true; default shown to table
  createdAt: number;
}
```

## Recommended build plan (Step 2, on approval)
1. `BoardShape` type + `data/shapes.ts` helpers: `addShape`, `removeShape`, `clearShapes(mine/all)`
   — all object-keyed writes, null-deletes (no arrays).
2. `ShapesDrawer` (new right drawer, GM + player): shape picker, ft size input, anchor-mode toggle,
   color, GM `hidden` toggle, active-shape list with dismiss + Clear mine/all.
3. New `BoardTool 'shape'`: canvas anchor click (grid snap or token hit-test) + drag-to-aim for
   cone/line; commit writes the shape.
4. `BoardCanvas.draw()`: a shape pass (after grid, under/over tokens TBD) converting ft→squares→px
   via `measureScale`; translucent fill + outline; filter by active map + visibility; token-anchored
   shapes read the live token cell.
5. Reuse the Phase-3 lesson: object map only, `Object.values(game.shapes ?? {})`, null to delete.

## Open questions for you
- **Cone shape:** D&D-style (length == width at the far end, ~53° spread) or a simple adjustable
  isosceles triangle? Recommend D&D-style for ruler accuracy.
- **Square anchoring:** centered on the anchor, or anchor = one corner? Recommend centered (matches
  how a "cube" is usually dropped on a point); token-anchored squares center on the token.
- **Size presets:** free-typed ft only (per your brief), or also quick presets (10/15/20/30)?
  Recommend free-typed with a couple of preset chips as a convenience — confirm if you want them.
