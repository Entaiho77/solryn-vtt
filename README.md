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

**Implemented (foundation + Phase A — entry & game shell):**

- ✅ System-definition schema + the complete Solryn seed data (stats, races, skills, spells, equipment, maps, quality tiers, bestiary, rules reference, selected modes).
- ✅ Rules engine (modifiers, derived-stat formulas, skill progression, level-up dice, harvest quality, dice) with 100+ passing tests, including Solryn integration + data-integrity checks.
- ✅ Firebase data model, real-time sync layer, permission/ownership model, auth.
- ✅ Landing/auth (email + Google), lobby (your games, create, join by code), create-game modal, game-settings modal, and the game shell with the GM/player role branch.

**Next phases:** B — character builder (13-step wizard) · C — play-mode sheet · D — board (Canvas) + GM tools · E — combat, harvest, chat, level-up. See [`docs/Solryn_VTT_Build_Brief.md`](./docs/Solryn_VTT_Build_Brief.md).

### Note on seed content

Where the design docs don't enumerate exact lists (the full 32/22/45+ skill lists, races 5–9, the canonical spell/equipment/bestiary entries), the Solryn data includes **representative content flagged `provisional`**. It is structurally complete and runs through the engine; the entries should be reconciled against the canonical Solryn v1.2 ruleset. Expanding them is pure data — no code changes.
