# Phase 7 Review — searchable/filterable bestiary

Commit `bb40fc0` · branch `claude/eribor-srd-bestiary-port` · typecheck ✓ · 177 tests ✓ · build ✓

## Where the controls live

`AddCreatureDrawer.tsx`, **Bestiary tab** — confirmed the right place (the 433-creature
list). Controls sit above the list: a name search box, a row of two `<select>`s (type,
damage), then a "N of 433" count + a Clear button (shown only when a filter is active). The
Saved and Build tabs are untouched.

## Data check (across all 433)

- Every creature has `stats.type` (0 missing) and `category: "creature"`. ✓
- Attack `damageType` values = **exactly the 14 canonical** (Acid, Arcane, Bludgeoning, Cold,
  Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder). ✓

### Distinct creature types found — 20

| Standard (SRD conversions) | Native one-offs (the 10 starters) |
|---|---|
| Aberration ·6, Beast ·124, Celestial ·6, Construct ·19, Dragon ·56, Elemental ·18, Fey ·8, Fiend ·23, Giant ·10, Humanoid ·57, Monstrosity ·48, Ooze ·5, Plant ·6, Swarm of Tiny Beasts ·10, Undead ·31 | Insectoid Caster ·1, Predator ·1, Shadow Beast ·1, Spirit ·2, Spirit Beast ·1 |

**Flag (didn't block):** the SRD conversions use the standard ~15-type scheme; the native
starters add five bespoke, more-descriptive types (Insectoid Caster, Predator, Shadow Beast,
Spirit, Spirit Beast). Per the design ("a selector of the *actual* distinct types present"),
the type dropdown is populated directly from the data, so these coexist cleanly — no guessing
or remapping. If you later want the natives normalized onto the standard scheme, that's a
data edit in `bestiary-source.json`, separate from this UI.

## Behavior

- **Name search** — live, case-insensitive substring match on creature name.
- **Type filter** — dropdown of the 20 distinct types; shows only that type.
- **Damage filter** — dropdown of the 14 damage types; shows creatures with an attack of that
  type (`attacks.some(a => a.damageType === pick)`).
- **Independent & exclusive** — using any one clears the other two (`onChange` resets the
  others); only one is ever active. **Clear** resets all to the full 433.
- Live updates, no search button. Empty result shows "No creatures match."
- **Placement unchanged** — `+ Place` still calls `placeStatBlock(name, category, stats, id)`;
  filtering only narrows what's rendered.

### Spot-checks (against the 433-entry counts)
- Type "Ooze" → 5 results · "Dragon" → 56 · "Beast" → 124.
- Damage "Radiant" → creatures with a radiant attack (2 attacks across the set) · "Piercing"
  → the large majority · "Arcane" → 1.
- Name "drag" → all dragons/drag* by substring.
Each narrows correctly and Clear restores the full list.
