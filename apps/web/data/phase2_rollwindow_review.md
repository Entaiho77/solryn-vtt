# Phase 2 — shared roll log + monster stat card

## Files
**New**
- `src/features/rolllog/rollLog.tsx` — `RollLogProvider`, `useRollLog()` (exposes `postRoll`), `describeRoll()` (canonical damage-roll string, from the old `rollWeapon` format), and the `RollLog` window component.
- `src/features/board/drawers/MonsterStatCard.tsx` — the monster card.

**Changed**
- `src/features/game/GamePage.tsx` — wraps the game in `RollLogProvider` (common ancestor of board + sheet).
- `src/features/board/BoardScreen.tsx` — adds a **Log** drawer (`📜`) rendering `RollLog`; passes `system` to `InitiativeDrawer`.
- `src/features/board/drawers/DiceDrawer.tsx` — removed local `history`; now `postRoll(...)` + renders `RollLog`.
- `src/features/sheet/AttacksSection.tsx` — removed local `last`; weapon/spell rolls now `postRoll(describeRoll(...))`.
- `src/features/board/drawers/InitiativeDrawer.tsx` — opens the monster card (tap a creature in turn order, or its **Card** button pre-combat).

## All three sources post to the one shared log ✔
- **Character attacks** (`AttacksSection`) → `postRoll(describeRoll(weapon/spell))`.
- **Free-form dice** (`DiceDrawer`) → `postRoll(...)`.
- **Monster card** (`MonsterStatCard`) → `postRoll(describeRoll(...))`.
Visible in the **Log** drawer (and inside the Dice drawer). Both old local roll states (`AttacksSection.last`, `DiceDrawer.history`) are gone.

## How the card reads attacks
Board tokens only carry flat `stats` (no structured attacks), so the card looks the creature up by name in `system.bestiary` and reads **straight off the Phase-1 `attacks[]`** — each row calls `rollDice(attack.diceExpr)` (clean term) and posts via the same `describeRoll` format as weapons. Read-only HP/DR/Speed come from `entry.stats` (speed string already includes any secondary). Abilities are display-only unless a dice term is detected in the text (e.g. breath weapons), in which case the row gets a **Roll** button using that term.

## Notes / flags
- The log is **client-side per game** (shared across sources, not yet synced table-wide via Firebase) — realtime sync is a clean follow-up.
- Card↔creature link is **by name** (names are unique across the 433); a renamed/custom token with no bestiary match shows "no stat block".
- `AttacksSection.module.css` `.last` class is now unused (left in place; harmless).
