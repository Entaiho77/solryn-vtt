# Status Brief: Solryn Character Builder Implementation

## Summary
Implemented the 7-step Solryn character creation wizard end to end — ability scores → race → HP/DR → speed → skills → spells → gear → review/confirm. Confirming saves a character record and an auto-populated token to the room. Build passes; not yet manually tested in browser.

## Completed ✅
- `src/utils/solrynCharacterRules.js`: All calculation helpers (modifier, 2d4 roll, HP, DR base, base speed, spells known) plus a weapon-skill→item-id lookup
- `src/components/charactercreation/AbilityScoreStep.jsx`: Sequential 2d4 rolls (Str→Luck), no rearranging, modifiers shown live
- `RaceSelectionStep.jsx`: Fetches all 9 races from the Solryn API, applies bonuses, prompts for a stat choice when a bonus is "any" or "X-or-Y"
- `HPAndDRStep.jsx` / `MovementSpeedStep.jsx`: Read-only calculation displays, no input
- `SkillSelectionStep.jsx`: Fetches base/weapon/crafting skill lists from the API, enforces exactly 3+3+1
- `SpellSelectionStep.jsx`: Computes spells known from Arcana modifier, auto-grants 3 bonus non-damaging spells for Elves (separate from the selectable count)
- `StartingGearStep.jsx`: Light/Medium armor only, weapon list filtered to selected weapon skills, auto-selected toolset, read-only backpack, final DR/Speed recalculated
- `ReviewScreen.jsx`: Full summary + step-picker "Back to Edit" menu (Option B from the original spec)
- `SolrynCharacterBuilder.jsx`: Wrapper/router across all 8 screens (7 steps + review), modal overlay
- `src/services/characterService.js`: Saves character + token + sheet
- `Toolbar.jsx` / `App.jsx`: "Create Character" button, gated to players (`!isGm`) in Solryn-system rooms (`system === 'Solryn'`) — GM never sees it
- `database.rules.json`: Added `characters` node rules (write once on creation by the owning player, room-wide read)

## Tested ✅
- `npm run build` passes clean
- Not yet tested live in browser — flagging this explicitly rather than claiming it works

## Issues / Blockers ⚠️
- **No Firestore in this app — adapted to Realtime Database.** The brief's pseudo-code used `setDoc`/`firebase/firestore`. This project only uses Firebase Realtime Database (see `useRoomSync.js`/`gameService.js`). Rewrote `characterService.js` to use `ref`/`push`/`set` from `firebase/database`, matching the existing sync layer instead of introducing a second Firebase product.
- **Weapon skills (22) don't map 1:1 onto equipment.json's weapon groups (5 groups, ~26 items).** Skills like Daggers, Staves, Wands, Flails, Firearms have no matching starting-gear weapon in the data yet. Built a best-effort `WEAPON_SKILL_TO_ITEM_IDS` map for skills that do have a plausible match; for any combination with no match, `StartingGearStep` falls back to showing the **full** weapon list rather than blocking the player. Recommend: expand `equipment.json`'s weapon entries to cover the remaining skill categories, or accept the fallback as permanent behavior.
- **Toolset names are derived, not data-backed.** `crafting skill name + " Tools"` (e.g. "Blacksmithing Tools") rather than a real toolset catalog, since `equipment.json` has no toolset list. Fine for now; flag if a real toolset table should exist.

## Design Decisions Made
- Used the API client (`solrynApi.fetchList`) directly for races/spells/equipment instead of routing through the system-aware `getSystemApi()` resolver, since this builder is Solryn-only by construction (gated on `system === 'Solryn'` already) — no need for the extra indirection here.
- Skills are fetched with a raw `fetch` call rather than `solrynApi`, because `solrynApi.fetchList('skills')` already flattens base/weapon/crafting into one array, but the builder needs them grouped (3 separate categories with separate caps). Pulled the raw endpoint instead of re-splitting a flattened list.
- Character builder is a full-screen modal overlay (not a drawer), since it's a multi-step flow distinct from the existing left/right drawer pattern.

## Code Quality Notes
- All character math lives in one pure-function file (`solrynCharacterRules.js`) so the designer or a future contributor can audit the formulas without digging through component JSX.
- `characterService.js` intentionally mirrors `gameService.js`'s style (plain async functions over `ref`/`set`) rather than introducing a new data-access pattern.

## Questions for Designer
- Should we expand `equipment.json` to give every weapon skill a real starting weapon (closing the Daggers/Staves/Wands/Flails/Firearms gap), or is "fall back to full weapon list" an acceptable permanent behavior?
- Toolsets: keep the derived `"{Skill} Tools"` naming, or do you want a real toolset catalog (with descriptions) added to the API data?

## Next Steps
- Manual browser test of the full flow: create a Solryn room as a player, roll through all 7 steps, confirm, verify token + sheet populate correctly on the board
- Verify GM cannot see/access the Create Character button
- Decide on the two open data-gap questions above

## Files Modified
- Created: `src/utils/solrynCharacterRules.js`
- Created: `src/components/charactercreation/AbilityScoreStep.jsx`
- Created: `src/components/charactercreation/RaceSelectionStep.jsx`
- Created: `src/components/charactercreation/HPAndDRStep.jsx`
- Created: `src/components/charactercreation/MovementSpeedStep.jsx`
- Created: `src/components/charactercreation/SkillSelectionStep.jsx`
- Created: `src/components/charactercreation/SpellSelectionStep.jsx`
- Created: `src/components/charactercreation/StartingGearStep.jsx`
- Created: `src/components/charactercreation/ReviewScreen.jsx`
- Created: `src/components/charactercreation/SolrynCharacterBuilder.jsx`
- Created: `src/components/charactercreation/CharacterBuilder.css`
- Created: `src/services/characterService.js`
- Modified: `src/board/Toolbar.jsx`
- Modified: `src/App.jsx`
- Modified: `database.rules.json`

## Commit-Ready?
No — committed and pushed to the branch, but **not yet manually tested in browser**. Recommend a live test pass (and a Firebase console rules update, same manual-publish step as last time) before calling this done.
