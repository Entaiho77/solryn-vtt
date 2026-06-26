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

## 5. Rules panel: collapse to names, expand on click (keep search) — ⏳ NEXT
## 6. Token grid-square collision — soft block (pass through, can't land) — ⏳
## 7. Shared party token on world-scale maps — ⏳
