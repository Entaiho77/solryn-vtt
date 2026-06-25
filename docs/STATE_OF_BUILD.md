# Solryn VTT — State of Build (handoff to designer)

**Date:** 2026-06-25 · **Branch / PR:** `claude/affectionate-bell-7g25c0` → PR #1 · **Status:** All design-doc phases (A–E) implemented, now on canonical Solryn v1.2 content. Build green, 144 tests passing, CI on every push.

> **UPDATE — canonical content landed.** The designer's v1.2 content pack and answers to the 8 flagged decisions have been applied: the spell-access rule is now `(Arcana mod × 2) + level`, caster if Arcana mod ≥ 1 or Elf (#1); creature stat blocks carry an optional `initiativeMod`, default 0 (#2); decisions #3–#8 accepted as built. The provisional races/skills/spells/equipment/bestiary (§3 below) are **replaced with canonical v1.2 data**. What remains is the smaller authoring list Matthew flagged — see §3, now retitled. Sections 1, 4, 5, 6 still stand.

This brief covers what's built, the decisions (now resolved), the remaining authoring items, and what it takes to play it.

---

## 1. What's built

A complete rebuild on the mandated stack (React + Vite + TypeScript + Firebase Realtime DB + Storage; HTML5 Canvas). The old Flask prototype was removed.

- **Foundation / keystone** — every game system is **data**. The engine (`src/engine`) is system-agnostic and never names Solryn; Solryn lives entirely as a data object (`src/systems/solryn`). Derived-stat formulas are expressed as a small data AST, and each system selects from a "menu of modes" (combat/casting/progression/skill). This is the part most worth protecting.
- **Phase A** — auth (email + Google), lobby, create-game, game settings.
- **Phase B** — the 13-step character builder. The step sequence is **generated from the system data**, not hardcoded — a non-caster gets 12 steps, a caster 13; a different system would produce a different wizard.
- **Phase C** — the full play-mode sheet: resource trackers, the three-across skills section with the training-gate "pending" state, unified attacks (weapons + selectable spell with auto-deducting Cast), spell-book overlay.
- **Phase D** — the live board: Canvas map + grid + fog (rendered per role), snap-to-grid tokens with the permission matrix, the role-configured edge-bar/drawer shell, GM map tools, measure tool, trap lifecycle, saved "my creatures."
- **Phase E** — initiative tracker, harvest/loot, chat + private whispers, private notes, level-up ceremony.

Everything that's a *rule* (modifier math, derived formulas, skill tiers, level dice, quality bands, permission matrix) is implemented exactly to the doc and unit-tested.

---

## 2. Decisions I need you to confirm

These are points where the doc was silent, ambiguous, or self-contradictory. I made a reasonable call and flagged each; please confirm or correct.

1. **Spell-access gate (needs a real answer).** §4.5 says the spell step appears if "(Arcana mod × 2) + level ≥ 1, or Elf" — but at level 1 that's *always* true, which contradicts "for non-casters the step is skipped." I implemented **"known spells ≥ 1 (Arcana mod ≥ 1), or Elf."** Is that the intended rule, or is there a different threshold?

2. **Monster initiative.** Solryn initiative = d20 + Nim mod, and the doc says "the app knows each monster's Nim mod." My simplified creature stat block stores HP/DR/damage but **not** a Nim/initiative modifier, so monsters currently roll d20 + 0. Should creature stat blocks carry an initiative modifier (and should the bestiary/quick-build capture it)?

3. **Combat loot.** §4.14 says combat loot = "the whole party rolls, highest counts, divide narratively." I implemented a per-player **Loot** roll (your skill + assist die → quality tier) with a note that the party compares and splits narratively. Do you want the app to actually *coordinate* a party roll (collect everyone's rolls, show the highest), or is the individual-roll-plus-narrative-split enough?

4. **Character name.** The builder steps don't include a name. I capture it on the **final Gear step** (it gates "Finish"). Is that the right beat, or should naming come first?

5. **Skill training trigger.** Placed points show amber "pending until trained." Since training is narrative ("in town, find a trainer"), I made **Train** a manual button the player taps to realize the points (assist-not-referee). Confirm that's the intended interaction.

6. **Initiative start interaction.** The doc describes **drag-select monsters + right-click → Roll initiative.** I shipped the functional equivalent: an Initiative drawer with a **checkbox list** of creatures + "Roll." Fine for now, or is the drag-select/right-click UX important to you?

7. **Map grid sizing.** The doc says the grid is fixed at the map type's spacing and the map snaps to it (no drag-align). Pixels have to come from somewhere, so each map stores a **grid-square pixel size (default 70, GM-adjustable)**; the type's real-world scale (5 ft, 20 mi, …) is metadata used by the measure readout. Is a per-map adjustable pixel size acceptable?

8. **Modifier formula.** I used **"every 3 points = +1, no cap" → floor(score / 3)** (so score 3 → +1, 6 → +2). The old prototype had a different, capped chart. Confirming this is the canonical Solryn rule.

---

## 3. Remaining authoring (canonical content is in; these items the v1.2 ruleset doesn't enumerate)

The mechanical data is now canonical. The items below are descriptive or structural things the ruleset lists only by name — intentionally left blank rather than invented. The UI degrades gracefully (e.g. hover shows the skill/spell name) until they're provided.

- **Skill blurbs + ability mapping:** each of the 32/22/43 skills needs its `description` + `exampleUse` hover text and its governing ability (STR/NIM/…). Ruleset gives names only.
- **Spell synopses:** the fuller in-context blurb for each spell (mechanical tags — die, damage type, range, cost — are canonical).
- **Creature loot pools:** what materials each bestiary creature yields on harvest (soul-core type + DC are captured; full loot tables are not in the ruleset).
- **Weapon → weapon-skill mapping:** confirm the inferred links (crossbows filed under "Specialty Bows", Lance under "Polearms", an added basic Dagger for the "Daggers" skill).

Two small **follow-up features** (not content): a shield equip-slot so shield DR feeds the formula (shield data exists), and a spell-modification (AP-spend: amplify / multi-target / extend) UI.

---

## 4. Deliberately deferred (polish / hardening, not features)

- **Server-side permission secrecy.** Filtering is client-side per §4.12 (the design accepted this for MVP). Whispers, hidden tokens, and monster stats are hidden at render but present in the synced data. Truly-secret data would need server-side rules — worth doing before any high-stakes/public game.
- **System builder** — explicitly out of scope; the data-driven architecture leaves room for it.
- **Bundle code-splitting** (the app currently ships one ~630 kB JS chunk, mostly Firebase), light/parchment theme, and a few board niceties (the drag-select/right-click above).

---

## 5. What it takes to actually play it

The app builds and the UI renders, but **signing in needs a Firebase project** (Auth with email/password + Google, Realtime Database, optionally Storage for map images), with the config in `.env.local` — or the Firebase emulator. Without it, the landing page shows a "not configured" notice instead of crashing. Setup is in the README. I can wire this up on request so you can click through a real session.

---

## 6. Suggested next step

The highest-value thing now is a **content + rules pass from you**: answer the §2 questions (especially the spell gate and monster initiative), and hand over the canonical races/skills/spells/equipment/bestiary so the provisional data can be replaced. After that, a live Firebase project + a playtest is the real proof.
