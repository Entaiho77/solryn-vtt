# System Presets — Implementation Spec

Answers to the designer's clarification questions, plus the resulting
spec and file change list.

## 1. Runtime logic vs. metadata

**None of the `SYSTEM_CONFIG` combat/mechanics flags
(`usesArcanaPoints`, `usesSpellSlots`, `combatSystem`, `hasClasses`, etc.)
should drive runtime logic right now.** They're metadata for exactly two
things: (a) seeding the initial `sheetSchema`, and (b) picking which API
client to call. There is no "Spend Arcana" button, no auto-hit resolver,
no initiative-by-system branch anywhere in the app today, and building
one isn't part of this request.

Reasoning: the board/combat layer (`Board.jsx`, `TurnDrawer.jsx`, the
sync layer) is currently 100% system-agnostic — it doesn't know what a
"hit point" or "Arcana Point" is, it just renders whatever fields the
schema defines and lets the GM/players track numbers. Wiring
`combatSystem === 'autoHit'` into actual resolution logic is a real
feature (automated combat math) and a substantially bigger scope than
"load the right preset." If/when that's wanted, it should be scoped
separately and explicitly, not smuggled in as a side effect of the
preset flags. For now: **flags are inert outside the two places listed
above.**

## 2. Preset application flow

**Option C, simplified — store the preset reference, apply it once at
creation, no live re-derivation.**

```js
game.system = "Solryn"            // existing label, unchanged
game.sheetSchema = [ ...fields ]  // auto-populated at creation time, then
                                   // owned by the room going forward
```

We don't need a separate `systemPreset: "solryn-v1.2"` version pointer
(Option C as literally specced) — that implies the app re-applies or
diffs against a versioned preset later, which isn't a requirement here
and adds a migration concern (what happens when "solryn-v1.2" changes
and an old room references it?). Simpler: presets are **seed data
applied once at room creation**, after which `sheetSchema` is just a
normal room field the GM edits like today. `system` already round-trips
as a plain label (`rooms/{roomCode}/meta/system`,
`users/{uid}/games/{roomCode}/system`) — no schema change needed there.

Option A (do nothing, empty schema) is what happens today for every
system including Solryn — that's the gap we're closing. Option B is
correct in spirit; we're just rejecting the extra version-pointer
complexity from Option C.

## 3. House rules / override tracking

**Defer.** Build the preset autofill first and ship it. The override
log (`sheetSchemaOverrides`, revert-per-field UI) is a real feature with
its own UI surface (a GM-only panel, diffing logic, a revert action) —
bundling it into the first pass risks neither piece landing cleanly.
Sequence: (1) preset autofill ships and is used for a bit, (2) override
tracking is scoped as its own follow-up once we've seen how GMs actually
edit presets in practice (e.g., do they mostly rename fields, add
fields, both? — that affects what the override UI needs to show).

## 4. API client selection

**Option B — a small resolver module, not a Context.**

```js
// src/services/systemDataService.js
import { solrynApi } from './solrynAPI.js'

const SYSTEM_APIS = {
  Solryn: solrynApi,
  // 'D&D 5e': dnd5eApi,  -- re-add when/if a D&D-backed client exists
}

export function getSystemApi(system) {
  return SYSTEM_APIS[system] ?? null // null => Generic/Custom, no reference data source
}
```

Reasoning: Option A (inline ternary per component) duplicates the
system→client mapping in every consumer and gets worse with each new
system. Option C (a `SystemDataProvider` context) is real overhead for
something that's a pure function of one string — `useReferenceData.js`
and `BestiaryDrawer.jsx` can just call `getSystemApi(system)` directly,
no provider/wrapper needed. `system` is already available wherever
these components render (it's a room field, already synced via
`useRoomSync`), so there's nothing to inject.

Note this only resolves the *data client*; it doesn't change
`ReferenceDropdown.jsx`/`BestiaryDrawer.jsx` rendering, which stays
generic — those components already iterate over whatever the resolved
client returns, no per-system branches in JSX.

## 5. GM customization UI

**Defer**, same reasoning as #3 — it's the UI half of override tracking
and shouldn't be built before the tracking model it displays exists.
What ships now: the GM can already edit `sheetSchema` directly via the
existing sheet-schema editor (renaming/adding/removing fields freely);
preset autofill just changes what that editor starts with. No new UI
component needed for this pass.

---

## Resulting spec

**Schema autofill:** a new `src/constants/systemPresets.js` exports a
map of system label → starter `sheetSchema` array. `createGame()` in
`gameService.js` looks up the preset for the chosen `system` and writes
it to `rooms/{roomCode}/sheetSchema` at creation time (alongside the
existing `meta` write); unknown systems (including "Generic / Custom")
get `[]`, exactly like today.

**API client selection:** `systemDataService.js` (above) is consulted by
`useReferenceData.js` and `BestiaryDrawer.jsx` wherever they currently
import `solrynApi` directly — swapped to `getSystemApi(system)`, with a
`null` result meaning "no reference/bestiary data source for this
system" (Generic/Custom shows the existing empty-state messaging).

**Runtime logic:** none added. `combatSystem`/`usesArcanaPoints`-style
flags are out of scope for this pass entirely — not even captured as
data yet, since nothing reads them. If we want them later for an actual
combat-math feature, that's a new spec.

**Firebase structure:** no schema change beyond what already exists.
`rooms/{roomCode}/sheetSchema` gets non-empty initial content for known
systems; `rooms/{roomCode}/meta/system` keeps being the plain string
label it already is.

## File/component changes, in priority order

1. `src/constants/systemPresets.js` — **new.** Map of system label →
   `sheetSchema` array. Start with one entry: `Solryn` (7 ability
   scores, DR, HP, Arcana Points, Luck Points — matching
   `solryn-api/data/skills.json`/`reference.json` field names so the
   sheet and reference data agree).
2. `src/services/gameService.js` — `createGame()` looks up the preset
   and writes `sheetSchema` in the same call that writes `meta`.
3. `src/services/systemDataService.js` — **new.** `getSystemApi(system)`
   resolver, per #4 above.
4. `src/hooks/useReferenceData.js` — swap `solrynApi` import for
   `getSystemApi(system)`; `CATEGORIES` becomes a function of the
   resolved client (or stays Solryn-only with an early return when the
   resolver returns `null`).
5. `src/drawers/BestiaryDrawer.jsx` — same swap for the creature
   list/detail fetches; empty-state copy when `getSystemApi` returns
   `null` ("No creature data available for this system").
6. `src/board/ReferenceDropdown.jsx` — only touched if `CATEGORIES`
   stops being a static export in step 4; otherwise no changes (it
   already renders generically).

No changes to `Board.jsx`, `Toolbar.jsx`, `TokenQuickView.jsx`,
`SheetDrawer.jsx`, or the sync layer — confirming the "presets, not
gates" boundary holds: system selection only ever touches schema seeding
and data-source resolution, nothing else in the render path.
