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

## 3. Grid + measure line color toggle (white/black, one toggle, session-only) — ⏳ NEXT
## 4. Token click-priority / stacking — ⏳ (investigate first)
## 5. Rules panel: collapse to names, expand on click (keep search) — ⏳
## 6. Token grid-square collision — soft block (pass through, can't land) — ⏳
## 7. Shared party token on world-scale maps — ⏳
