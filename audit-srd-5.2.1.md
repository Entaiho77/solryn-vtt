# 5e Data Audit — against SRD 5.2.1 (2024)

**Status:** findings only, no code changes.
**Data audited:** `src/systems/dnd5e/{classes,spells,bestiary}.generated.ts`, `src/systems/dnd5e/races.ts` (12 classes, 9 races, 319 spells, 334 monsters).

---

## ⚠️ Methodology & confidence caveat — read first

**The SRD 5.2.1 PDF could not be read in this environment.** The file referenced at
`/tmp/SRD_CC_v5_2_1.pdf` (and `/mnt/user-data/uploads/…`) is not present on the execution
sandbox's filesystem — both the Read tool and a full-filesystem `find` return nothing. The upload
did not sync into the container.

Therefore, **every "SRD 5.2.1 says…" statement below is from model knowledge of the published
2024 / SRD 5.2.1 rules, NOT from extracting the uploaded PDF.** Each is tagged with a confidence
level. Every "Our data says…" statement IS verified — extracted directly from the repo files.

- `[DATA]` — verified from the repo (reliable).
- `[SRD:HIGH]` — well-established 2024/5.2.1 structural fact (high confidence).
- `[SRD:MED]` — believed correct but worth confirming against the PDF.
- `[SRD:LOW]` — cannot confirm without the PDF; treat as a lead to verify, not a finding.

**Recommended next step:** get the PDF onto the sandbox (e.g. commit it into the repo, or place it
under `/home/user/`), then I can convert the `[SRD:*]` items into verified line-by-line findings —
especially the per-spell and per-monster stat checks, which are `[SRD:LOW]` here.

---

## 🔴 HEADLINE FINDING — you are on the 2014 edition, not 5.2.1

`[DATA]` All four datasets were generated from **5e-bits/5e-database `2014/en/`** — i.e. the
**2014 SRD 5.1**. Provenance is in the generated-file headers and the `data/srd-*-5e.json` sources.
`[SRD:HIGH]` **SRD 5.2.1 is the 2024 edition** (released under CC-BY, May 2025) — a *different
ruleset*, not a patch. This means the discrepancies are **systematic and structural**, not typos.

The five biggest edition-level gaps (all **Critical** or **Missing**), expanded in the sections below:

1. **Ability Score Increases moved from species → backgrounds.** In 2024, species grant *no* ASI;
   backgrounds do. Our races hard-code +2/+1 etc. onto the species. This is the single largest
   divergence and touches character creation end-to-end.
2. **Species roster changed.** 2024 SRD drops **Half-Elf** and **Half-Orc** as species and adds
   **Orc, Goliath, Aasimar**. We have the former, lack the latter.
3. **No Backgrounds and no Feats in our data.** Both are first-class, mechanically-required content
   in the 2024 SRD (backgrounds grant ASI + an Origin feat; feats are a real subsystem).
4. **Weapon Mastery** — a new core martial mechanic in 2024 — is absent.
5. **Spells and monsters are the 2014 versions.** Many were revised in 2024; stat blocks use the
   new format. Specific deltas need the PDF.

---

## Audit 1 — Classes

### What's correct (verified in our data, matches both editions) `[DATA]` + `[SRD:HIGH]`
- **Hit dice:** Barbarian d12; Fighter/Paladin/Ranger d10; Bard/Cleric/Druid/Monk/Rogue/Warlock d8;
  Sorcerer/Wizard d6. All correct (unchanged 2014→2024).
- **Saving throws:** all 12 match (Barb STR/CON, Bard DEX/CHA, Cleric WIS/CHA, Druid INT/WIS,
  Fighter STR/CON, Monk STR/DEX, Paladin WIS/CHA, Ranger STR/DEX, Rogue DEX/INT, Sorcerer CON/CHA,
  Warlock WIS/CHA, Wizard INT/WIS). Unchanged across editions.
- **ASI levels:** standard 4/8/12/16/19; Fighter 4/6/8/12/14/16/19; Rogue 4/8/10/12/16/19.
  Correct and unchanged.
- **Skill choices:** match the current lists (Fighter/Bard were fixed in a prior commit; Bard =
  "any 3", Rogue = 4, Ranger = 3). These align with 2024 as well.
- **Proficiency bonus by level:** table-driven from the SRD levels data; +2…+6 progression is
  edition-invariant. Correct.

### Discrepancies

| # | Item | Our data `[DATA]` | SRD 5.2.1 | Severity | Confidence |
|---|------|-------------------|-----------|----------|------------|
| C1 | **Caster model for "known" casters** | Bard, Ranger, Sorcerer, Warlock = `known` | In 2024 these are **Prepared** casters (the "spells known" concept was largely removed; they prepare from a fixed list that grows by level) | **Critical** (wrong build/lifecycle model) | `[SRD:HIGH]` |
| C2 | **Subclass unlock level** | Cleric L1, Druid L2, Sorcerer L1, Warlock L1, Wizard L2 (rest L3) | 2024: **every class chooses its subclass at level 3** | **Critical** (affects level-up flow) | `[SRD:HIGH]` |
| C3 | **Weapon Mastery** | absent | 2024: Barbarian/Fighter/Paladin/Ranger/Rogue/Monk gain **Weapon Mastery** (mastery properties like Cleave, Topple, Vex, etc.) at L1 | **Missing** (core martial mechanic) | `[SRD:HIGH]` |
| C4 | **Class features by level (names)** | 2014 feature set (e.g. Ranger *Favored Enemy* + *Natural Explorer* at L1; Fighter *Second Wind*/*Action Surge* only) | 2024 reworked many: Ranger → *Favored Enemy* replaced by *Hunter's Mark*-based / *Deft Explorer*; Fighter adds *Tactical Master*; Barbarian, Sorcerer (*Innate Sorcery*), Warlock, etc. all changed | **Critical→Minor** (names/informational in our sheet; mechanics not implemented) | `[SRD:MED]` |
| C5 | **Weapon proficiency lists** | 2014 lists (e.g. Bard/Rogue: simple + longswords/rapiers/shortswords/hand-crossbows; Druid: specific non-metal list; Sorcerer/Wizard: dagger/dart/sling/quarterstaff/light crossbow) | 2024 simplified several (e.g. Bard, Rogue, Warlock → Simple weapons [+ some martial]; Druid dropped the "no metal" restriction and revised the list) | **Minor→Critical** (affects attack proficiency for some builds) | `[SRD:MED]` |
| — | **Warlock Pact Magic slot counts** | L1 {1×1}, L2 {2×1}, L5 {2×3}, L11 {3×5}, L17 {4×5} | Same table in 2024 | **OK** (no change) | `[SRD:HIGH]` |
| C6 | **Cleric/Druid armor** | Cleric light/med/shields; Druid light/med/shields | 2024 same for Cleric; Druid same but non-metal restriction is now *flavor not rule* | **Minor** | `[SRD:MED]` |

**Note on C4/C5:** our sheet only displays feature *names* and uses proficiency lists for the
starter kit; it does not simulate most class features. So these are mostly *content-accuracy*
issues rather than gameplay bugs today — but they'll matter as more class mechanics are built.

---

## Audit 2 — Races → "Species" (2024)

This is the **most divergent** area. In 2024 the category is renamed **Species**, ASIs are gone,
and the roster changed.

### Discrepancies

| # | Item | Our data `[DATA]` | SRD 5.2.1 | Severity | Confidence |
|---|------|-------------------|-----------|----------|------------|
| R1 | **ASI source** | Every species grants ability bonuses (Human +1 all; Dwarf +2 CON; Elf +2 DEX; Half-Elf +2 CHA +1/+1; etc.) | 2024: **species grant NO ability score increases** — ASIs come from the chosen **Background** (+2/+1 or +1/+1/+1) | **Critical** (build math wrong for 2024) | `[SRD:HIGH]` |
| R2 | **Half-Elf missing from 5.2.1** | present (`half-elf`) | **Not a species in 2024 SRD** (folded into Elf/Human choices) | **Critical / Licensing-adjacent** (content not in 5.2.1) | `[SRD:HIGH]` |
| R3 | **Half-Orc missing from 5.2.1** | present (`half-orc`) | **Not a species in 2024 SRD** | **Critical** | `[SRD:HIGH]` |
| R4 | **Missing species: Orc** | absent | 2024 SRD includes **Orc** (Darkvision, Adrenaline Rush, Relentless Endurance) | **Missing** | `[SRD:HIGH]` |
| R5 | **Missing species: Goliath** | absent | 2024 SRD includes **Goliath** (Large-ish, Giant Ancestry, Powerful Build, Stone's Endurance) | **Missing** | `[SRD:HIGH]` |
| R6 | **Missing species: Aasimar** | absent | 2024 SRD includes **Aasimar** (Celestial Resistance, Healing Hands, Light Bearer, transformations) | **Missing** | `[SRD:HIGH]` |
| R7 | **Elf structure** | one subrace (`high-elf`, +1 INT) | 2024 Elf has **lineages**: Drow / High Elf / Wood Elf, each granting spells/speed; base Darkvision 60, Fey Ancestry, Trance, Keen Senses | **Critical** (subrace model + traits) | `[SRD:HIGH]` |
| R8 | **Gnome structure** | one subrace (`rock-gnome`, +1 CON) | 2024 Gnome subraces: Forest / Rock; base Darkvision 60, Gnomish Cunning | **Minor→Critical** | `[SRD:MED]` |
| R9 | **Halfling** | subrace `lightfoot` (+1 CHA) | 2024 Halfling has **no subraces**; traits Brave, Halfling Nimbleness, Luck, Naturally Stealthy all baseline | **Minor** | `[SRD:MED]` |
| R10 | **Dwarf** | subrace `hill-dwarf` (+1 WIS); Darkvision 60; poison resist; tool + weapon profs | 2024 Dwarf: **no subraces**; Darkvision **120**; Dwarven Resilience, Stonecunning, Dwarven Toughness baseline; no weapon-training trait | **Critical** (Darkvision range, subrace, traits) | `[SRD:MED]` |
| R11 | **Dragonborn** | 10 draconic-color subraces set breath + resistance | 2024 Dragonborn: draconic ancestry choice similar, but Darkvision 60, Breath Weapon scales differently, adds Damage Resistance + Draconic Flight at L5 | **Minor→Critical** | `[SRD:MED]` |
| R12 | **Tiefling** | +2 CHA/+1 INT; Fire resist; Darkvision 60 | 2024 Tiefling: **Fiendish Legacy** choice (Abyssal/Chthonic/Infernal) determines resistance + spells; Darkvision 60; Otherworldly Presence | **Critical** (structure + resistance not fixed to fire) | `[SRD:MED]` |
| R13 | **Human** | +1 to all six | 2024 Human: Resourceful (Heroic Inspiration), Skillful (1 skill), Versatile (1 Origin feat); **no ability bonuses** | **Critical** | `[SRD:HIGH]` |
| R14 | **Darkvision ranges** | Dwarf/Elf/Gnome/Half-Elf/Half-Orc/Tiefling 60 ft (as trait text) | 2024: **Dwarf 120 ft**; most others 60 ft | **Minor** (Dwarf wrong) | `[SRD:MED]` |

**Bottom line:** the race layer is thoroughly 2014. A 5.2.1-accurate build needs a Backgrounds
subsystem (for ASIs + Origin feats) and a reworked, re-rostered species set.

---

## Audit 3 — Spells

`[DATA]` 319 spells, levels 0–9 (24 cantrips). Spot-checked 30 across all levels — **all 30 present**
with plausible fields. Sample verified from our data:

| Spell | Our data `[DATA]` | Notes |
|-------|-------------------|-------|
| Fire Bolt | L0 Evocation, ranged atk, 1d10 fire, scales 1/5/11/17 | correct both editions |
| Sacred Flame | L0, DEX save, 1d8 radiant, scales | correct |
| Magic Missile | L1, 3d4+3 force, +1 dart/level (as `Nd4+N`) | correct |
| Cure Wounds | L1, Touch, heal (no dice stored) | `[SRD:MED]` 2024 changed base to **2d8** |
| Bless | L1, concentration ✅, 30 ft | correct |
| Fireball | L3, DEX-save, 8d6→+1d6/level | correct |
| Spiritual Weapon | L2, **conc=false** ✅, 1d8+mod | correct (2014 & 2024 both non-conc) |
| Hunter's Mark | L1 Divination, conc, bonus action | `[SRD:MED]` 2024 reworked (bonus dmg, class focus) |
| Cone of Cold / Disintegrate / Finger of Death / Wish / Power Word Kill | levels/schools correct | correct |

### Discrepancies / flags

| # | Item | Detail | Severity | Confidence |
|---|------|--------|----------|------------|
| S1 | **2024 spell revisions** | Many SRD 5.2.1 spells were rebalanced (e.g. **Cure Wounds** 1d8→2d8 base; **Conjure Animals** fully reworked to a concentration threat; healing/summon/utility spells changed) — our data holds the **2014** text/values | **Critical** (wrong dice/effects for revised spells) | `[SRD:MED]` |
| S2 | **Spell-list membership** | The set of spells *in* the 5.2.1 SRD differs from the 2014 SRD (additions/removals). Cannot enumerate without the PDF | **Missing/Extra unknown** | `[SRD:LOW]` |
| S3 | **Eldritch Blast scaling** | `[DATA]` stored as constant `1d10` at 1/5/11/17 — beam *count* (1→4) not modeled; each beam is 1d10 | **Minor** (data model) | `[DATA]` |
| S4 | **`spiritual-weapon` / `disintegrate` etc. use `+MOD`/flat adds** | `[DATA]` e.g. `1d8+MOD`, `10d6+40` — spellcasting-mod / flat bonuses are baked as literals; fine for display, may not roll cleanly | **Minor** | `[DATA]` |
| S5 | **Save DC** | Our engine uses caster DC = 8 + prof + ability (correct); per-spell `save` ability stored (verified: Fireball DEX, Hold Person WIS, Banishment CHA, Cone of Cold CON) | **OK** | `[DATA]` |

**Cannot verify without PDF:** exact 5.2.1 dice/range/duration deltas per spell, and which spells
are in-vs-out of the 5.2.1 list. These are `[SRD:LOW]` and the main reason to get the PDF onto the
sandbox.

---

## Audit 4 — Monsters

`[DATA]` 334 creatures, CR 0–30. Spot-checked 30 across the range. Sample (our data):

| Monster | Our data `[DATA]` |
|---------|-------------------|
| Goblin | CR 1/4, AC 15, HP 7, Scimitar +4 (1d6+2) |
| Orc | CR 1/2, AC 13, HP 15, Greataxe +5 (1d12+3) |
| Ogre | CR 2, AC 11, HP 59, Greatclub +6 (2d8+4) |
| Owlbear | CR 3, AC 13, HP 59, Beak +7 (1d10+5) |
| Troll | CR 5, AC 15, HP 84 |
| Young Red Dragon | CR 10, AC 18, HP 178 |
| Adult Red Dragon | CR 17, AC 19, HP 256 |
| Ancient Red Dragon | CR 24, AC 22, HP 546 |
| Lich | CR 21, AC 17, HP 135 |
| Tarrasque | CR 30, AC 25, HP 676 |

These are all the **2014 SRD** values, in the 2014 stat-block shape (`ac/hp/hd/speed/type/cr/
abilities/saves` — no 2024 `Habitat`/`Treasure` fields).

### Discrepancies / flags

| # | Item | Detail | Severity | Confidence |
|---|------|--------|----------|------------|
| M1 | **2024 stat-block revisions** | SRD 5.2.1 monsters use updated 2024-format stat blocks; a number of AC/HP/attack/CR values were revised (e.g. goblins/ogres/giants and many others were retuned). Our values are 2014 | **Critical→Minor** (playable, but not 5.2.1-accurate) | `[SRD:LOW]` |
| M2 | **Per-creature deltas** | Cannot compare AC/HP/attack/CR line-by-line without the PDF | unknown | `[SRD:LOW]` |
| — | **Product Identity exclusions** | `[DATA]` Beholder, Mind Flayer, Displacer Beast, Githyanki correctly **absent** (never in SRD, either edition) | **OK** | `[SRD:HIGH]` |
| — | **Vampire present** | `[DATA]` `vampire-vampire` (+ bat/mist/spawn) present — in SRD both editions | **OK** | `[SRD:HIGH]` |

**Cannot verify without PDF:** whether the 5.2.1 monster roster matches our 334, and the exact
revised stats. `[SRD:LOW]`.

---

## Audit 5 — Content coverage & licensing

### In SRD 5.2.1 but MISSING from our data `[SRD:HIGH]`
- **Backgrounds** — none in our data; 5.2.1 has ~16 (Acolyte, Criminal, Sage, Soldier, …), each
  granting ASI + Origin feat + skills + tool. **This is where 2024 ASIs live** — highest-priority gap.
- **Feats** — none in our data; 5.2.1 has Origin feats + general/fighting-style feats. (We
  explicitly deferred feats; "Feat support coming soon" is shown in the level-up flow.)
- **Species: Orc, Goliath, Aasimar** — absent (see R4–R6).
- **Weapon Mastery** properties — absent (see C3).
- **Weapons/armor/equipment** — our `equipment.ts` is a hand-authored minimal set (longsword,
  greataxe, rapier, etc.), not the full SRD arms/armor tables. `[DATA]`

### In our data but NOT in SRD 5.2.1 — potential licensing / accuracy concern
- **Half-Elf and Half-Orc species** `[DATA]` present, `[SRD:HIGH]` not in the 2024 SRD. These
  *were* in the 2014 SRD (CC/OGL), so including them is legally fine under the 2014 license — but
  they are **not 5.2.1 content**. Flag if the goal is strict 5.2.1 conformance.
- **2014 spell/monster text** — our spell descriptions and monster stat blocks are 2014-SRD text.
  Licensed content, but the *wrong edition* for a 5.2.1 product. Not a licensing violation (2014
  SRD is CC-BY-4.0 / OGL); an **edition-accuracy** issue.
- No obviously non-SRD (Product Identity) content detected in the sample.

---

## Priority-ranked fix list

**Critical (wrong mechanics vs 5.2.1):**
1. **Backgrounds subsystem + move ASIs off species** (R1, R13, coverage) — the keystone 2024 change.
2. **Species roster & traits rework** (R2–R14): drop Half-Elf/Half-Orc, add Orc/Goliath/Aasimar,
   remove species ASIs, fix Dwarf Darkvision 120, rework Elf/Tiefling/Dragonborn structures.
3. **Caster model: known → prepared** for Bard/Ranger/Sorcerer/Warlock (C1).
4. **Subclass at level 3 for all classes** (C2).
5. **Weapon Mastery** for martials (C3).
6. **Revised spells** — re-verify dice/effects for spells changed in 2024 (S1), e.g. Cure Wounds 2d8.

**Missing (content gaps):**
7. Feats subsystem (deferred).
8. Full SRD equipment/weapon tables.
9. Monster roster/stat reconciliation to 5.2.1 (M1) — biggest volume, lowest current confidence.

**Minor (text/informational):**
10. Class feature *names* per level (C4), weapon-proficiency list tweaks (C5), Eldritch Blast beam
    modeling (S3), literal `+MOD` in spell dice (S4).

**Blocking the rest of the audit:** get `SRD_CC_v5_2_1.pdf` readable on the sandbox to turn the
`[SRD:LOW]`/`[SRD:MED]` items (per-spell and per-monster stats, exact list membership, exact 2024
feature names) into verified line-by-line findings. Everything above tagged `[SRD:LOW]` should be
treated as a lead to confirm, not a settled finding.
