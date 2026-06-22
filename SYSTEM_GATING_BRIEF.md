# Brief: Reconciling System-Gating Spec with Current Architecture

## What the designer's spec proposes

A `SystemContext` + `SYSTEM_CONFIG` map that hard-gates the app per system:
parallel character-sheet components (`SolrynCharacterSheet`,
`D&D5eCharacterSheet`), `if (system === SYSTEMS.X)` branches inside
`Toolbar`, `TokenQuickView`, and `ReferenceDropdown`, and per-system API
endpoint config.

## What's actually in the codebase today

The app was deliberately built **system-agnostic** (see `ARCHITECTURE.md`,
Phase 4):

- There is no per-system character sheet component. The GM defines a
  `sheetSchema` — a list of `{id, label, type}` fields — once per room
  (`rooms/{roomId}/sheetSchema`). Every token stores its own values against
  that schema (`tokens/{tokenId}/sheet`, `{fieldId: value}`). One generic
  `SheetDrawer` renders whatever schema is active.
- `Toolbar.jsx`, `TokenQuickView.jsx`, and `ReferenceDropdown.jsx` (in
  `src/board/`, not `src/components/`) contain no per-system branching.
- `SystemSelector.jsx` already exists and just stores a system **label**
  (`game.system`) on the saved game — it doesn't drive any behavior yet.
- Reference/bestiary data already comes from a swappable API client
  (`solrynAPI.js`, formerly `dnd5eAPI.js`) — not from per-system endpoint
  maps baked into components.

## The user's actual requirement (this is the part to design around)

Two things have to both be true:

1. **Generic/Custom must keep working.** A GM running a homebrew system
   needs to freely define their own stats, skills, items — the flexible
   `sheetSchema` model is the reason that works today. Nothing should force
   homebrew games back into a fixed shape.
2. **RAW (rules-as-written) systems must not require manual setup.** If a
   GM picks "Solryn" or "D&D 5e," they should **not** have to hand-build a
   sheet schema, hand-type ability scores, or hand-populate
   races/skills/spells/equipment. The system choice should auto-load all
   of that for them.

The spec's hard-gating approach satisfies requirement 2 but breaks
requirement 1 implicitly — every new system needs its own bespoke
component tree, and "Generic/Custom" has nothing to render under that
model since it isn't a real `SYSTEM_CONFIG` entry.

## Proposed middle ground: presets, not hard gates

Keep the existing flexible-schema engine as the only rendering path. Use
`system` purely as a **trigger for autofill**, not as a branch condition in
UI components:

- **On game creation**, if `system === 'Solryn'` (or another known RAW
  system), auto-populate `rooms/{roomId}/sheetSchema` with that system's
  field set (ability scores, DR, HP, Arcana Points, Luck Points, etc.)
  instead of leaving it empty for the GM to build by hand. "Generic /
  Custom" simply skips this step and the GM builds their own schema, same
  as today.
- **Reference dropdown / bestiary** already resolve their data source via
  a service module (`solrynAPI.js`). Extend that resolution to be
  system-aware (`system === 'Solryn'` → `solrynAPI`, `system === 'D&D 5e'`
  → a future `dnd5eAPI`-equivalent), so the GM never re-points data
  manually — but the *rendering* code (`ReferenceDropdown.jsx`,
  `BestiaryDrawer.jsx`) stays a single implementation, not a fork per
  system.
- No `SolrynCharacterSheet`/`D&D5eCharacterSheet` components, no
  `if (system === ...)` branches scattered through `Toolbar`/
  `TokenQuickView`. One sheet renderer, one toolbar, one quick-view — all
  driven by data (`sheetSchema` + the token's `sheet` values), not by
  system identity.
- Net result for the GM: picking "Solryn" at game creation gets them a
  fully pre-filled character sheet and working reference/bestiary data
  with zero manual setup — the explicit goal — while "Generic/Custom"
  keeps the freeform schema builder exactly as it works today, and adding
  a third RAW system later is "write a preset + point at a data source,"
  not "build a new component tree."

## Addendum: house rules layered on top of a system preset

A follow-on requirement from the user: a GM should be able to customize
their table's rules — house rules, homebrew fields, tweaked stats — while
still being "Solryn" (or whatever RAW system they picked), not dropping
into Generic/Custom to do it. And critically: those edits should be
**tracked as a changelog of deltas from the preset**, not just merged
indistinguishably into the schema, so the GM can review what they've
changed and revert individual changes without wiping their other
customizations or resetting the whole sheet back to RAW defaults.

Concretely, this means:

- When a system preset is applied, keep a record of which `sheetSchema`
  fields came from the preset and their original values (e.g.,
  `rooms/{roomId}/sheetSchemaOverrides` — a list of
  `{fieldId, action: 'added'|'edited'|'removed', originalValue?}` entries —
  rather than just overwriting `sheetSchema` in place with no history).
- A dropdown/panel (GM-only, likely living next to the existing sheet
  schema editor) lists these overrides in plain language — e.g. "Renamed
  'Luck Points' → 'Fate Points'," "Added field 'Corruption'" — each with
  its own **revert** action that restores just that one field to its
  preset value/definition, leaving every other customization intact.
- This is additive to the preset model above, not a competing design: the
  preset still seeds `sheetSchema` on creation; the override log just
  tracks what's drifted from it since, so "Solryn, house-ruled" stays
  legibly different from "Solryn, vanilla" without needing a separate
  system identity for every table's variant.

## Open question for the designer

Does the spec's per-system `SYSTEM_CONFIG` (ability score counts, combat
model flags like `usesArcanaPoints`/`usesSpellSlots`, etc.) have a purpose
beyond seeding the initial `sheetSchema` and choosing a data source? If
there's a planned use for those flags in actual combat/mechanics logic
(e.g., auto-hit resolution, an Arcana Point spend button), that's a
different, larger conversation — worth flagging explicitly rather than
baking in via scattered conditionals.
