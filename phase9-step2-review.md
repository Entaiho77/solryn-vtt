# Phase 9 Step 2 — AoE/measurement shape toolbox (build review)

Commit `8605198` · branch `claude/eribor-srd-bestiary-port` · typecheck ✓ · 177 tests ✓ · build ✓

## Data model (as built)

`BoardShape` (in `data/types.ts`):

```ts
interface BoardShape {
  id: string;
  mapId: string;
  kind: 'circle' | 'cone' | 'line' | 'square';
  ownerUid: string;
  color?: string;
  sizeFt: number;                                   // radius | length | side
  anchor: { col: number; row: number } | { tokenId: string };  // object, never a tuple
  angleDeg?: number;                                // cone/line only (0 = east)
  hidden?: boolean;                                 // GM-only when true
  createdAt: number;
}
```

Stored at `games/{gameId}/shapes/{id}` on the `Game.shapes?: Record<string, BoardShape>` map.

## Object-keyed store — can't repeat the empty-array crash

`data/shapes.ts` writes one key per shape and **never an array**:
- `addShape` → `writeValue(games/{id}/shapes/{pushId}, full)`
- `removeShape` → `writeValue(.../shapes/{id}, null)` (deletes the key)
- `clearShapes(all)` → `writeValue(.../shapes, null)`; `clearShapes(mine)` → null per owned key
- The record itself holds no arrays — `anchor` is `{col,row}` or `{tokenId}`.

Every read uses `Object.values(game.shapes ?? {})`. An emptied map returns `undefined`, handled
by `?? {}` — the same pattern as tokens/fog. The old crash was an **array** (`initiative.order`)
that Firebase dropped when emptied; this store has no arrays, so that failure mode is gone.

## Where the drawer lives

`ShapesDrawer` — a new right-edge drawer (◎ "Shapes") added to **both** the GM and player right
toolbars (next to Measure). Contains: 4 shape buttons, ft size input + preset chips 10/15/20/30,
Grid/Token anchor toggle, outline color (`<input type=color>`), a GM-only "Hidden (GM only)"
toggle, and the active-shape list with per-row dismiss + Clear mine + (GM) Clear all. Settings
persist locally in the drawer so they survive disarming.

## Place/aim interaction per shape

Picking a shape arms the `'shape'` BoardTool (cursor → crosshair). On the canvas:
- **Circle / Square** — click once to anchor; **commits immediately** (no aim).
- **Cone / Line** — click to anchor, then **drag to aim**; the anchor→cursor vector sets
  `angleDeg`, with a live translucent preview, and it **commits on mouse-up**.
- Anchor resolution honors the toggle: **Token** mode hit-tests the topmost visible token at the
  clicked cell and binds `{tokenId}`; **Grid** mode (or an empty cell) stores `{col,row}`.
- Esc cancels an in-progress aim. Arming is cleared when you open another drawer or toggle Measure
  (the two tools are mutually exclusive).

## Token-anchoring follows live

Token-anchored shapes store only `{tokenId}`. Each render, `BoardCanvas.draw()` looks up the
token's **current** `col/row` via `cellCenter`, so the shape tracks the token as it moves. If the
token is removed, `shapeCenter` returns null and the shape simply isn't drawn.

## Rendering

A dedicated shape pass in `draw()` (under the tokens, above the grid) converts ft → squares → px
via the existing `measureScale` (`sizeFt / ftPerSquare × gridSize`), then fills translucent
(`globalAlpha 0.22`) + strokes the outline at the shape's color. Cone is D&D-style (far-edge width
== length, ≈53° spread); square is **centered on the anchor** (and on the token when
token-anchored); line is a 1-square-wide rectangle along the aim. The existing grid / measure /
fog rendering is untouched.

## Dismissal + visibility

- **Dismiss:** per-row × (shown to the shape's owner or the GM) → `removeShape`. **Clear mine**
  (any user) and **Clear all** (GM only).
- **Visibility:** shapes are scoped to the active map and shown to the whole table by default.
  `hidden` shapes are filtered to GM-only in `BoardScreen` (`!sh.hidden || role === 'gm'`), the same
  way hidden tokens work; the Hidden toggle is GM-only in the drawer.

## Verification
Typecheck, full 177-test suite, and production build all pass.
