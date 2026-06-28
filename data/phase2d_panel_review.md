# Phase 2d — merged card moved into the slide-out side panel

## Panel reused
The existing **BoardShell right drawer** — the same slide-out chrome the **Add creature** panel uses (`.drawer`/`.rightDrawer`, 280px, `DrawerHeader` title + ×, `drawerBody` scroll). Not a new panel style: I added an optional `rightPanel` prop to `BoardShell` that renders that same `<aside>`, driven by selection.

## Files changed
- `src/features/board/BoardShell.tsx` — new optional `rightPanel={ title, content, onClose }`; renders the standard right drawer aside (takes the right slot when present).
- `src/features/board/BoardScreen.tsx` — GM creature selection now builds `monsterPanel` and passes it as `rightPanel`; removed the floating TokenCard-shell wrapper. Non-creature/non-GM tokens still use the floating `TokenCard`.
- `src/features/board/drawers/MonsterStatCard.tsx` — panel-friendly layout: attack rows are name-on-its-own-line + dice/type beneath (wrapping, **no `itemName` ellipsis**), **Roll** aligned right at default (touch-friendly) size; abilities list below with wrapping text + optional Roll; HP tracker / DR / Speed kept; Hide/Defeat/Remove kept. Dropped the in-card header (the drawer chrome provides title + close).

## Confirmation
- **No truncation:** names render with wrapping styles (`overflowWrap: anywhere`); `itemName` (the `nowrap + ellipsis` class) is no longer used — verified by grep. The 280px panel gives names/dice their own lines.
- **Rolls still post to the shared log:** attack/ability taps call `post() → postRoll(describeRoll(...))` — unchanged from 2c.
- **Behavior intact:** id-first lookup (fallback name), attacks from `attacks[]`, GM-only (`canSeeMonsterStats`). Opening via map-token click **or** bottom initiative-tracker tap; closing the panel (DrawerHeader ×) calls `onClose → setSelectedId(null)` (deselects).

typecheck clean · 177 tests · build OK.
