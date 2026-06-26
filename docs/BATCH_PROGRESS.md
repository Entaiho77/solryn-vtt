# Batch progress — 7-item morning list

Order: armor · player-measure · line-color toggle · click-priority · rules-collapse · collision ·
party-token. Building + testing + committing each before the next. (The earlier overnight batch —
initiative carousel / naming step / pan-zoom — is done and in git history.)

Verification caveat for all UI items: this cloud env can't reach Firebase, so things are verified by
`tsc` build + the Vitest suite + reasoning. **Live board/builder visuals need an eyeball.**

## 1. Remove Heavy armor from starting gear — ✅ DONE
Data-driven: new `CreationConfig.startingArmorWeights` (Solryn = `['light','medium']`); `GearStep`
filters the armor options to those weights. Heavy armor stays in the catalog (play/loot), just isn't a
starting option. Files: `system.ts`, `modes.ts`, `GearStep.tsx`, `solryn.test.ts` (+1). 156 tests pass.

## 2. Player access to the distance measuring tool — ✅ DONE
The "Measure distance" action (now a shared `BarItem`) is on the player's right edge-bar too, not
just the GM's. The measure interaction in `BoardCanvas` was already role-agnostic, so no engine
change. Files: `BoardScreen.tsx`. Build clean, 156 tests.

## 3. Grid + measure line color toggle (white/black, one toggle, session-only) — ✅ DONE
One GM right-bar toggle (glyph ○/●) flips BOTH the grid lines and the measure line between white and
black together. Session-only React state in `BoardScreen`, passed to `BoardCanvas`. NOTE: this
replaces the previous per-map auto-brightness detection with explicit GM control (as requested) —
`imageLuminance` + the luminance cache were removed. Players keep white (toggle is GM-only). Files:
`BoardCanvas.tsx`, `BoardScreen.tsx`. Build clean, 156 tests.

## 4. Token click-priority / stacking — ✅ DONE
Investigation result: `tokenAtCell` already returned the *topmost* token, so the reported
"can't click the later token" wasn't a z-index/hit-size bug — it was **multiple tokens sharing
one grid cell** (only the topmost is reachable), made worse by `AddCreatureDrawer` dropping
every creature on the exact centre cell so they piled up. Two-part fix:
- **Click-cycling** — repeated clicks on a stacked cell rotate through the pile (topmost first,
  then down, wrapping back to top), so every token is reachable. New pure `tokensAtCell` +
  `cycleSelection(stack, currentId)`; `BoardCanvas.handleDown` uses them with `selectedTokenId`.
- **Free-cell placement** — new creatures land on the nearest free cell to centre via new pure
  `firstFreeCell` (growing Chebyshev rings, board-clamped). `AddCreatureDrawer` now takes
  `tokens` and computes occupied cells. Click-cycling is the safety net for a rapid burst that
  places faster than tokens sync back (so no extra local de-stacking state needed).
Item 6's movement-collision rule will stop stacking happening during play too. Files:
`boardGeometry.ts` (+3 helpers), `BoardCanvas.tsx`, `AddCreatureDrawer.tsx`, `BoardScreen.tsx`,
`boardGeometry.test.ts` (+8). Build clean, 164 tests.

## 5. Rules panel: collapse to names, expand on click (keep search) — ✅ DONE
`RulesDrawer` now renders each reference card / condition as a collapsible `RuleItem` — a
name-only header (with a ▸/▾ caret) that reveals the description on click. The search box and
its filter are byte-for-byte unchanged (cards still match name+description, conditions match
name). One addition that *serves* the collapse rather than changing the search: while a query
is active every shown match is auto-expanded, so a description-only match isn't hidden behind
its name; clearing the search returns to name-only browse with manual toggles. Expand state is
namespaced (`card:`/`cond:`) so a card and condition sharing an id can't toggle together.
Files: `RulesDrawer.tsx` (rewrite), `drawers.module.css` (+`.ruleRow`/`.ruleHead`/`.caret`).
Build clean, 164 tests.

## 6. Token grid-square collision — soft block (pass through, can't land) — ✅ DONE
A token can be dragged *through* occupied cells but can't END its move on one. Implemented as
pure, footprint-based geometry so it's already multi-square-correct:
- `blocksMovement(kind)` — only `creature`/`character` block; `trap` (and any future scenery)
  never blocks, so you can still step onto a trap to trip it.
- `footprintAt(col,row,size)` + optional `Token.size` (default 1) — a sized token fills its
  whole N×N footprint. (Rendering sized tokens is still a follow-up; the *collision rule* asked
  for in this item honours size now.)
- `occupiedCells(tokens, exceptId)` + `canLandOn(mover, col, row, occupied)` — the drop in
  `BoardCanvas.handleUp` is gated on `canLandOn`; a blocked drop is cancelled (snap back). The
  drag ghost's ring turns **red** while hovering a cell it can't land on, so the soft-block is
  legible instead of a mystery snap-back.
Files: `boardGeometry.ts` (+4 helpers), `types.ts` (`Token.size?`), `BoardCanvas.tsx`,
`boardGeometry.test.ts` (+5). Build clean, 169 tests.

## 7. Shared party token on world-scale maps — ✅ DONE
Driven by a DATA flag (keystone), not hardcoded map ids: new `MapType.partyScale` (Solryn sets
it on World / Area / City; Battle/Custom stay tactical). On a party-scale active map:
- **One shared party token** (`kind:'party'`, gold) that **any player** can drag — `canControlToken`
  returns true for `party`, and the RTDB token rule now also allows a member to write a `party`
  token. The GM's client **seeds** the token (single authority → no duplicate-create race); each
  party-scale map gets its own, once.
- **Individual character tokens hidden** (not deleted) — `visibleOnMap` folds `character` tokens
  away on party-scale maps and hides the `party` token on tactical maps; used for draw, hit-test,
  and the collision obstacle set. The player char-token auto-create is skipped on these maps.
- **Soft-lock while dragging** — grab stamps `draggedBy`+`draggedAt`; others can't grab it until
  release. `partyLockHeldByOther` honours the lock but self-heals a crashed drag after
  `PARTY_LOCK_STALE_MS` (8 s). The party token skips movement collision (travel isn't tactical).
- `TokenCard` is suppressed for the party token (no character/stats behind it).

⚠️ **User action — redeploy `database.rules.json`** for players to move the party token live
(the new `kind === 'party'` clause). Until then a player's move is rejected and reverts.
Caveats: the GM must open the board once for the token to appear (GM-seeded by design); live
board behaviour is unverified here (no Firebase egress) — needs an eyeball. Files: `system.ts`,
`world.ts`, `types.ts`, `permissions/index.ts`, `board.ts`, `partyMode.ts` (new), `BoardCanvas.tsx`,
`BoardScreen.tsx`, `database.rules.json`, `partyMode.test.ts` (+8). Build clean, 177 tests.

## ✅ All 7 morning items complete (commits 0696f03 · 79f5975 · df6d22c · 1a45f90 · 21b3732 · 5887d9c · this).
