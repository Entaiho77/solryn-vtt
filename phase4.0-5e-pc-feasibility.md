# Phase 4.0 — 5e player-character feasibility map

Investigation only, no code. How the PC side stands today vs. what full SRD 5e PCs require.

## TL;DR
The combat *resolvers* (attack-vs-AC, save-vs-DC) and the *engine plumbing* (modifiers, derived
stats, the builder shell, the Character persistence pipeline) are reusable. But the 5e PC **model
itself does not exist**: there are no classes, levels-with-features, backgrounds, binary
proficiencies, ASIs, or spell slots in the schema. Solryn's character side is **classless-roll**
shaped end-to-end. 5e needs a **new class/level/progression subsystem + a 5e builder flow + a
spellcasting subsystem** — this is genuinely the long pole.

## 1. Solryn character side today — generic shell, Solryn-shaped guts
- **Builder** (`CharacterBuilder` + `builderModel`): a reducer + a **step PLAN generated from the
  system** (`buildStepPlan`) — the *plumbing* is data-driven and reusable. The Welcome→Roll→Race→
  Name→Info(derived)→Skills→Spells→Gear flow auto-sizes from `system` data.
- **But the step KINDS are a fixed union** (`'roll'|'ancestry'|'name'|'info'|'skills'|'spells'|
  'gear'`) and each step component encodes **Solryn mechanics**: `RollStatsStep` = roll-and-lock
  (no rearrange/point-buy), `SkillsStep` = tier categories, `SpellsStep` = Arcana-gated known count.
  The **draft model** is Solryn-shaped: `coreScores, ancestryId, choiceSelections, chosenSkillIds,
  knownSpellIds, equipped*` — **no class, background, proficiencies, ASI, subclass.**
- **Sheet**: `PlaySheet`/`AttacksSection`/`SkillsSection`/`SpellBookOverlay`/`LevelUpCeremony` read
  system data but are built around Solryn's pools (Arcana/Luck), tiered skills, and the dice-roll
  level-up ceremony.
- **Persisted model** (`Character`): `definition{ancestryId, coreScores, chosenSkillIds,
  knownSpellIds}` + `play{level, reputation, pools, skills, equipped*, loadedSpellId}`. No class,
  no multiclass, no slots, no prepared spells, no proficiency lists, no hit dice.

**Verdict:** 5e can reuse the **shell** (StepFrame chrome, the step-plan pattern, `computeModifiers`/
`computeDerived`, the draft→`finalizeCharacter`→`Character` pipeline) but needs its **own step set +
an extended draft + an extended persisted model**. Because class-and-level diverges so far from
classless-roll, treat it as a **5e builder configuration built on shared primitives**, not the same
wizard with different data. (Generalizing the builder to system-supplied step kinds/components is
the clean way to share the shell.)

## 2. SystemDefinition PC-side fields vs. 5e

| Field | 5e need | Status |
|---|---|---|
| `coreStats` | 6 abilities | ✅ as-is (Phase 2a) |
| `modifierRule` | floor((score−10)/2) | ✅ as-is (Phase 2a `ability-modifier`) |
| `ancestries` (races) | speed, size, darkvision, **mechanical traits** (resist/prof/language grants), **subraces**, ASI | ⚠️ **schema extension** — today only ability `bonuses` + advantage/weakness *strings* |
| `skillCategories`/`skills` | 18 fixed skills, each tied to an ability; **binary** proficiency (+expertise); skills granted by class/background, pick N from a class list | ⚠️ **schema + engine** — today tiered "pick N per category"; `SkillMode 'proficiency-bonus'` declared but engine `computeSkillState` is tiered |
| `progression` | per-class tables: hit die, **proficiency bonus by level**, features/level, **ASI at 4/8/12/16/19**, slot progression, subclass level | ❌ **new subsystem** — today `levelBands → stat-increase die` only |
| `casting` | spell slots by class+level, prepared vs known, cantrips, concentration | ❌ **new subsystem** — `'spell-slots'` declared, unimplemented; today Arcana point-pool |
| `creation` | ability-score **method** (standard array / point-buy / 4d6dl), class + background choice, ASI | ⚠️ **extension** — today statOrder/reroll flags/reputation/Solryn `spellAccess` |
| **classes** | hit die, save profs, armor/weapon/tool profs, skill choices, starting equipment, features by level, subclasses, spellcasting block | ❌ **does not exist — new top-level field + the heaviest data** |
| **backgrounds** | skill/tool/language profs, equipment, feature | ❌ **does not exist — new field + data** |

## 3. The Expr / progression gap (foundational)
- `engine/rules/progression.ts` is **31 lines**: only `bandForLevel`/`dieForLevel` (Solryn's
  stat-increase die). It computes **no** proficiency bonus, features, ASI, or slots.
- `Expr` has **no `level` node** (and no floor/div) — flagged in 2a; that's why proficiency bonus is
  a stub `+2`. **But 5e leveling is table-driven, not formula-driven** (features and slots are lookup
  tables, not arithmetic), so the right fix is **a 5e progression module** that reads class tables —
  `proficiencyBonusForLevel(L) = 2 + floor((L−1)/4)`, `featuresForClass(classId, L)`,
  `spellSlotsFor(classId, L)`, `asiLevelsFor(classId)`. An Expr `level` node becomes *optional sugar*,
  not the foundation. **This module + the class data model is the keystone everything else hangs on.**

## 4. Spellcasting
- **Today:** Solryn point-pool (`castingAccess` computes a *known count* from an ability mod; `Spell`
  is lean: `type, damageDice, damageType, cost, range, duration`).
- **5e needs:** per-class **slot tables** by level; **prepared** (Cleric/Druid/Wizard) vs **known**
  (Sorcerer/Bard/Ranger) casters; **cantrips** (scale by character level); **concentration** (one
  active at a time, tracked on the character/token); ritual tags; and a **full SRD spell list** with
  5e fields — level, school, components (V/S/M), casting time, range, duration, save **or** attack,
  damage **scaling by slot level**, area.
- **Cleanest coexistence (no Solryn break):** the `CastingMode` union already allows both ids; add a
  **slot-based path** in the engine alongside the pool path, selected by `modes.casting.id`. **Extend
  `Spell` with optional 5e fields** (additive — Solryn ignores them) rather than forking the type.
- **Ingestion:** reuse the **monster generator pipeline** — `5e-bits/5e-database` has
  `5e-SRD-Spells.json` (same source family as the monsters JSON we already use); a
  `genDnd5eSpells.ts` mirrors `genDnd5eBestiary.ts` → `systems/dnd5e/spells.generated.ts`.
- **Heaviest 5e PC piece after classes** — slots + prepared/known + concentration + per-level damage
  scaling is a subsystem in its own right.

## 5. PC → combat hookup (good news)
- The resolvers (`attackRollVsAc`, `resolveCheck`) take **plain inputs** (`attackBonus`, `targetAc`,
  `dice`, `modifier`, `dc`). A PC can feed them **exactly like monsters do** — *once we can derive*:
  **attack bonus** (proficiency + ability mod + weapon), **AC** (armor + Dex + shield), **save mods**
  (ability mod + proficiency where proficient). `AttacksSection` already routes PC attacks through
  the system resolver (it computes a Solryn weapon bonus today); for 5e it would compute the 5e
  attack bonus instead.
- **So the seam is ready; what's missing is the PC-side derivation** (attack bonus / AC / saves),
  which depends on the class + proficiency + equipment model from §2. Also: a **PC token needs an AC
  stat** so monsters can target it (today monster attacks use a GM-entered AC; a PC token carrying
  `ac` closes that with the existing manual flow).

## 6. Honest phased route (each slice independently shippable)

**Keystone (everything depends on it) — Slice A: class + level + progression core.**
A `classes` schema (hit die, profs, skill choices, save profs) + a `progression` module
(proficiency bonus, ASI levels, HP-by-hit-die) + ability-score method (standard array/point-buy).
No features-text depth yet, no spells. Ships nothing playable alone but unblocks everything.

**Milestone "Minimal Playable PC" (reachable early, no spells) — Slices B+C:**
- **B. 5e builder flow + extended Character model**: a 5e step set (ability scores → race → class →
  background → skills(binary) → equipment), extended draft + persisted definition (classId,
  backgroundId, proficiencies, raceId).
- **C. One martial class end-to-end** (Fighter): AC from armor+Dex, attack bonus, saves, skills,
  HP, **level-up 1–20** (HP + proficiency + ASI). Feeds the combat resolvers from §5; a Fighter PC
  can fight on the board. **This is the early, demoable win.**

**Then breadth (independently shippable each):**
- **D. Races (full traits)** — speed/size/darkvision/resistances/granted profs/subraces.
- **E. Backgrounds** — prof/equipment/feature grants.
- **F. More martial/half-caster classes** — Barbarian/Rogue/Monk/Ranger/Paladin (Ranger/Paladin
  pull in partial spellcasting).
- **G. Spellcasting subsystem** (the second-heaviest): slot tables + prepared/known + cantrips +
  concentration + SRD spell list (generator) + per-slot damage scaling.
- **H. Full casters** — Wizard/Cleric/Druid/Sorcerer/Bard/Warlock (Warlock = pact-magic variant).
- **I. Subclasses, feats** — per-class long tail.
- **J. Multiclassing** (optional, hardest rules) — multiclass slot table, prerequisites.

**Heaviest:** (1) the 12 classes' features/subclasses data, (2) the spellcasting subsystem, (3)
full 1–20 leveling with features. **Lightest early value:** Slice C — a single martial class that
already plugs into the combat we built.

### Recommended build order
A (keystone) → B+C (minimal playable Fighter, the first demoable PC) → D → E → F → G → H → I → J.
Stop-and-review after the A and C milestones especially — A locks the schema everything else uses.
