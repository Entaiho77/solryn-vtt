# Solryn VTT — Project Guide for Claude

Read this first. It's the durable context a fresh session needs; deep detail lives in
`docs/Solryn_VTT_Design_Doc.md` and `docs/Solryn_VTT_Build_Brief.md`.

## What this is

A **system-agnostic virtual tabletop**. The *engine* is the product; **Solryn is the first
system it runs** (flagship + proving ground). **Keystone principle: every game system is
DATA, not hardcoded logic.** Components and the rules engine read "the current system's
data"; they never hardcode Solryn's stats, formulas, or rules. Getting the
system-definition schema right is the most important thing in the project.

## Stack

React + Vite + TypeScript · Firebase Realtime Database + Firebase Auth · HTML5 Canvas board ·
Vitest. **No backend beyond Firebase.**

## Architecture (`src/`)

- `engine/` — the product, system-agnostic, never imports a specific system.
  - `schema/` — the contract: `expr.ts` (formula AST — derived stats are data), `modes.ts`
    (menu of mechanical modes), `system.ts` (full `SystemDefinition`).
  - `rules/` — pure functions over any system's data (modifiers, derived, skills,
    progression, harvest, casting, dice) + Vitest tests.
- `systems/solryn/` — Solryn expressed entirely as data. `systems/registry.ts` = the menu.
- `firebase/` — env-driven init + guarded accessors. `data/` — model types, ids, realtime
  sync, game/character/board/chat/combat ops. `permissions/` — ownership/visibility model.
  `auth/` — email + Google. `features/` — auth, lobby, game (→ builder, sheet, board).
  `components/ui/`, `theme/`.

## Conventions (important)

- **Branch:** develop, commit, and push to `claude/affectionate-bell-7g25c0`.
- **Firebase config is 100% env-driven** via `VITE_FIREBASE_*` (`src/firebase/config.ts`).
  Never hardcode keys. `.env.local` is gitignored.
- **Never invent ruleset content.** If canonical data lacks a field (skill blurbs, spell
  synopses, race flavor, creature loot), leave the optional field blank, let the UI degrade
  gracefully, and flag it for the designer — do not fabricate game content.
- **Verify before reporting:** `npm run typecheck`, `npm run test:run` (currently **144
  passing**), `npm run build`.
- Security: RTDB rules in `database.rules.json` enforce ownership (writes); reads are
  currently client-filtered (server-side filtering is a known follow-up).

## How this environment works (this caused real confusion — read it)

This session runs in an **ephemeral cloud container with its own fresh clone**. Edits/commits
happen here and are **pushed to GitHub**. The **user's local machine has a separate clone** —
they must `git pull` (or check github.com) to see this session's commits; their `git log`
won't show pushed work until they fetch. Confirm the true remote state with
`git ls-remote origin claude/affectionate-bell-7g25c0`.

**Network policy blocks** `*.firebaseio.com` / `*.firebasedatabase.app` (Realtime Database)
and `dl.google.com` (emulator jars) from this container; **Auth** (`identitytoolkit`) is
reachable. ⇒ **Live Realtime Database testing must be done on the user's machine/browser**,
not from here. Don't route around egress-policy (403) denials — report them.

## Current state

- All design-doc phases **A–E implemented**, on **canonical Solryn v1.2** content (9 races,
  105 skills, 47 spells, full equipment, 10-creature bestiary).
- Firebase live project **`solryn-virtual-table-top`** (Spark plan): Auth (email+Google)
  verified working; ownership rules deployed by the user. Storage skipped on Spark — map
  images fall back to inline data URLs (≤1.5 MB).
- Recent playtest fixes committed: chat input position + page-height (`.page` uses
  `100dvh`+`overflow:hidden`), token-card position, grid/measure brightness-adaptive
  contrast, map-name truncation, "Saved" creatures tab, stat-abbreviation tooltips, Cast
  button overflow, measure-line cancel (right-click/Esc), centered initiative tracker.
- **Choose Race step redesigned**: compact 3-column grid; replace-on-select side-panel
  detail with a pinned orientation line; flexible-bonus picker under the grid; optional
  `Ancestry.flavor` added (empty for the 9 races, renders only when filled in).

## NEXT UP — candidates (await the user's go-ahead)

The user is steering character-builder design, so the held builder items are the natural
next pieces — confirm scope/approach before building either:
- A welcome/orientation screen before step 1 (lands a new player on "Roll stats" cold today).
- A "Roll all stats" button on the roll step (note the anti-fishing design intent).

## Backlog / known follow-ups

- Builder (held pending design): welcome/orientation screen before step 1; "Roll all stats"
  button.
- `TokenCard`: GM clicking a **player** token shows only a label, no stats — real gap; fix by
  loading `characters/<characterId>` read-only.
- Server-side permission filtering; bundle code-splitting (build warns >500 kB); shield
  equip-slot (data exists, DR formula doesn't read it); spell-modification (AP) UI.
- Outstanding content authoring (designer): skill description/exampleUse + governing ability,
  spell synopses, race flavor (now goes in optional `Ancestry.flavor`), creature loot pools,
  weapon→weapon-skill mapping confirmation.
