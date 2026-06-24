# Solryn VTT — Build Brief for Claude Code

**Companion to:** `Solryn_VTT_Design_Doc.md` (the full design reference — consult it for the detail behind every feature named here).
**Role of this doc:** tells you *what to build, in what order, and what's out of scope.* The design doc says *what each screen is*; this brief says *how to approach building it.*

**Stack (fixed):** React + Vite, Firebase Realtime Database, Firebase Anonymous Auth (+ email/Google). HTML5 Canvas for the board. No backend server beyond Firebase.

---

## THE ACTUAL GOAL (read this first — it governs every decision below)

**This is a system-agnostic VTT that any GM can run any tabletop game on. Solryn is the first system it supports — the flagship and the proving ground — NOT the product itself.**

The product is the *engine*. Solryn is the first *consumer* of the engine. This distinction changes how you build: you are not building "a Solryn app that happens to use data." You are building **a system-agnostic tabletop engine, and proving it works by making Solryn run on it end-to-end.**

Why this matters for your choices: getting the **system-definition schema right is the single most important thing in this project** — more important than any screen looking polished. The schema is the product. Solryn is the test that proves the schema works. At every step, ask: *"Is this general to any system, or am I leaking Solryn-specific assumptions into the engine?"* If Solryn logic is leaking into a component, that's a bug against the real goal, even if Solryn works.

**First deliverable is still Solryn working end-to-end** (don't try to support multiple systems now). But build the foundation honestly aimed at the bigger destination.

### How multi-system support grows (the strategy — not built now, but design toward it)
You will NOT build a fully-generic "express any rule" engine (that's a research problem). Instead, the engine supports a growing **menu of mechanical modes**, and each system picks from the menu:
- **Combat resolution mode:** auto-hit-vs-DR (Solryn) | attack-roll-vs-AC (5e-style) | dice-pool | …
- **Casting model:** point-pool/Arcana (Solryn) | spell-slots-by-level | mana | none | …
- **Progression model:** classless dice-roll (Solryn) | class-and-level tables | point-buy | …
- **Skill model:** tiered "3-to-fill-1-to-cross" + training (Solryn) | proficiency+bonus | …
Most tabletop systems are remixes of a finite set of these building blocks. Solryn exercises one combination. A future system either reuses existing modes or adds ONE new mode to the menu — which then benefits every later system. **Implication for now:** distinguish *parameters* (stat count, modifier formula, square scale — pure data, trivially general) from *logic/modes* (combat resolution, casting — needs an engine mode). Express Solryn's mechanics as a *selected mode + parameters*, not as the only way things work. Even though only Solryn's modes exist at first, structure the code so a mode is a *choice the system data makes*, not a hardcoded assumption.

---

## 0. The one principle that governs everything

**Every game system is DATA, not hardcoded logic.** Solryn is the first *preset* — a system-definition object the app reads. Components must read "the current system's data," never hardcode Solryn's numbers/rules. Stats, derived-value formulas, skills, map-type scales, quality tiers, creature stat-block shapes, AND the selected mechanical modes (combat/casting/progression/skill) — all of it lives in a system-definition data structure.

Build Solryn as a single seed data object the app consumes. If you ever find yourself writing `if (stat === 'Arcana')` or hardcoding `HP = Endurance + mod` or assuming auto-hit combat inside a component, stop — that belongs in the system data, read generically. This is what makes the system-agnostic goal (and the deferred system-builder) possible without a rewrite. **Non-negotiable.**

Do NOT build the system builder, and do NOT build other systems yet. Just make sure Solryn is expressed as *data + selected modes*, never as concrete hardcoded assumptions.

---

## 1. Foundational architecture (build this first, before any screen)

1. **System-definition schema + Solryn seed.** Define the shape of a "system": core stats, derived-stat formulas, skill list w/ description+exampleUse, spell shape w/ synopsis+type, map types+scales, quality/rarity tiers, creature & trap stat-block shapes, level-up die-by-level rules, AND the **selected mechanical modes** (combat resolution, casting model, progression model, skill model — see "menu of modes" above). Populate it with Solryn from the v1.2 ruleset (Solryn selects: auto-hit-vs-DR combat, Arcana point-pool casting, classless dice-roll progression, tiered+training skills). Everything else reads this. **This schema is the heart of the product — design it to express a system's choices, not to encode Solryn as the only possibility.**
2. **Firebase data model.** Top-level: `users`, `games`, `characters`. 
   - `game`: name, systemId/Name/Glyph/Color (locked at creation), inviteCode, members `[{userId, role}]`, maps, active map, tokens, fog state, initiative state, chat.
   - **Role lives on game membership, not the user** — same person can GM one game, play another.
   - `character`: one per player per game. Two regions — immutable **definition** (built once) vs mutable **play-state** (HP, spent points, equipped, etc.). `buildComplete` flag flips build→play permanently.
   - Tokens reference a backing stat block (character or creature). Familiars/pets/summons = controlled tokens, NOT characters.
3. **Real-time sync layer.** Single source of truth in Firebase; every screen is a live, permission-filtered window. **Client-side filtering** (render-time hide what a role shouldn't see — acceptable per design rationale). **Optimistic local writes** for own actions (instant feel), fast push for others. Single-owner-per-token makes it conflict-free — lean on that.
4. **Permission/ownership model** (used everywhere): control follows ownership. Players control their own character/token (full read+write); GM has read-only on player characters; GM has full control of monster/trap tokens; players see monsters as **name+image only**. Bake this into the sync filter and token interactions once.

---

## 2. Build sequence (phased — get a playable loop early)

Each phase should be runnable/testable before the next. Consult the design doc section in brackets.

### Phase A — Entry & game shell
- Landing / auth: email+password + Google, no confirm-password, sign-in/create toggle one component. [§4.1]
- Lobby: your-games list (system glyph, name, player count, role badge), create-game, join-by-code. [§4.2]
- Create-game modal: name + system picker (Solryn only for now), invite code generated after. [§4.3]
- Game settings modal: GM version (editable name, read-only system, invite code copy/regenerate, member list w/ remove, delete) + player version (trimmed, "leave game"). [§4.10]

### Phase B — Character builder (the 13-step wizard)
- Step frame: progress bar, instruction, left action area, right persistent teaching panel, gated Next. [§4.5]
- Steps in order: roll stats (2d4 in order, lock-on-roll, NO reroll, anti-fishing, no Back on steps 1–2) → race (9, flexible-bonus expand inline) → derived "show don't ask" pages (HP, DR[partial], Speed, Initiative-as-modifier, Carry, Arcana, Luck) → skills (3 subpages: base/weapon/crafting, browsable grids + hover desc) → spells (conditional, casters only) → reputation (auto Neutral) → gear (finalizes DR/Speed). [§4.5]
- "Finish character" → sets `buildComplete`, flips to play mode permanently.
- Everything reads Solryn data (stat list, race table, formulas, skill list) — not hardcoded.

### Phase C — Play-mode character sheet
- Layout: header → 7 core stats → resource trackers (HP/Arcana/Luck, one reusable component ×3) → combat/movement strip (DR/Speed/Init-mod/Carry) → skills (3 sections across, tier + 3 bubbles) → attacks & damage → gear. [§4.6]
- Resource tracker: current/max + minus/amount/plus. HP = final post-DR entry (no auto-DR). Arcana always shown (even non-casters). 
- Skill progression: "3 to fill, 1 to cross", 2 pts/level, **training gate** (placed points pending/amber until trained in town). [§4.6]
- Attacks: weapon rows (die + skill bonus + auto-hit-vs-DR) + ONE selectable spell row (dropdown of offensive spells, synopsis updates on select, Cast auto-deducts Arcana). [§4.6]
- Spell-list page: openable overlay, all known spells (offensive+utility), search, synopsis cards. Entry point on sheet, casters only. [§4.7]

### Phase D — The board (Canvas) + GM tools
- Canvas board: map image, fixed grid, **map snaps to grid from upper-left** (no stretch, no align step). [§4.11]
- Map setup: upload → name → pick type (World/Area/City/Battle/Custom, each sets scale from system data) → add. Grid show/hide toggle. [§4.11]
- Tokens: snap-to-grid movement on all maps, no distance readout yet. Token tap = permission matrix (own/other-player/monster). [§4.11]
- GM map tools as a **right edge bar with fly-out drawers**, mirroring the left tool bar (symmetric thin strips both sides; board reclaims width when no drawer open): select/measure | fog/add-creature | grid/maps. [§4.11 on-board tools]
- Fog: grid-square level, click-to-toggle (reveal↔cover), cover-all, clear-all. GM sees semi-transparent, players opaque. [§4.11]
- Hidden tokens (visible flag). Add-creature panel: bestiary browse (Solryn + "my creatures") + quick-build (optional save). Traps = bestiary subsection w/ trap fields + 3-state lifecycle. [§4.11]
- Player board view: tools left (dice/chat-with-whispers/notes/rules-reference), character quick-view drawer right (HP/Arcana/Luck/DR/Speed/full attacks, + Spells button → spell-book overlay for casters), "Full sheet" → wide overlay over board. [§4.8]

### Phase E — Combat & systems
- Initiative: GM drag-selects monsters → right-click → Roll initiative (opens tracker). Player sheet initiative button highlights when combat opens, tap to roll in, inert after. [§4.13]
- Tracker UI: bottom horizontal strip, current turn centered + enlarged, current map token highlighted, round counter. Players end own turn; GM "next" always advances. Dead monster grays out in place. [§4.13]
- Harvest/loot/quality: universal mechanic. d100 + governing-skill bonus → quality tier (Ruined 1–8 / Common 9–40 / Uncommon 41–68 / Rare 69–86 / Very Rare 87–96 / Legendary 97–100, cap at Legendary). Skill GATES it (no skill = no roll). Assist = 2d100 take highest. Combat loot = whole party rolls, highest counts, split narratively; solo harvest = individual rolls. Tiers map to crafting rarity scale. [§4.14]
- Chat with whispers: public + private (sender+recipient only, **GM cannot see player↔player whispers**). [§4.8]
- Level-up: GM grants party-wide → player ceremony (roll increases in order/locked by level-type die → recalc, HP fully recomputes → allocate 2 skill points, pending until trained). [§4.9]

---

## 3. Semantic conventions (apply consistently)
- **Dark theme, flat.** Teal `#5DCAA5` = accent/HP/active. Purple `#7F77DD` = Arcana/spells. Amber `#EF9F27` = pending/owed/level-up. Red `#E24B4A` = damage/minus. Surfaces: board `#1a1d24`, bars `#23262e`, raised `#2e323c`. Muted `#9aa0ab`, primary `#e6e7ea`. [§6]
- Reusable components to build ONCE: resource tracker (×3 use), skill row, token, rollable damage row, teaching panel, drawer shell (GM & player share it, role-swapped contents).

## 4. Explicitly OUT OF SCOPE (do not build)
- The system/custom-rules builder (deferred — just keep Solryn as data so it's possible later).
- Map drawing/tile tools (image upload only).
- Distance readout on token drag (snapping + scale make it an easy later add).
- Server-side permission filtering (client-side is accepted for now).
- Light/parchment theme.

## 5. Suggested first milestone
Phases A–C give a complete single-player-ish loop: sign in, create a game, build a character, view the play sheet — all reading Solryn-as-data. That proves the keystone architecture before the board/multiplayer complexity of D–E. Recommend landing A–C solidly first, with scoped Vitest coverage on the rules-engine logic (stat rolls, derived formulas, skill progression, harvest tiers).
