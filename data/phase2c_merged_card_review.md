# Phase 2c — one merged creature card

## Files changed
- `src/features/board/drawers/MonsterStatCard.tsx` — now the merged card: live **HP** tracker (token), **DR**, **Speed**, tappable **attack rows** (roll `attack.diceExpr` → shared log), abilities (tappable only if a dice term is present), and the **GM controls Hide/Defeat/Remove** folded in (rendered when a token + gameId are passed). Controls were *moved* from TokenCard, not duplicated.
- `src/features/board/BoardScreen.tsx` — for `selected.kind === 'creature'` and a GM viewer (`canSeeMonsterStats`), renders `MonsterStatCard` (wrapped in TokenCard's floating `.card` shell) instead of `TokenCard`. Passes `onSelectToken` to the on-screen `InitiativeTracker`.
- `src/features/board/InitiativeTracker.tsx` — added `onSelectToken`; a row tap now **selects that token** (surfacing the card) and still performs the GM turn-jump when applicable.

## Confirmations
- **Both triggers open the one merged card:** a map token click (`BoardCanvas onSelectToken → setSelectedId`) and a bottom-tracker tap (now `onSelectToken → setSelectedId`) both set the selected token, and BoardScreen renders the single `MonsterStatCard` — no stacked pair, no old TokenCard for GM creature view.
- **Hide / Defeat / Remove still work:** moved verbatim into the card (same `updateToken`/`removeToken` calls). Defeat toggles `defeated`, Hide toggles `visible`, Remove deletes + closes.
- **TokenCard preserved** for everything else: character tokens, traps, the player (hidden) view of creatures, and the Loot/Harvest flow — those paths are untouched.

typecheck clean · 177 tests · build OK.

## Note
- Merged card is GM-only (players selecting a creature still get TokenCard's hidden view + loot). Card content (long attack/ability lists) renders inside TokenCard's floating shell; if it overflows on small screens that's a styling follow-up, not a wiring issue.
