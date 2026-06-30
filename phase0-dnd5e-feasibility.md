# Phase 0 — D&D 5e SRD engine feasibility map

Investigation only, no code. Findings about the current engine and what a `systems/dnd5e/` would need.

## 1. Engine / system split — very clean

| Layer | Holds | 5e impact |
|---|---|---|
| `engine/schema/` | The `SystemDefinition` contract (`system.ts`) + the **modes menu** (`modes.ts`). | The shape a system must satisfy. |
| `engine/rules/` | Pure functions reading system data generically: `dice`, `expr-eval`, `derived`, `modifiers`, `skills`, `progression`, `casting`, `harvest`. **No Solryn rule hardcoded.** | Where new 5e primitives go. |
| `systems/solryn/` | Data files assembled in `index.ts` into one `SystemDefinition`. | `systems/dnd5e/` mirrors this. |
| `systems/registry.ts` | `id → SystemDefinition` map; `getSystem` / `requireSystem` / `listSystems`. | Register dnd5e here = it appears everywhere. |

**The registry expects a full `SystemDefinition`** — all fields required: `id, name, glyph, color, version, modes, coreStats, modifierRule, derivedStats, ancestries, skillCategories, skills, spells, equipment, mapTypes, qualityScale, statBlockShapes, bestiary, rulesReference, conditions, creation`. A 5e system must supply every field (some minimal/empty).

**The modes menu already reserves 5e slots** (declared, unimplemented):
`CombatModeId` includes `'attack-roll-vs-ac'` · `CastingModeId` includes `'spell-slots'` · `ProgressionModeId` includes `'class-and-level'` · `SkillModeId` includes `'proficiency-bonus'`.

## 2. How actions resolve today — there is **no central combat resolver**

`engine/rules/` has **no `resolveAttack`**. A Solryn attack resolves entirely in the UI:
`AttacksSection.rollWeapon` → `rollDice(damageDice)` → `describeRoll(...)` → `postRoll` to the shared log. **No to-hit roll, no automated DR subtraction, no HP application.** DR is only *displayed* on the monster card; HP is adjusted by hand via the `ResourceTracker`.

→ "auto-hit-vs-dr" is currently a **label nothing branches on**. Consequence: there's almost no shared combat code for 5e to collide with — but also **no resolver seam to slot into; it must be created.** This is the single most important architectural fact.

## 3. 5e primitive gap

| 5e mechanic | Status | Notes |
|---|---|---|
| d20 attack vs AC (can miss) | **Not at all** | d20 is rollable; the hit/miss *resolution* (d20+mods ≥ AC) doesn't exist. Needs the resolver. |
| Saving throws vs DC | **Not at all** | No roll-vs-DC path. `AttackEntry.save?` field exists as data; no logic rolls/applies it. |
| Advantage / disadvantage | **Partial** | `rollHighest(notation, times)` covers **advantage**; no "take lowest" — disadvantage is a trivial `rollLowest` add. |
| Action economy (action/bonus/reaction/move) | **Not at all** | Initiative tracks turns/rounds; no per-turn action budget. (Solryn's `perTurnSpend:'level'` is a spend cap, not action economy.) |
| Spell slots & concentration | **Not at all** | Casting is point-pool only; `'spell-slots'` mode declared but unimplemented; concentration has no representation. |
| Formal conditions w/ effects | **Partial** | `ConditionEntry` exists but is **reference text only**; no token condition state, no applied mechanics. |
| Proficiency / ability mods / skill checks | **Partial** | Ability mod `floor((score−10)/2)` ≠ the current `linear-step` `ModifierRule` (which steps from 0) → needs a **new ModifierRule variant**. Proficiency bonus = level table → expressible as a `DerivedStat`/data; `SkillMode` already declares `'proficiency-bonus'`. The *check* (d20 vs DC) shares the missing save resolver. |

## 4. Coexistence — both models, per system

**Yes, cleanly.** Because nothing branches on `modes.combat.id` today, there's no auto-hit code to break.

**Recommended architecture: a per-system `CombatResolver` interface**, selected by `modes.combat.id`:
- `resolveAttack(attacker, target, weapon/attack) → { hit?, rolls, damage, breakdown }`
- impl `autoHitVsDr` = wraps **today's exact behavior** (roll damage, no to-hit) → Solryn regression-proof.
- impl `attackRollVsAc` = d20 + mods vs AC → hit/miss + damage.
- The UI calls the system-selected resolver instead of inlining `rollDice`.

**Collision points (low risk, all UI-side):** `AttacksSection.tsx` and `MonsterStatCard.tsx` inline `rollDice + describeRoll + postRoll`; `describeRoll` assumes a damage-only line (no hit/miss). The refactor is *extracting* that inline roll into the `autoHitVsDr` resolver so both systems pass through one seam. Initiative/turn tracking, HP application, board/tokens/log are system-agnostic and **safe**.

## 5. SRD content pipeline

**Reusable asset:** the existing `data/bestiary-source.json` → `scripts/genBestiary.ts` (vite-node) → typed `*.generated.ts` pattern. Directly reusable to ingest **conditions, spells, classes, races** as typed data.

- 5e character data (classes / races / leveling) lives in `systems/dnd5e/` as data files: `classes.ts`, `races.ts` (`Ancestry[]`), `spells.ts`, `conditions.ts`, `bestiary.ts`.
- **Caveat:** the *converted* `bestiary.generated.ts` is **Solryn-statted** (HP×0.55, DR, TR). A 5e system needs the **raw SRD stat blocks** (AC, +hit, saves, CR) — that's a **separate conversion from the same upstream source**, not a reuse of the Solryn-converted output. The Spell schema is Solryn-shaped (cost/range/duration) and needs 5e fields (level, school, components, casting time, save, slot).

## 6. System selection at creation — **already built**

- `CreateGameModal` already renders a **system picker** from `listSystems()`, stores `systemId` in state, and passes it to `createGame({ name, systemId, owner })`. It shows one card only because the registry holds one system.
- `createGame` writes `systemId/systemName/systemGlyph/systemColor` onto the game (from `requireSystem`); the system is **locked at creation**.
- `GamePage` reads it back via `getSystem(game.systemId)` and passes `system` down to the board/builder/sheet. **Everything is registry-driven — not hardcoded to Solryn.** The only Solryn default is `DEFAULT_SYSTEM_ID` (the picker's initial selection) — harmless.

→ **To surface D&D 5e: register it in the registry — a second card appears automatically.** Zero changes to the picker, `createGame`, or `GamePage`.
→ **Flag:** screens read system *data* generically, but some *flows* assume Solryn modes — the `CharacterBuilder` (classless dice-roll) and the sheet's Arcana pool are built around Solryn's progression/casting. A 5e system (class-and-level + spell-slots) needs **builder/sheet variants**. That's the real work, not the wiring.

## 7. Honest estimate

**Clean insertions (small, data + tiny engine adds):** registry registration · system picker (free) · ability-mod `ModifierRule` variant · proficiency-bonus as data · `rollLowest` (disadvantage) · SRD conditions/spells/monsters via the existing generator.

**Medium (new engine + UI rework):** the `CombatResolver` seam + `attackRollVsAc` + reworking `AttacksSection`/`MonsterStatCard`/`describeRoll` to route through it · roll-vs-DC resolver for saves & skill checks (+ a small prompt/apply UI) · 5e Spell schema extension · raw-SRD monster conversion.

**Large (reworks / new subsystems):** class-and-level progression + a **5e character builder & sheet** (biggest — Solryn's builder is classless-roll) · spell slots + preparation + concentration (per-character slot state, concentration tracking) · formal conditions as **token state feeding the resolver** · action economy (turn-budget concept + UI).

### Suggested phase order
1. **Combat seam (low risk):** define `CombatResolver`, wrap today's behavior as `autoHitVsDr`, route the UI through it. No 5e yet — de-risks everything, proves no Solryn regression.
2. **Minimal dnd5e system, selectable:** 6 abilities + ability-mod variant + proficiency bonus + SRD conditions/spells (data) + raw-SRD monster conversion; implement `attackRollVsAc` + d20 hit/miss in the log; add disadvantage. → "roll to hit vs AC" works on the board with monsters.
3. **Saves & skill checks:** roll-vs-DC resolver + minimal prompt UI; conditions as token state feeding the resolver.
4. **5e PC model:** class-and-level progression, 5e builder/sheet, spell slots + prep + concentration. (Largest; lags safely — monsters/board work before full PC modeling.)
5. **Action economy** polish.

**Bottom line:** infrastructure and system-selection are done and genuinely system-agnostic; the schema already reserves the 5e modes. The 5e core is a **medium-to-large** build whose weight is concentrated in (a) creating the combat/save **resolver seam** that doesn't exist yet and (b) the **5e character builder/sheet + spellcasting** subsystem. Monsters-on-the-board 5e combat is reachable early (phases 1–2); full 5e PCs are the long pole (phase 4).
