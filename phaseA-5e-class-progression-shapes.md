# Phase A — 5e class/level/progression core (locked shapes for review)

Foundation only: data shapes + the progression module + Fighter as proof. No builder, no
sheet, no UI. Solryn untouched. **Review and approve these shapes before Phase B/C builds on them.**

## Investigation (confirmed)
- `engine/rules/progression.ts` is **31 lines** — `bandForLevel`/`dieForLevel` only (Solryn's
  classless stat-increase die). Untouched this phase.
- PC-side schema before this phase: `CreationConfig` = statOrder + reroll flags + reputation +
  Solryn `spellAccess`; `ProgressionMode` = `levelBands`; `Ancestry` = `bonuses` + advantage/weakness
  strings; `Skill` has an optional `attribute` (governing ability) — already enough for 5e skills.
- **5e leveling is table-driven** (proficiency bonus, ASI levels, features, slots are per-level
  lookups), so the **Expr `level` node is NOT required**. Locked as lookup tables per class.

## Locked shapes (`engine/schema/system.ts`)

**`ClassLevel`** — one row of a class's 1–20 table (all grants are lookups here):
`level, proficiencyBonus, features[], abilityScoreImprovement?, spellSlots?[], cantripsKnown?,
spellsKnown?, counters?{}` (counters = class scaling like `{ rages: 3, sneakAttack: "3d6", ki: 5 }`).

**`ClassDefinition`** — `id, name, description?, hitDie, primaryAbilities[], savingThrows[],
proficiencies{armor[],weapons[],tools[]}, skillChoices{choose,from}, startingEquipment[],
spellcasting?{ability,type:'prepared'|'known',ritual?}, levels: ClassLevel[], subclassLevel?,
subclasses?[]`.

**`BackgroundDefinition`** — `id, name, description?, skillProficiencies[], toolProficiencies?,
languages?, equipment?, feature?{name,description}`.

**`AbilityScoreMethod`** = `'standard-array' | 'point-buy' | 'roll' | 'manual'`.

**Extended existing fields (all additive/optional → Solryn unaffected):**
- `SystemDefinition`: new optional `classes?: ClassDefinition[]`, `backgrounds?: BackgroundDefinition[]`.
- `CreationConfig`: optional `abilityScoreMethod?`, `standardArray?`, `pointBuyBudget?`.
- `Ancestry`: optional 5e race fields `speed?`, `size?`, `traits?[]`, `grantedProficiencies?[]`, `subraces?[]`.
- `ProgressionMode`: unchanged — 5e uses `{ id: 'class-and-level' }` and the real tables live on
  `classes[].levels` (note: 5e's proficiency bonus is the same across classes, but it's kept in each
  class's table per the agreed shape, so variants/multiclass can differ later).

## Progression module (`engine/rules/classProgression.ts`)
Generic, pure, table-driven; reads `ClassDefinition`; **does not touch Solryn's `progression.ts`**.
Ability modifiers are passed IN (computed via the system's `modifierRule`) so the module stays
system-agnostic. Outputs (the numbers a PC needs, including the ones that feed the resolvers):

| Function | Returns |
|---|---|
| `classLevel(cls, L)` | the (clamped 1–20) level-table row |
| `proficiencyBonus(cls, L)` | +2 … +6 |
| `cumulativeFeatures(cls, L)` | all features from levels 1..L |
| `asiLevels(cls)` / `asiCount(cls, L)` | ASI levels / count so far |
| `maxHitPoints(cls, L, conMod)` | hit-die max + CON at L1, hit-die average + CON each level after |
| `attackBonus(abilityMod, profBonus, proficient?)` | **→ `attackRollVsAc.attackBonus`** |
| `saveModifier(cls, ability, abilityMod, profBonus)` | mod + prof where the class is proficient **→ `resolveCheck.modifier`** |
| `armorClass(dexMod, armor?{baseAc,maxDexBonus})` | unarmored 10+Dex, or base+capped Dex **→ `attackRollVsAc.targetAc`** |

These are exactly the inputs the Phase 2b/3 resolvers already accept — so a PC plugs into the
combat we built once Phase C computes its ability mods + equipment.

## Fighter populated (proof the shapes hold end-to-end)
`systems/dnd5e/classes/fighter.ts` — full 1–20 table: `hitDie d10`, saves `STR/CON`, all-armor +
shields + simple/martial weapons, `skillChoices {choose:2, from: [8 fighter skills]}`, features per
level (Fighting Style + Second Wind @1, Action Surge @2, Martial Archetype @3, Extra Attack @5,
Extra Attack(2) @11, Extra Attack(3) @20, Indomitable scaling, etc.), and the distinctive Fighter
**ASIs at 4/6/8/12/14/16/19**. Also wired: the **18 standard 5e skills** (each with its governing
ability) and `creation.abilityScoreMethod='standard-array'` (+ point-buy budget) on the 5e system.
`classes:[fighter]`, `backgrounds:[]`, `ancestries:[]` (races/backgrounds defined-but-minimal).

**Verified** (8 tests): prof bonus +2@L1/+3@L5/+4@L9/+5@L13/+6@L17; Extra Attack appears at L5 not L4;
ASI levels exactly `[4,6,8,12,14,16,19]`, count 3 by L8 / 7 by L20; HP d10+CON (12 @L1, 44 @L5 with
CON+2); proficient saves add prof bonus, others don't; attack bonus = mod+prof; AC unarmored/capped/
plate/uncapped. Full suite **219 green**.

## Flags — 5e mechanics the shapes can't yet express (for later)
1. **Subclass features** — `subclasses[]` lists options but has no per-subclass level table; Fighter's
   subclass features are generic "Martial Archetype feature" placeholders. Needs a subclass table.
2. **Feats** — `abilityScoreImprovement` flags the level, but feat *data*/the ASI-or-feat choice isn't modeled.
3. **Pact Magic (Warlock)** — `spellSlots[]` assumes standard slots; Warlock's short-rest pact slots
   need a casting-mode variant.
4. **Resource recovery** — `counters` holds counts (rages/ki/superiority dice) but not short/long-rest
   recovery rules.
5. **Prepared-caster spell count** — prepared casters compute "spells prepared = level + ability mod";
   that's a formula, not a table value, so it's computed in the casting subsystem (Phase G), not here.
6. **Starting equipment** is display strings, not structured grants (Phase C/equipment refinement).
7. **Multiclassing** — the persisted character model is still single-class; multiclass slot tables +
   prereqs are out of scope (Phase J).

## Solryn untouched
New schema fields are all optional; Solryn sets none of them. New module is a separate file; Solryn's
`progression.ts`, builder, sheet, and their tests are unchanged and green. The 5e progression is
selected by `modes.progression.id === 'class-and-level'` (B/C will branch on it), never replacing Solryn's.
