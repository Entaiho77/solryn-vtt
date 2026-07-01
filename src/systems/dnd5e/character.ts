import type { Ancestry, ClassDefinition, SystemDefinition } from '../../engine/schema';
import type { Character } from '../../data/types';
import {
  armorClass,
  attackBonus,
  computeModifier,
  maxHitPoints,
  proficiencyBonus,
  saveModifier,
} from '../../engine/rules';

/** The six 5e abilities, in display order (matches the 5e coreStats ids). */
export const ABILITY_IDS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
export type AbilityId = (typeof ABILITY_IDS)[number];

/** The standard array, highest → lowest. */
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
/** Damage notation with an ability modifier folded in (no "+0"). */
const diceWithMod = (dice: string, mod: number) => (mod === 0 ? dice : `${dice}${signed(mod)}`);

/** Assigned scores + a race's fixed ability bonuses (the live effective scores). */
export function effectiveScores(
  assigned: Record<string, number>,
  ancestry?: Ancestry,
): Record<string, number> {
  const out: Record<string, number> = { ...assigned };
  for (const b of ancestry?.bonuses ?? []) {
    if (b.kind === 'fixed') out[b.stat] = (out[b.stat] ?? 0) + b.amount;
  }
  return out;
}

export interface PcDerived {
  cls?: ClassDefinition;
  scores: Record<string, number>;
  mods: Record<string, number>;
  proficiencyBonus: number;
  ac: number;
  maxHp: number;
  saves: { id: AbilityId; mod: number; proficient: boolean }[];
  skills: { id: string; name: string; ability?: string; mod: number }[];
  attacks: { name: string; dice: string; damageType: string; attackBonus: number }[];
  /** Rogue Sneak Attack dice at the character's level (e.g. "1d6"), if the class has it. */
  sneakAttackDice?: string;
}

/**
 * Everything a 5e PC sheet needs, derived from the class + scores + equipment via the Phase A
 * progression module. The combat numbers (attackBonus / ac) are exactly what the
 * attackRollVsAc resolver consumes — no parallel PC combat path.
 */
export function pcDerived(system: SystemDefinition, character: Character): PcDerived {
  const rule = system.modifierRule;
  const cls = system.classes?.find((c) => c.id === character.definition.classId);
  const level = character.play.level;
  const scores = character.definition.coreScores;

  const mods: Record<string, number> = {};
  for (const id of ABILITY_IDS) mods[id] = computeModifier(scores[id] ?? 10, rule);

  const pb = cls ? proficiencyBonus(cls, level) : 2;

  const armor = system.equipment.armor.find((a) => a.id === character.play.equippedArmorId);
  // AC: worn armor wins; else Unarmored Defense (Barbarian/Monk) = 10 + DEX + class ability;
  // else plain 10 + DEX. Armored classes (Fighter) are unaffected.
  const ac =
    armor?.baseAc != null
      ? armorClass(mods.DEX, { baseAc: armor.baseAc, maxDexBonus: armor.maxDexBonus })
      : cls?.unarmoredDefense
        ? 10 + mods.DEX + (mods[cls.unarmoredDefense.ability] ?? 0)
        : armorClass(mods.DEX);

  const maxHp = cls ? maxHitPoints(cls, level, mods.CON) : 0;

  const saves = ABILITY_IDS.map((id) => ({
    id,
    proficient: !!cls?.savingThrows.includes(id),
    mod: cls ? saveModifier(cls, id, mods[id], pb) : mods[id],
  }));

  const skills = character.definition.chosenSkillIds.map((sid) => {
    const sk = system.skills.find((s) => s.id === sid);
    const aMod = sk?.attribute ? (mods[sk.attribute] ?? 0) : 0;
    return { id: sid, name: sk?.name ?? sid, ability: sk?.attribute, mod: aMod + pb };
  });

  const attacks = character.play.equippedWeaponIds
    .map((wid) => system.equipment.weapons.find((w) => w.id === wid))
    .filter((w): w is NonNullable<typeof w> => !!w)
    .map((w) => {
      // Finesse → best of STR/DEX; pure ranged → DEX; melee → STR.
      const aMod = w.finesse ? Math.max(mods.STR, mods.DEX) : w.range ? mods.DEX : mods.STR;
      return {
        name: w.name,
        dice: diceWithMod(w.damageDice, aMod),
        damageType: w.damageType ?? '',
        attackBonus: attackBonus(aMod, pb), // proficient with class weapons
      };
    });

  // Rogue Sneak Attack dice at this level (from the class table counters; SRD key snake_case).
  const sneakAttackDice = cls?.levels.find((l) => l.level === level)?.counters?.sneak_attack;

  return {
    cls,
    scores,
    mods,
    proficiencyBonus: pb,
    ac,
    maxHp,
    saves,
    skills,
    attacks,
    ...(typeof sneakAttackDice === 'string' ? { sneakAttackDice } : {}),
  };
}
