# Phase 4 Review

Branch: `claude/eribor-srd-bestiary-port` · typecheck ✓ · 177 tests ✓ · build ✓

## Step 1 — damage-type normalization (commit `c596dd8`)

**Weapons (`equipment.ts`)** — all 28 weapons expanded `B/P/S → Bludgeoning/Piercing/Slashing`
and pulled into a typed const `(WeaponItem & { damageType: DamageType })[]`, so every
value is now checked against the canonical `DamageType` set at build time. The engine
field stays `string` (system-agnostic); the narrowing lives in Solryn data only.

**Spells (`spells.ts`)** — canonical lowercase types Title-cased (`fire → Fire`, etc.);
`off()` now takes `damageType: DamageType`, so the 31 canonical offensive spells are
type-checked too.

**Flagged:** 9 "Adaptive Combat" spells have *descriptive effects*, not single types —
e.g. `"mimics target's last type"`, `"force (ignores resistance)"`, `"radiant (area)"`.
These can't be constrained to `DamageType` without a ruleset decision on how each
resolves. They're isolated behind `offSpecial()` (free string, commented) so they're
easy to find and convert once you decide. Everything else references `DamageType`.

**No reader breaks:** every consumer of `damageType` only *displays* it
(`AttacksSection`, `SpellBookOverlay`, `SpellsStep`, `describeRoll`). Nothing branches
on the letters — grep for `'B'/'P'/'S'` comparisons returns nothing.

## Step 2 — in-app confirm dialog (commit `41e0f5a`)

Added `components/ui/ConfirmDialog.tsx` — a reusable confirm built on the existing
`Modal` (same parchment chrome: dimmed backdrop, Esc/backdrop-to-close, footer
buttons). Props: `title / message / confirmLabel / cancelLabel / destructive /
onConfirm / onCancel`.

Wired both bulk-clear actions in `InitiativeDrawer` (Remove defeated, Clear all
monsters) through a `confirm` pending-action state instead of `window.confirm`.
The dialog is generic — only these two are wired now, per the brief.

`window.confirm` no longer appears in the codebase.
