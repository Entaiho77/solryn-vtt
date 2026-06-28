# Phase 1b — Starters folded into the single generator path

- Total runtime entries: **433** (target 433). All emit an `attacks[]` field.
- All 433 now flow through one path: `data/bestiary-source.json` → `genBestiary.ts` → `bestiary.generated.ts`. The hand-authored starter list was removed from `bestiary.ts`.
- Mossback Hare left attackless (empty `attacks[]`), as intended.

## Damage-type flag (Arcane / Psychic)
- The system has **no damage-type enum** — `damageType` is a free string. The only types authored anywhere in the system (weapons/spells) are the abbreviations **`B` / `P` / `S`** (Bludgeoning / Piercing / Slashing).
- So **"Arcane" (Lantern Wraith) and "Psychic" (Hollowkin) are not in any canonical list** — there isn't one. They won't error (free string), but they're inconsistent with the B/P/S convention, as are the elemental types (Acid, Fire, Necrotic, …) across the 423 conversions. No valid list exists to give you; decide if you want a canonical damage-type set defined.

## The 10 starters — emitted attacks

| Starter | speed | attacks[] |
|---|---|---|
| Mossback Hare | 35 | — (attackless) |
| Duskwatcher Owlcat | 30 / glide 40 | Claw/bite 1d6+3 Slashing (Pounce adds +1d4) |
| Bramble Boar | 30 | Gore 1d6+4 Piercing (Charge adds +1d4) |
| Crag Hound | 35 | Bite 1d6+3 Piercing |
| Knockerkin | 25 / climb 20 | Pick jab 1d4+2 Piercing |
| Lantern Wraith | 20 float | Lantern touch 1d6 Arcane |
| Hollow Man | 25 | Slam 1d6+1 Slashing |
| Whippoorwail | 30 fly | Peck 1d4+2 Piercing |
| Hollowkin | 30 / hover 20 | Mind lash 1d8 Psychic |
| T'rellin Shaman | 30 / climb 30 | Staff strike 1d6 Bludgeoning |
