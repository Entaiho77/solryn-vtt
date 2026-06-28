# Phase 2b — stat card lookup by stored bestiary id

## Field added
- `Token.creatureId?: string` (`src/data/types.ts`) — the bestiary entry id the token was placed from. Optional, so existing tokens (and built/custom ones) are unaffected.

## Where it's stored
- `AddCreatureDrawer.placeStatBlock(..., creatureId?)` now accepts and writes it. The **Bestiary** "+ Place" passes `b.id`. **Build** and **Saved** placements pass nothing (no bestiary id → stays undefined).

## Where id-lookup happens
- `MonsterStatCard` resolves the entry **by `creatureId` first, then falls back to name match**:
  `system.bestiary.find(b => b.id === creatureId) ?? system.bestiary.find(b => b.name === name)`.
- `InitiativeDrawer` passes `creatureId` to the card from the token: pre-combat from `t.creatureId`; in turn order from the combatant's `tokenId` → `game.tokens[tokenId].creatureId`.

## Confirmation
- **(a) Renamed/duplicated token keeps its card** — lookup is by `creatureId`, fully independent of `Token.name`. "Goblin A" / "Goblin B" placed from the Goblin entry both resolve to the Goblin stat block.
- **(b) Old name-only tokens still resolve** — tokens placed before this change have no `creatureId`, so the card falls back to the existing name match. Nothing breaks.

typecheck clean · 177 tests · build OK. Files: `data/types.ts`, `AddCreatureDrawer.tsx`, `MonsterStatCard.tsx`, `InitiativeDrawer.tsx`.
