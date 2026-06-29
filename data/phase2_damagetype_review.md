# Damage-type normalization review

**Canonical set (14):** Bludgeoning, Piercing, Slashing, Acid, Fire, Cold, Lightning, Thunder, Necrotic, Radiant, Force, Poison, Arcane, Psychic.
Defined as an importable TS const/union in `src/systems/solryn/damageTypes.ts` (`DAMAGE_TYPES`, `DamageType`, `isDamageType`). `AttackEntry.damageType` stays a plain `string` at the engine layer (engine is system-agnostic); the canonical set is the Solryn-system constraint.

## Result
- **All 433** creatures normalized to canonical full-word types. Source (`bestiary-source.json`) updated and regenerated into the runtime.
- **Unmapped / non-canonical values: none.** Every `damageType` mapped cleanly (case-folded full words; B/P/S expansion was available but no creature used single letters — they were already full words).
- Distinct types now in use across creatures: Acid, Arcane, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder (14/14).

## Flag — weapon/spell data still uses B/P/S (not touched this pass)
The system's weapon/spell content still stores single-letter abbreviations: **`B` ×5, `P` ×12, `S` ×11** in `src/systems/solryn/*.ts`. Per scope I left these alone. Decide later whether to normalize weapons/spells to the canonical full words too (and whether to make their `damageType` reference `DamageType`).
