# Phase 3 — bulk token clearing

## Reused remove call
`removeToken(gameId, tokenId)` (`src/data/board.ts`) — the same single-token Firebase delete the MonsterStatCard "Remove" uses. Bulk actions just **loop it** over the matched tokens; no new deletion path.

## Where the buttons live
A **"Board cleanup"** section in the **GM-only `InitiativeDrawer`** (it already hosts the combat/creature controls). Shown in both the pre-combat and combat-running states; **not** wired to End Combat — both are manual.

## The two actions (GM, manual, confirm before removing)
- **Remove defeated** — removes every token with `defeated === true`.
- **Clear all monsters** — removes every `kind === 'creature'` token.

Each is scoped to the **active map**, asks `window.confirm` first, then loops `removeToken`.

## Confirmations
- **Characters & party survive "Clear all monsters":** predicate is strictly `kind === 'creature'`; character tokens (`'character'`) and the party token (`'party'`) don't match (traps `'trap'` are also left).
- **Initiative stays consistent:** after removal, `removeCombatantsByToken(gameId, init, ids)` (new helper in `data/combat.ts`) filters those token-backed combatants out of `initiative.order` and adjusts `turnIndex` (decrement by combatants removed before the cursor; clamp into range) — no ghost combatants left in the tracker.

Files: `src/data/combat.ts`, `src/features/board/drawers/InitiativeDrawer.tsx`. typecheck clean · 177 tests · build OK.
