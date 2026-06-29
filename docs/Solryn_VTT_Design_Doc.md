# Solryn VTT — Master Design Document

**Status:** Living design doc. Captures design decisions from the rebuild planning sessions. This is the source of truth for what to build and hand to Claude Code. Build against presets (Solryn as flagship) first; the system builder is a deferred future phase.

**Stack:** React + Vite, Firebase Realtime Database. Designer / Claude Code dual-instance workflow.

---

## 0. Keystone Architectural Principle (read first)

**The actual goal: a system-agnostic VTT that any GM can run any game on. Solryn is the first system it supports — the flagship and proving ground — not the product itself. The product is the engine; Solryn is its first consumer.**

**Every game system — Solryn included — is treated as DATA, not hardcoded logic.**

Solryn is "the first preset," expressed as a system-definition data structure. The character sheet, dice roller, builder, and board all read "the current system's data" rather than hardcoding Solryn's rules. This is what makes the system-agnostic goal (and a future custom-system builder) possible without re-architecting.

**Getting the system-definition schema right is the most important thing in the project** — more than any screen's polish. The schema is the product; Solryn is the test that proves it works. At every step ask: "is this general to any system, or am I leaking Solryn-specific assumptions into the engine?"

**How multi-system support grows (strategy, not built first):** the engine supports a growing *menu of mechanical modes*, and each system picks from it — combat resolution (auto-hit-vs-DR | attack-roll-vs-AC | dice-pool…), casting (point-pool | spell-slots | mana | none…), progression (classless dice-roll | class-and-level | point-buy…), skills (tiered+training | proficiency+bonus…). Distinguish *parameters* (stat count, formulas, scales — pure data, trivially general) from *logic/modes* (needs an engine mode). Express Solryn as *a selected mode + parameters*, not as the only way things work. A future system reuses existing modes or adds one new mode that then benefits all later systems. Not a fully-generic "express any rule" engine (that's a research problem) — a finite, growing menu.

If this principle is honored, new systems and the system builder can be added later as their own phases. If Solryn is hardcoded into components instead, the any-game goal becomes impossible. Non-negotiable.

---

## 1. Navigation Flow

Everyone enters the same way; role determines what they see inside a game.

- **Landing** → sign in / sign up
- → **Lobby** (your games + create/join)
- → branch by **role on the game membership** (not on the user):
  - GM → **GM screen**
  - Player → **character builder** (first time) → **character sheet**
- → both arrive at the shared **game board**

Key data consequence: **role lives on game membership, not on the user.** The same person can be GM of one game and player in another. "Which screen do I see" = read my role on the game I opened. No separate role-selection step.

---

## 2. Data Model (derived from the navigation)

Align names with existing Firebase structure where present. Shapes captured so far:

### User (minimal)
```
user = { id, displayName, email /* or Google identity */ }
```
Display name captured at sign-up; shown in lobby and on the board.

### Game
```
game = {
  id, name,
  systemId, systemName, systemGlyph, systemColor,  // chosen at creation, READ-ONLY after
  inviteCode,                                       // players join by entering this
  members: [ { userId, role: "gm" | "player" } ],
}
```
- System is **locked at creation** — never changes. Header label is read-only.
- Each system preset carries a glyph + color (used for the lobby/header badge).

### Character (one per player per game)
```
character = {
  id, gameId, ownerUserId,
  coreStats: { ... },        // the system's core stats
  derived: { ... },          // computed values
  skills: [ ... ],
  spells: [ ... ],
  gear: [ ... ],
  reputation: "Neutral",
  // plus race, level, etc. for Solryn
}
```
- "One character per player per game" holds.
- **Familiars / pets / summons** are NOT extra characters — they are **controlled tokens** (light stat blocks) that a character can control.
- **Wildshape / transformation** = the character swaps its **active stat block**, not a new character. Character points at which stat block is currently in effect (defaults to its own).

### Token (board)
```
token = { id, name, x, y, color, characterId /* or stat-block ref */ }
```
A player's character is a token; familiars/summons are also tokens controlled by that character.

### Combatant, Dice roll, Chat message — see GM Screen brief (separate doc).

---

## 3. System-Definition Shape (foundation for the future builder)

A "system" is a list of fields the app reads. Solryn is the first filled-in copy. Field types identified so far:

- **Core stats** — a plain list, set directly (Solryn: Strength, Nimbleness, Endurance, Wisdom, Intelligence, Arcana, Luck). No cap.
- **Derived stats** — computed from cores via a formula (e.g. HP from Endurance).
- **Equipment-fed derived stats** — derived values that also pull from gear (Solryn DR and Speed both depend on armor).
- **Progression rules** — how stats grow (Solryn: level-up dice rolls raise core stats).
- **Skills** — each needs `name`, `description`, `exampleUse` (for hover tooltips).

### System builder — DEFERRED FUTURE PHASE
- Vision: when creating a custom game, the DM gets, for each part of the system, a **"pick a preset OR go custom"** choice. The presets are pre-made data structures; "custom" is a form that produces one from scratch.
- The builder opens in its **own window** (separate from the create-game dialog).
- "Heavy end" intent: it defines real mechanics (stats, dice resolution, derived formulas, progression), not just descriptive labels.
- **Sequencing:** build the whole app against presets first. Build the system builder later, with the target = "a GM can produce a preset that behaves exactly like the hardcoded Solryn preset." When custom-built and hand-built presets are indistinguishable to the app, it's done.
- For now: create-game shows a searchable system dropdown of presets + a Custom option (Custom can be present-but-disabled or hidden until the builder exists).

---

## 4. Designed Screens

### 4.1 Landing / Auth
- Two-panel: brand/pitch on left (dark theme), form on right.
- **Sign-in methods:** email/password + Google. (No confirm-password field — eye toggle on password instead.)
- Sign-in and Create-account are **the same screen toggling modes**, mirrored layout. Create-account adds one field: Display name. Build as one component with a `"signin" | "signup"` mode.

### 4.2 Lobby / Game Management
- Top bar (user name + avatar), "Your games" list, Create game button, join-by-invite-code row at bottom.
- Each game row: system glyph (color-coded per system), name, system + player count, and the user's **role badge** (GM teal / Player gray).
- Clicking a game enters it; role badge determines GM screen vs. player view.
- **Join flow:** GM shares invite code → player enters it → added as member with player role.

### 4.3 Create-Game
- Modal over dimmed lobby. GM enters game name + picks a system.
- Note shown: "The system is locked once the game is created."
- Single modal (not a multi-step wizard); name + system are all that's required. Other settings live in game settings post-creation.
- Invite code generated on creation, shown afterward (settings/share), not on this dialog.
- **Future:** system picker becomes a searchable dropdown + Custom option (opens the deferred builder window).

### 4.4 GM Screen
Fully specified in the separate **GM Screen Build Brief**. Summary: top header (read-only system label + board tools + game name + settings/profile), left edge bar (Initiative), right edge bar (Dice log, Chat), center board. Drawers slide open one-at-a-time per side; default closed. Buttons driven by config arrays. Floating token card shows a clicked token's name/role/HP/DR/Luck. Board tools (select/measure/draw) are modes, header-only. No dice mode in header — dice is the right-bar log.

### 4.5 Character Builder (13 steps) — combined with the character sheet

The builder IS the character sheet in **build mode** (guided, step-gated, teaches as it goes). After "Finish character" it becomes the same sheet in **play mode** (complete, freely editable, no gating). Same components, two modes.

**Shared step frame:** progress bar; "Step N of 13" + title + plain-language instruction; action on the left; a persistent teaching panel on the right ("the why," shown inline, not hidden behind tooltips); a gated Next button that names the next step.

**Teaching philosophy:** show the *why* behind every number inline (e.g. watch a rolled stat produce its modifier, watch the modifier flow into HP/DR/Speed). This is the core purpose of folding the tutorial into the build.

**Navigation rule:** Back is available throughout EXCEPT you cannot go back into the stats step (steps 1 and 2 have no Back, since Back from race would reach the sealed stats). The stat roll is a one-way gate. Rolled stats ride forward as locked, read-only reference data on every later page.

**The steps:**

- **Step 1 — Roll stats.** 2d4 per stat, in order, no rearranging. **Anti-fishing:** each stat rolled individually, locks on roll, NO reroll, no "roll all" bulk button. Modifier shown next to each (every 3 pts = +1). Teaching panel shows the modifier chart with a note that the pattern continues with no cap. Next gated until all 7 rolled.

- **Step 2 — Choose race.** List of 9 races (Human, Dwarf, Elf, Gnome, Drakari, Umbrin, Marai, Ashborn, Etherials), each with bonuses/advantages/weakness. **Flexible-bonus races** (Human "+1 to any two," Dwarf "+2 STR +1 any," Elf "+1 Nim +1 Wis/Arc") expand inline to assign the bonus before applying. Live preview shows rolled stats changing with race bonuses. Advantages/weaknesses are recorded, not mechanized at creation (they matter in play). No Back (would reach sealed stats).

- **Steps 3–9 — Derived values** (the "show, don't ask" pattern: big computed number + equation breakdown + formula in teaching panel; no input). Back available from step 3 on.
  - **3 — HP** = Endurance score + Endurance modifier. Teaching note: fully recalculated on level-up with new Endurance.
  - **4 — DR** = Armor DR + Nimbleness mod + Endurance mod. **Partial value** ("DR so far: X + armor"); completes at step 13. Shows known pieces + a dashed "?" armor slot.
  - **5 — Speed** = 10 + ((STR mod + END mod) × 5). Caps at 50 ft. **Gear-dependent like DR** (medium −5, heavy −10). Shows "Speed before armor"; finalizes at step 13.
  - **6 — Initiative.** = d20 + Nimbleness mod. **Not stored as a fixed number** (has a die roll). Page TEACHES the per-combat roll and displays the permanent **initiative modifier** at a glance. Includes tie rules.
  - **7 — Carrying Capacity** = STR score × 15 lbs. Clean pattern. (Note: Gnome racial weakness = 25% body weight may interact.)
  - **8 — Arcana Points** = Arcana mod × 2. Clean number; usage (spend/turn = level) + recovery rules in teaching panel.
  - **9 — Luck Points** = Luck mod. Simplest clean pattern.

- **Step 10 — Skills.** Split into **3 sub-pages** (Solryn builds fast, so spend the page budget on the one characterful choice):
  - 10a Base skills — choose 3 of 32.
  - 10b Weapon skills — choose 3 of 22.
  - 10c Crafting/trade — choose 1 of 45+.
  - Each sub-page: full list shown as an **even grid of equal-width chips** (aligned rows, not ragged wrap), browsable for discovery, with search for those who know what they want. Counter shows progress; Next gated per sub-page. Rules enforced: pick exactly N, all different, no doubling points at creation.
  - **Action Economy skills excluded** (cost 3 pts, Level 2+; not a creation choice).
  - **Build-time:** each skill chip shows a `description` + `exampleUse` on hover (reinforces teaching). Requires those fields in skill data.

- **Step 11 — Spells (CONDITIONAL).** Appears only if (Arcana mod × 2) + level ≥ 1, or the character is an Elf (3 free non-damaging spells). For non-casters the step is **skipped entirely** and the progress bar accounts for it. Browsable-grid pattern like skills. Teaching panel shows the known-count formula traced to the player's own Arcana/level, plus auto-hit / 1d4 base / Elf bonus notes. (Spell list populates from system data, section 5.7.)

- **Step 12 — Reputation.** No choice. Everyone starts **Neutral**. One-beat teaching page: no alignment system, standing grows from play, GM-tracked, can vary by faction/region. Next enabled immediately.

- **Step 13 — Starting gear (finale).** Pick armor + a weapon (weapon list **filtered to the player's chosen weapon skills**). **Finalizes the pending DR and Speed** in a "Now finalized" panel (DR resolves to its full number, Speed confirms with any armor penalty) — the payoff moment connecting back to steps 4–5. Auto-granted kit (toolset, backpack, rope, rations, bedroll, lantern, 3 healing potions) noted as included. Button: "Finish character" → collapses into play-mode sheet.

### 4.6 Play-Mode Character Sheet (DESIGNED)
The completed sheet, freely editable, kept open during play. Same components as the builder, no step-gating.

**Vertical layout order** (top to bottom on one page):
1. **Header** — avatar/initial, name, race · level · reputation.
2. **Core stats** — 7 stats in a row (STR/NIM/END/WIS/INT/ARC/LCK), each as score + modifier. Read-only in play; change only on level-up.
3. **Resources** — HP, Arcana, Luck as a row of three identical trackers (see below).
4. **Combat & movement** — DR, Speed, Init modifier, Carry as a read-only reference strip.
5. **Skills** — three sections across (see below).
6. **Attacks & damage** — weapons + selectable spell (see below).
7. **Gear** — equipped items row.

(Caster sheets also need a **spells entry point** and a **spell-list page** — see §4.7. Kael, the running example, is a non-caster so his sheet shows no spell list, but DOES show the Arcana tracker — see below.)

**Resource trackers (HP / Arcana / Luck) — one reusable component, used 3×:**
- Each shows current/max + a **minus button, typed amount field, plus button**. Type amount, press − to spend/take damage, + to recover/heal.
- HP: player enters the **final post-DR number** (control does NOT auto-subtract DR). Clamp 0–max.
- Arcana: max = Arcana mod × 2. Luck: max = Luck mod. Player manages recovery manually with +.
- **Always show all three, including Arcana for non-casters.** Reason: leveling rolls raise core stats, so a non-caster can roll Arcana up over levels and BECOME a caster — the pool grows from 0/0 organically. Hiding it would surprise the player later. (Also a nice teaching moment: watch the pool appear as Arcana rises.)
- Color coding: HP teal, Arcana purple, Luck amber.

**Skills section — three sections across the page:**
- **Base / Weapon / Crafting** sit side by side as three titled vertical sections; each contains a **two-column grid** of compact skill rows. Keeps the area wide-and-short; each section grows downward as skills are learned.
- Each skill row: name · tier label (Nov/Jrny/Mast) · **three bubbles** showing fill within the *current tier*. Snug spacing (bubbles right-aligned within the row, not floating with dead space).
- "Unspent points: N" counter at the section header.
- **KNOWN ISSUE to revisit:** at three-across width, long skill names get squeezed (abbreviated in mockups). Tune at full screen width later (abbreviate / truncate-with-hover / smaller text). Structure is locked; spacing is not.
- **Build-time:** tap a skill row to expand for detail (the full 9-point view + training message). Hover shows `description`/`exampleUse`.

**Skill progression model (IMPORTANT — fully specified):**
- Mastery tiers: Novice (+1), Journeyman (+2), Master (+3). Invested points run 1–9 continuously.
- **"3 to fill, 1 to cross":** 3 points fill a tier; the next point (the "crossing point") advances to the next tier AND counts as that tier's first filled point. So bonus jumps at point 4 (→Jrny) and point 7 (→Master). Points: 1–3 Novice, 4–6 Journeyman, 7–9 Master.
- **2 skill points per level.** Players are NOT forced to bank — they spend points immediately into existing skills OR a brand-new skill. Points accumulate visibly inside each skill (progress shown even before a bonus is earned).
- **Training gate (core to the system):** a placed point does NOT raise the bonus until the character receives **training**. Training requires being **in town** during downtime, finding someone skilled in that trade at a higher level, and being trained by them. So XP/points earned in the wild don't take effect until back in town — this is a deliberate design rhythm.
  - Therefore a skill has THREE states: invested points (editable anywhere), active bonus (only moves on training), and a **pending** gap (points placed past a tier boundary but bonus not yet caught up — shown in **amber** with a "needs training" indicator).
- **Shared "pending until town + training" concept:** leveling itself works the same way — XP can be earned anywhere but the level-up (stat rolls + recalculation + skill points) happens in town with training. One unified pending pattern covers both skills and leveling.
- Data per skill on a character: `investedPoints`, `activeTier`/`activeBonus`, `pendingTraining` (bool).

**Attacks & damage section — unified rollable damage sources:**
- One mechanism for any damage source (weapons AND offensive spells): each row shows name, what feeds it, the die, and a roll button.
- **Weapons** = fixed rows. Show damage die + the relevant weapon-skill bonus pulled from the skills section (e.g. "1d6 +1"), plus "auto-hit vs DR" reminder. Teal "Roll" button.
- **Spells** = ONE **selectable** row (a dropdown of the character's known offensive spells), so the section stays the same size no matter how many spells are known. Purple-accented. Shows the chosen spell's die (1d4 base) + "costs N Arcana". Button reads "Cast".
- **Click-to-roll OR roll-your-own:** the die is always displayed (for physical-dice tables); the roll button is optional convenience. Rolling here can post to the GM-screen dice log.
- **Cast auto-deducts Arcana:** pressing Cast rolls the die AND decrements the Arcana tracker by the spell's cost, keeping them in sync (prevents "forgot to spend the point"). Weapons have no such side effect.
- **Spell synopsis:** when a spell is selected, the row expands to show a short synopsis ("a spike of stone erupts beneath a target…") + key facts (auto-hit vs DR, Arcana cost, range). Updates when the selection changes. Teaching-in-context, like the builder.
- **Possible later enhancement:** allow pinning 2–3 favorite spells as their own rows if a single selectable row feels tight in play.

**Editability principle:** live values that change constantly (HP, Arcana/Luck spent, equipped gear, loaded spell) are easy to touch; structural values (core stats — level-up only) are calmer; GM-involved values (reputation) aren't freely edited.

**Build/play mode switch (DECIDED):** a character is in **build mode** only during creation (the guided wizard). At "Finish character" it flips **permanently** to play mode — a one-way switch (data flag `buildComplete: true`). No returning to the builder (respects the one-way creation gates, esp. locked stat rolls). All later changes go through play-mode free editing (day-to-day) or the level-up ceremony (growth). The builder is the doorway in, not a place you revisit.

**Density note:** the assembled sheet is information-dense. Fine for experienced players; consider breathing room/collapsibility as a future refinement for newer players.

**Relationship to GM token card:** the player's full sheet and the GM's floating token card are two views of overlapping data (HP/DR/Luck) — they should agree but are different screens.

**STILL TO DESIGN:** how the sheet opens from the board (panel/button/full screen), play-vs-build mode toggle behavior, the caster spell-list page (§4.7).

### 4.7 Spell List Page (DESIGNED)
A caster's full known-spells list as its **own openable overlay** (not on the main sheet — would blow up density). Reached from a small "Spells" entry point on the main sheet AND from a **Spells button in the player board quick-view drawer** (casters only — see §4.8), so it's one tap during play. Used for browsing/reading spell descriptions and (eventually) learning new ones. The attack section's selectable spell row is a *shortcut to offensive spells*; this page is the *complete book* (offensive AND utility).

**Layout:** overlay with header (book icon, "Known spells · N known", current Arcana pool shown for reference, close X), a search box, then spell cards. Each card: icon, name, **type tag (offensive=red / utility=teal)**, die (or — for non-damage), full **synopsis**, and a facts line (range/target, Arcana cost, duration). Utility spells (Stoneskin, Mend Wounds) live here too — they never appear in the attack row.

**Data per spell:** `synopsis`, `damageDice` (nullable), `arcanaCost`, `range`/target, duration, and **`type` (offensive/utility)**. The `type` tag determines which spells feed the attack row's selector (offensive only).

**Consistent data pattern across the app:** "things carry a short blurb shown in context" — skills have `description`/`exampleUse`, spells have `synopsis`. The system data (and the future custom builder) must capture these blurb fields.

### 4.8 Player Board View (DESIGNED)
The player's view of the shared board. **Mirrors the GM screen's shell** — same machinery, different drawer contents loaded by role (config-driven, per the keystone). Tools on the LEFT edge bar, the player's character on the RIGHT.

**Layout:** left edge bar (tools) → center board (map & tokens) → right edge bar (character quick-view drawer).

**Right side — character, two tiers:**
- **Quick-view drawer** (~262px, a normal push-drawer — board stays mostly visible, played alongside). Contents are the things touched/glanced at every turn: HP / Arcana / Luck trackers (the interactive minus/amount/plus controls), DR and Speed as reference boxes, and the **full Attacks & damage section** (weapons + selectable spell row WITH synopsis — kept full, not stripped, so spell damage type/effect stays visible without opening the sheet). A "Full sheet" button in the drawer header opens the overlay.
  - **Spells button (casters only):** the quick-view also holds a **Spells button** that pops the spell-book **overlay** (§4.7) directly — one tap from the quick view, no need to go through the full sheet. Same overlay component whether opened here or from the full sheet. Conditional on being a caster (hidden for non-casters). Gives casters their two most-referenced things — attacks + full spell book — both one tap from the quick view.
- **Full sheet = a WIDE overlay** that slides OVER the board (does NOT resize the board or disturb tokens; board sits full-size underneath, revealed on dismiss). This is the complete §4.6 sheet.
- **Skills are NOT in the quick view** — a skill check means tapping through to the full sheet. (Decided: keeps the quick view quick.)
- Drill-down: edge bar → quick-view drawer (push) → full sheet (overlay).

**Left side — player tools (each a drawer, config-driven list):**
- **Dice** — roller.
- **Chat — public + whispers.** Two modes: a public channel everyone sees, and **whispers** (private DMs) in any direction: GM→player, player→player, player→GM. A "To:" recipient selector on the send control (Everyone / GM / each player) sets the target. Whispers are visually distinct (purple tint, eye-off icon, "Whisper from/to X" label; incoming left-accented, outgoing right-indented) so public vs. private is never confused.
  - **Data:** each message carries an audience (public, or sender+recipient). Must genuinely hide whispers from non-recipients. **DECIDED:** player-to-player whispers are **private from the GM** — a whisper is visible to exactly its sender + recipient, with no GM-sees-all moderation exception. The GM only sees whispers they're a participant in. If a player wants the GM to know, they forward it themselves (copy-paste). Lets players scheme/roleplay privately.
- **Notes — private player scratchpad.** Player's own notes (clues, NPCs, reminders), as titled cards with an add button. **Private to that player** (lock icon + "private to you" label). Not shareable.
- **Rules reference — READ-only, generated from system data.** Searchable quick-reference cards of the active system's rules (modifiers, damage & DR, initiative, luck, spellcasting, etc.). Header badges the system ("Solryn"). **Architectural payoff:** because the system is data, its rules populate this panel automatically; a custom system surfaces its own rules in the same UI for free. Built once, filled per system.

**GM vs. player parity:** GM has tools on left (initiative/dice/chat) + nothing fixed on right; player has tools on left (dice/chat/notes/rules) + character on right. Same shell, role-swapped drawer config.

### 4.9 Level-Up Flow (DESIGNED)
**GM-driven, not auto-enforced.** Solryn's XP comes almost entirely from turning in quests *in town*, so leveling naturally happens in town already — the app does NOT need to police XP thresholds, detect town, or gate anything automatically. The GM just grants the level ("hey, you went up — take your downtime and train"). The app is a helper, not a referee.

**Two pieces:**

**GM side — "grant level-up" control.** **DECIDED: party-wide only** — in Solryn the party always levels together (shared quest XP), so there is no per-player grant. A single **"grant level-up to party"** action flips the level-up ceremony to available for everyone at once. Lives in the members/party area (or a top-level GM action — it's just one button). That availability is what opens the ceremony on each player's end. (Rare edge case: the ~1–5% of XP from mid-adventure milestones/GM awards could tip someone over while not in town — fall back to the amber "ready to level — return to town" pending indicator. Exception, not the main path.)

**Player side — the level-up ceremony (3 steps):** reuses the builder's teaching patterns; the player is watching their character *grow*.
1. **Roll increases.** Same anti-fishing pattern as creation: roll each of the 7 stats' increase **individually, in order, locked on roll, no rerolls**. Die depends on level type (data-driven, shown on the button): **1d4 standard levels; 2d6 milestone levels (6, 10, 14, 18 — big spike); 1d8 epic (20+)**. Each row shows old value → rolled increase → new total. Teaching panel highlights when a bump crosses a +3 threshold and raises the modifier (the payoff). All 7 advance every level.
2. **Recalculate** (show, don't ask). Every derived value refreshes from the new stats, shown old → new: HP, DR, Speed, Arcana points, Luck points, spells known. **HP fully recalculates from new Endurance** (does NOT just add the increase on top) — note this in the teaching panel.
3. **Allocate skill points.** 2 points, placed into existing skills or a new one. **Ties directly to the skill system (§4.6):** placed points sit in the **pending / needs-training (amber)** state until the character trains. Leveling grants the points; training realizes them. One shared "pending until trained" concept.

Full flow: GM grants → player rolls increases (in order, locked) → recalculate → allocate 2 skill points (pending until trained) → done.

### 4.10 Game Settings (DESIGNED)
A **modal** over a dimmed background (consistent with create-game). Mostly GM-facing; role-trimmed for players.

**GM version, top to bottom:**
- **Game name** — editable (the one piece of basic info changeable after creation).
- **System** — read-only with glyph, labeled "locked at creation."
- **Invite code** — displayed prominently (e.g. "SVLT-7K2P") with a **copy** button and a **regenerate** button (regenerate invalidates the old code — for leaks or to stop new joins). Hint explains regeneration invalidates the old code.
- **Members** — list of everyone, each with avatar, name, role badge (GM teal / Player gray). GM's own row marked "(you)", no remove. Each player row has a "⋯" menu (remove from game, etc.).
- **Danger zone** — red-outlined "Delete this game", set apart at the bottom to avoid accidental taps.

**Player version (same modal, role-trimmed):** game name + system read-only; member list read-only (can see who's in, can't manage); no invite-code controls; danger zone shows "Leave game" instead of delete.

### 4.11 Map / Board System (IN PROGRESS — designed in prose, mockups pending desktop)

**Map setup flow (DESIGNED):** upload → name → pick type (sets scale) → add to board. Short and approachable, NO manual grid alignment.
- **Upload:** image upload only for now (JPG/PNG of a battle map, town, world, etc.). No built-in drawing tool (future maybe). Preview shows filename + pixel dimensions; "replace image" option.
- **Name:** maps are named (GM builds a per-game **library** of maps and swaps the active one onto the board).
- **Map type → scale (preset, data-driven).** GM picks the type at upload; the grid scale sets itself. Types:
  - World map — ~20 miles/square (≈ a day's travel on foot — Solryn's grounded logic).
  - Area map — 5 miles/square.
  - City map — ¼ mile/square.
  - Battle map — 5 feet/square.
  - Custom — GM defines square = X.
  - These are **system data** (presets); a custom system could ship its own map types/scales. Solryn ships these.
- **No grid alignment.** The grid is fixed/regular at the type's spacing; the **map snaps to the grid from its upper-left corner** (anchors top + left edges). Deliberately does NOT stretch/distort the map to force-fit its own drawn squares. Works well because modern map tools (Inkarnate, Dungeondraft) already export at standard grid sizes.
- **Grid overlay toggle** (show/hide) — default on; GM can hide it for maps that already have a baked-in grid (avoid double lines). Available at setup and as a live toggle on the board.

**Token movement (DESIGNED):** **snap-to-grid on ALL map types.** On battle maps it's about position; on world maps it's about travel time (a square = a day), so snapping serves both — counting squares = counting time/distance. **No active distance readout for now** (keep simple); the readout ("15 ft / 3 squares") is an easy later addition since snapping + scale are already in place.

**Token tap — permission matrix (DESIGNED). Control follows ownership; visibility decreases with distance from you.**
- Players **own and control their own** character (move it, edit their own HP/sheet). The GM has **read-only** on player characters (can see for reference, cannot edit — respects player agency).
- The GM has **full control** of monster/creature tokens (move, edit HP, apply damage, abilities, remove). The GM owns and runs the monsters.
- Player taps **own character** → their controls (move, open quick-view/sheet).
- Player taps **another player** → read-only basics (name, maybe visible status).
- Player taps a **monster** → **name + image only.** No HP, DR, stats, or abilities — monsters stay mysterious (mechanical guts hidden).
- GM board shows everything; each player's board shows only what's revealed. "GM sees all, players see what's revealed."

**Fog of war (DESIGNED):** exists, **fully GM-controlled** (manual, not auto-computed line-of-sight). Hides *areas* of the map. Operates at the **grid-square level**:
- **Cover all** — fog the entire map at once (starting state for a new area).
- **Click a square to toggle** — click a fogged square to reveal it, click a revealed square to re-cover it. Click-drag across several works too. Fully bidirectional (fixes misclicks, lets areas go dark again when the party leaves).
- **Remove all** — clear all fog (fully explored, or a map that needs none).
- **Rendered two ways (same fog data):** GM sees fogged squares **semi-transparent** (dimmed but can see the map + hidden tokens underneath — knows what they're revealing). Players see fogged squares **fully opaque** (solid, no peeking). Consistent with "GM sees all, players see what's revealed."

**Hidden tokens (DESIGNED):** separate from fog — hides a *specific token* (ambushers, NPCs, traps) rather than an area. GM sees/places/preps it; players don't see it until the GM reveals it. Fog hides *where*; hidden tokens hide *who/what*. They compose (a revealed room can still contain a hidden token).

**Traps = a bestiary subsection (DESIGNED):** traps are placeable things-with-stats, added via the same add-creature panel (browse prebuilt / quick-build / optional-save), just a different category. 
- **Trap-specific fields** (the add panel adapts its fields by category): detection difficulty (DC to spot), trigger (e.g. entering the space), effect/damage, disarm difficulty (DC to remove — ties to Sleight of Hand / trap-making skills). Contrast creature fields: HP/DR/damage.
- **Three-state lifecycle:** hidden → revealed (spotted, not yet sprung — players avoid/disarm) → sprung/triggered. GM moves it between states.
- **Trigger logic (GM-arbitrated, assist-not-automate):** undetected trap + a token enters its space → GM springs it (reveal + effect). Actively searching players + successful Perception/Search vs. detection DC → GM reveals it safely *before* trigger. Same trap, outcome depends on whether players were looking. App holds trap data and lets the GM flip states; it does NOT auto-fire.

**Add-creature panel (DESIGNED, mockup pending):** two paths side by side.
- **Bestiary (browse):** two tabs — "Bestiary" (Solryn prebuilt creatures, system data) + "My creatures" (GM's saved customs). Search + scrollable list; each row = art tile + name + stat line (HP·DR·Tier) + "+" to place. Tapping generates a token wearing the creature's image, backed by its stat block.
- **Quick build (custom):** small form — name, HP/DR/damage (or trap fields for traps), optional image, and a checked-by-default **"Save to my creatures for reuse"** checkbox (optional-save: throwaway if unchecked, joins the library if checked). "Place on board" button.
- Both paths produce the same thing: a token with art + a backing stat block. Player-character tokens are the player-side equivalent (generated at character creation).
- **Bestiary is two-tier:** Solryn prebuilt + GM saved customs, living together. Same "everything is data" payoff; a custom system supplies its own creatures.

**STILL TO DESIGN (map/board):** mockups polish only — system is fully specced.

**On-board GM map tools (DESIGNED — RIGHT edge bar, mirrors the left tool bar):** the map tools live in a thin **right edge bar** with fly-out drawers, exactly mirroring the left tool bar's pattern. The board gets symmetric thin icon strips both sides; only an open fly-out drawer spends board space (board reclaims full width when none is open). Icons grouped with dividers: [Select/move · Measure] | [Fog · Add-creature] | [Grid-toggle · Maps]. Active tool highlights.
- Note on role symmetry: player board = tools left / character-quick-view right; GM board = drawer tools left / map tools right (GM has no character quick-view, so the right is free). "Right side" means different things per role — intentional, since each role's right-hand need differs.
- **Fog** → fly-out drawer with "Cover all / Clear all" + click-to-toggle hint; fog mode = click squares to toggle.
- **Add-creature** → fly-out (or panel) with the bestiary/quick-build.
- **Grid-toggle** = live show/hide grid overlay.
- **Maps** → fly-out **map library** (this game's named maps) to swap the active map or upload a new one. (Map swapping lives here.)
- Measure = deferred distance tool, present for later.

### 4.12 Real-Time Sync Model (DESIGNED)
How multiple people share one live game. Underpins the whole multiplayer experience.

**Single source of truth + permission-filtered live views.** Game state lives in one place (Firebase Realtime DB — the right backend for this). Nobody's screen holds the "real" version; every screen is a live window onto Firebase. An allowed change writes to Firebase; Firebase pushes it to everyone. Build the sync mechanism ONCE — tokens, fog, HP, initiative, chat are all just "game state" riding the same mechanism.

**Filtering by role (render-time, not separate copies):** one shared state; each window draws its permission-appropriate slice based on the viewer's role and the data's flags.
- **GM window:** everything unfiltered — full map + all fog (semi-transparent), all tokens incl. hidden, full monster stats, player stats (read-only), all initiative, public chat. (Not shown: player-to-player whispers — pending the open decision.)
- **Player window:** revealed fog only (fogged = opaque), visible tokens only (hidden tokens not rendered), monsters as **name + image only** (no stats), own character (editable), other players (read-only basics), chat they're party to.
- A hidden token *exists* in the data with `visible:false`; the GM draws it dimmed, players skip it. Same pattern for fog state and monster stats. (Player-to-player whispers are NOT in the GM window — private by decision.)

**Filtering is CLIENT-SIDE (decided).** Full state goes to everyone; each window simply doesn't *render* what the viewer shouldn't see. Rationale: ~99.9% of players never try to dig out hidden info, and "locks only keep out honest people." Simpler to build; experience identical for normal players. Server-side filtering can be added later IF high-stakes/public games ever need truly-secret data. Not now.

**Responsiveness — "nearly instant" is load-bearing** (lag breaks immersion; people check out / scroll / lag out mid-fight):
- **Your own actions = optimistic/local-first:** your screen updates immediately, before the server confirms; the Firebase write happens in the background. Zero perceived lag on your own moves.
- **Others' actions = fast realtime push:** Firebase pushes changes to everyone in a fraction of a second — reads as "live."
- **Conflict-free by design:** because of the ownership rules (each token has exactly ONE controller — players move only their own, GM moves monsters), two people can never grab the same token. The messiest sync conflict can't occur. Only trivial connection-hiccup staleness remains (self-corrects invisibly). No conflict-resolution engineering needed.

### 4.13 Initiative Tracker (DESIGNED)
Solryn initiative = d20 + Nimbleness modifier, rolled fresh each combat, highest first, players win ties vs monsters.

**Starting combat (drag-select + right-click):**
- GM **drag-selects** the monster tokens actually in this fight (or shift-click), then **right-clicks → "Roll initiative."** Only the *selected* tokens roll in — NOT every monster on the map (a dungeon has many encounters; you only fight the 3 goblins in front of you). This right-click context menu is also home to other GM token actions (remove, mark defeated, edit, reveal/hide).
- Rolling initiative **opens the tracker** (= combat starts) and rolls the selected monsters in (app knows each monster's Nim mod).
- **Players roll themselves in:** each character sheet has a dedicated **initiative button**. When the GM opens combat, every player's button **highlights and becomes clickable**. Tap to roll d20 + own Nim mod and drop into the order.
  - Button states: **dormant** (no active combat, un-highlighted, inert) → **active** (combat open, not yet rolled in — highlighted) → **done** (already in tracker — inert; the guard prevents re-rolling/duplicating mid-combat).
- Combatants **trickle in** as players tap (takes a few seconds, no "everyone ready" confirmation needed). Ownership split: GM rolls monsters, each player rolls self.

**Tracker UI — bottom-of-screen horizontal strip:**
- Combatants laid out left→right in turn order as **portraits/tokens** (their art). **Whoever's turn it is sits CENTERED** and emphasized (highlight/glow/border); the strip scrolls so the current combatant stays centered — you see who just went (one side) and who's next (other side).
- The current combatant's **token on the map is also highlighted** (strip portrait ↔ map token linked).
- Shared state, permission-filtered: players see monster entries as name + image only; GM sees all.
- **Round counter** (Round 1, 2, 3…) ticks up each time the order loops to the top.

**Advancing turns (split control):**
- **Players can end their own turn** (an "End turn" action available only on their own turn — self-owned, like rolling their own initiative; speeds play).
- **GM has a "next" button** that always advances regardless of whose turn it is — needed for monster turns (monsters don't end their own) and overrides (afk player, skip, move things along). Turns never get stuck: on a player turn either the player ends or the GM advances; on a monster turn the GM advances.

**Death mid-combat:** a slain monster **grays out in place** (preferred over removal — keeps the strip order stable, no reflow/disorientation; shows what's fallen; GM skips past it). Triggers the harvest/loot flow (§4.14).

**Tracker lifecycle:** GM opens (drag-select → roll) → combatants trickle in → runs through the order, looping with the round counter → GM ends combat → tracker clears, player buttons go dormant.

### 4.14 Harvest / Loot / Quality Mechanic (DESIGNED) — a UNIVERSAL system
What started as "monsters drop loot" generalized into one **universal harvest/collection mechanic** covering combat loot, skinning, foraging, ore/material gathering, and soul-core extraction. Build once, reuse everywhere — very "everything is data."

**Core mechanic:** a harvestable thing (slain monster, plant, ore node, chest, soul-core creature) defines a **pool/yield**. A character rolls **d100 + governing-skill bonus** → result maps to a **quality tier**. The tier determines the **grade/quality** of material extracted (NOT the quantity — quality was chosen deliberately; it's more evocative and threads into crafting).

**Skill gates it (Solryn rule: no skill = auto-fail).** You CANNOT attempt a harvest without the governing skill — the option is unavailable/grayed ("requires Leatherworking"). Consequence: only *trained* characters ever roll, so every harvest roll already includes at least a Novice bonus; there's no raw unmodified roll. This makes crafting/trade skills a **gate to whole activities**, not just a bonus — big weight on skill choices. Governing skill varies by task (Leatherworking → skinning, Herbalism → foraging, etc.).

**Assist:** if another party member shares the relevant skill, they can help — the harvester then **rolls two d100s and takes the highest** (the existing advantage pattern). Shared skills become socially valuable.

**Quality tiers map to the CRAFTING RARITY SCALE** (one vocabulary across harvest → material → craft; a "Rare hide" feeds a "Rare" craft, no translation) **plus "Ruined" at the bottom** as a genuine failure floor (botched even by a trained hand). d100 bands:
- **Ruined:** 1–8 (rare bad luck; shrinks naturally as skill bonus rises)
- **Common:** 9–40
- **Uncommon:** 41–68
- **Rare:** 69–86
- **Very Rare:** 87–96
- **Legendary:** 97–100
- **Over 100 caps at Legendary** (mastery reliably maxes out). Bell-ish weighting: Common/Uncommon fat middle, Ruined + Legendary rare tails. Skill bonus + assist die push results up the ladder — skill is transformative.

**Combat loot vs. solo harvest (same engine, different roller):**
- **Combat loot:** the **whole party rolls d100, highest roll counts** (cooperative — nobody's roll takes from another; high roll helps everyone). The party then **divides the spoils among themselves narratively** (system stays out of who-gets-what — avoids internal conflict).
- **Solo harvest (skinning/foraging/etc.):** the **individual doing the task rolls** (their roll + their skill, + assist die if helped).

**Data implications:** each bestiary creature carries a **loot/harvest pool**; harvestable map nodes (plants, ore) carry a pool + governing skill. **Soul cores** (§6.5 — typed magical cores harvested from magical creatures, Common/Uncommon/Rare) are a specialized instance of this same mechanic — harvesting a fire creature rolls for an Infernal Core at a quality determined the same way.

## 5. Remaining To Design
**All core design items are RESOLVED.** The app is fully specified for a first build against Solryn-as-preset.
- (Deferred — OUT OF SCOPE for first build) System builder window. First build targets Solryn-as-preset; the data-driven architecture leaves room for it later.

**RESOLVED in the final session:** whisper privacy (player↔player private from GM); build/play mode (permanent one-way switch at Finish); level-up grant (party-wide only); on-board map tools (right edge bar mirroring the left, board stays clear); map swapping (via Maps → map library); spell-list page (§4.7).

## 6. Visual Language
Dark theme. Flat surfaces, no gradients/heavy shadows. Teal `#5DCAA5` = accent/active. Surfaces: board `#1a1d24`, bars/header `#23262e`, raised `#2e323c`. Muted text `#9aa0ab`, primary `#e6e7ea`, hairline borders `rgba(255,255,255,0.12)`. Parchment/light theme variant = later. Defer to existing project theme tokens where they exist.

**Semantic color conventions (consistent across the app):**
- **Amber** `#EF9F27` = "earned but not yet realized / pending / penalty / level-up" — used for pending-training skill points, the DR/Speed "completes later" notes, level-up reminders. Whenever something is owed/pending, it's amber.
- **Purple** `#7F77DD` = Arcana / spells (the Arcana tracker, the spell row, cast buttons).
- **Teal** = HP, active/selected, primary actions.
- **Red** `#E24B4A` = damage / minus actions.
