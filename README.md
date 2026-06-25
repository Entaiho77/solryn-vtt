# Solryn VTT

A **system-agnostic virtual tabletop**. The product is the *engine*; **Solryn is the first system it runs** — the flagship and proving ground, not the product itself.

> **Keystone principle:** every game system is **data, not hardcoded logic**. Components and the rules engine read "the current system's data"; they never hardcode Solryn's stats, formulas, or rules. Getting the system-definition schema right is the most important thing in the project — the schema is the product, and Solryn is the test that proves it works.

This repo is a fresh rebuild against the design docs in [`docs/`](./docs). The previous Flask prototype has been removed.

## Stack

- **React + Vite + TypeScript**
- **Firebase Realtime Database** (single source of truth, live sync) + **Firebase Auth** (email/password + Google)
- **Vitest** for the rules-engine tests
- HTML5 Canvas for the board (later phase)

## Architecture

The codebase separates the **engine** (system-agnostic) from **systems** (data presets) from **app** (UI + backend):

```
src/
  engine/              # The product. System-agnostic; never imports a specific system.
    schema/            # The system-definition schema — the core contract:
      expr.ts          #   formula AST (derived stats are DATA, not code)
      modes.ts         #   the "menu of mechanical modes" each system selects from
      system.ts        #   the full SystemDefinition shape
    rules/             # Pure functions that read any system's data generically:
      modifiers · expr-eval · derived · skills · progression · harvest · dice
      __tests__/       #   Vitest coverage of all engine logic
  systems/
    solryn/            # Solryn expressed entirely as data (the first preset)
    registry.ts        # systemId → SystemDefinition (the create-game menu)
  firebase/            # Firebase init (env-config + emulator), guarded accessors
  data/                # Data model types, ids, realtime sync helpers, game operations
  permissions/         # Ownership/visibility model (GM sees all, players see revealed)
  auth/                # Auth context (email/password + Google)
  components/ui/       # Reusable primitives: Button, Modal, TextField, Avatar, Badge
  features/            # Screens: auth, lobby, game
  theme/               # Design tokens (dark/flat) + global styles
```

**How multi-system support grows:** the engine offers a finite, growing *menu of modes* (combat resolution, casting, progression, skills). Solryn selects one combination (auto-hit-vs-DR, Arcana point-pool, classless dice-roll, tiered+training). A future system reuses these modes or adds one new variant — which then benefits every later system. The custom-system builder is a deferred future phase; the architecture leaves room for it without a rewrite.

## Getting started

```bash
npm install
```

### Configure Firebase

Copy the example env file and fill in your Firebase web config:

```bash
cp .env.example .env.local
# edit .env.local with values from Firebase console → Project settings → Your apps
```

Or run against the local emulators (no real project needed):

```bash
# set VITE_USE_FIREBASE_EMULATOR=true in .env.local, then:
npx firebase emulators:start   # auth :9099, database :9000
```

> The app still renders without Firebase config — the auth screen shows a setup notice instead of crashing.

### Develop / build / test

```bash
npm run dev          # start the dev server
npm run build        # typecheck + production build
npm run test         # watch tests
npm run test:run     # run tests once
npm run typecheck    # tsc, no emit
```

## Status

**Foundation:**

- ✅ System-definition schema + the complete Solryn seed data (stats, races, skills, spells, equipment, maps, quality tiers, bestiary, rules reference, selected modes).
- ✅ Rules engine (modifiers, derived-stat formulas, skill progression, level-up dice, harvest quality, dice) with full test coverage, including Solryn integration + data-integrity checks.
- ✅ Firebase data model, real-time sync layer, permission/ownership model, auth.

**Phase A — entry & game shell:** landing/auth (email + Google), lobby (your games, create, join by code), create-game modal, game-settings modal, game shell with the GM/player role branch.

**Phase B — character builder:** the data-driven 13-step wizard (the step plan is generated from the system definition, not hardcoded). Roll stats (anti-fishing) → race (flexible bonuses) → derived "show, don't ask" pages → skills (3 sub-pages) → conditional spells → reputation → gear (finalizes DR/Speed). "Finish" flips `buildComplete` permanently.

**Phase C — play-mode sheet:** the full interactive §4.6 sheet — core stats, the reusable HP/Arcana/Luck resource tracker (×3), combat/movement strip, the three-across skills section (tiers, bubbles, training-gate pending state), unified attacks & damage (weapons + selectable spell with auto-deducting Cast), gear, and the §4.7 spell-book overlay. Edits write live to Firebase.

**Phase D — the board:** HTML5 Canvas board (map placed at top-left, fixed grid + toggle, no stretch), real-time map/token/fog state, the role-configured edge-bar/drawer shell, GM map tools (map upload with type/scale, fog of war with cover/clear/click-paint, add-creature from the bestiary / a saved "my creatures" library / a quick build), tokens with snap-to-grid drag and the permission matrix (control follows ownership; players see monsters as name+image only; hidden tokens), the **measure/distance** tool, the **trap 3-state lifecycle** (hidden → revealed → sprung), the floating token card (GM HP/damage/hide/defeat/trap controls), and the player board view (character quick-view drawer + full-sheet overlay, Dice and Rules-reference drawers). Map images upload to **Firebase Storage** when configured, falling back to inline data URLs.

**Phase E — combat & systems:** the initiative tracker (GM selects creatures → roll, players roll themselves in, bottom turn-strip with the current combatant centered + their map token highlighted, round counter, GM-next / player-end-turn, defeated monsters gray out), the universal harvest/loot mechanic (skill-gated d100 + assist → quality tier, from a defeated creature), chat with **private whispers** (the GM can't see player↔player), per-player private notes, and the level-up ceremony (GM grants party-wide → player rolls increases in order → recalculate → +2 skill points, pending until trained).

**All design-doc phases (A–E) are implemented**, now running on the **canonical Solryn v1.2 content** (9 races, 32 base / 22 weapon / 43 crafting skills + Action Economy, ~47 spells, full armor/shield/weapon tables, the 10-creature starter bestiary, soul cores & threat tiers). Remaining work is polish and hardening: server-side permission filtering, bundle code-splitting, and the board's drag-select + right-click niceties.

### Outstanding content (flagged for the ruleset author)

The mechanical data is canonical; a few descriptive/structural items the v1.2 ruleset doesn't enumerate are intentionally left blank rather than invented (the UI degrades gracefully): skill `description`/`exampleUse` blurbs and governing-ability mapping; fuller spell `synopsis` text; per-creature loot/harvest pool contents; and confirmation of the weapon→weapon-skill mapping (crossbows under "Specialty Bows", etc.). Two small follow-up features: a shield equip-slot (shield data exists; the DR formula doesn't yet read it) and a spell-modification (AP-spend) UI.
