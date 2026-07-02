import type {
  Ancestry,
  ClassDefinition,
  RacialBreath,
  Subrace,
  SystemDefinition,
} from '../../engine/schema';
import type { Character } from '../../data/types';
import {
  armorClass,
  attackBonus,
  classLevel,
  computeModifier,
  maxHitPoints,
  proficiencyBonus,
  saveModifier,
  spellSlots,
} from '../../engine/rules';

/** The six 5e abilities, in display order (matches the 5e coreStats ids). */
export const ABILITY_IDS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
export type AbilityId = (typeof ABILITY_IDS)[number];

/** The standard array, highest → lowest. */
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
/** Damage notation with an ability modifier folded in (no "+0"). */
const diceWithMod = (dice: string, mod: number) => (mod === 0 ? dice : `${dice}${signed(mod)}`);

/**
 * Assigned scores + racial ability bonuses (the live effective scores). Applies the base race's
 * and the subrace's fixed bonuses, plus any player-chosen flexible bonuses (Half-Elf's +1 to two
 * abilities), passed as a stat→amount map.
 */
export function effectiveScores(
  assigned: Record<string, number>,
  ancestry?: Ancestry,
  subrace?: Subrace,
  choices?: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = { ...assigned };
  for (const b of [...(ancestry?.bonuses ?? []), ...(subrace?.bonuses ?? [])]) {
    if (b.kind === 'fixed') out[b.stat] = (out[b.stat] ?? 0) + b.amount;
  }
  for (const [stat, amount] of Object.entries(choices ?? {})) {
    out[stat] = (out[stat] ?? 0) + amount;
  }
  return out;
}

/** Dragonborn breath dice by character level (SRD: 2d6 → 5d6 at 6/11/16). */
function breathDice(level: number): string {
  return level >= 16 ? '5d6' : level >= 11 ? '4d6' : level >= 6 ? '3d6' : '2d6';
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
  // --- Background (5e) ---
  backgroundName?: string;
  backgroundFeature?: { name: string; description: string };
  // --- Race (5e) ---
  raceName?: string;
  subraceName?: string;
  speed: number;
  /** Mechanical race/subrace trait strings for the sheet. */
  raceTraits: string[];
  /** Damage resistances (Dwarf poison, Dragonborn/Tiefling elemental). */
  resistances: string[];
  /** Dragonborn breath weapon, resolved for this level (dice + save DC). */
  breath?: RacialBreath & { dice: string; dc: number };
  /** Halfling Lucky — drives a manual reroll toggle on the sheet. */
  lucky: boolean;
  /** Spellcasting block — present only for caster classes; absent for martials. */
  spell?: {
    ability: string;
    model: 'known' | 'prepared' | 'spellbook';
    /** Max slots by slot level (1–9) at this level; current lives on play.spellSlots. */
    maxSlots: Record<number, number>;
    cantripsKnown: number;
    /** Spells known at this level (known casters); 0 for prepared/spellbook. */
    spellsKnown: number;
    /** Spells preparable per day (prepared/spellbook): ability mod + level, min 1. */
    preparedCount: number;
    /** Spell save DC = 8 + proficiency + ability mod. */
    saveDc: number;
    /** Spell attack bonus = proficiency + ability mod. */
    attackBonus: number;
  };
}

/**
 * Everything a 5e PC sheet needs, derived from the class + scores + equipment via the Phase A
 * progression module. The combat numbers (attackBonus / ac) are exactly what the
 * attackRollVsAc resolver consumes — no parallel PC combat path.
 */
export function pcDerived(system: SystemDefinition, character: Character): PcDerived {
  const rule = system.modifierRule;
  const cls = system.classes?.find((c) => c.id === character.definition.classId);
  const ancestry = system.ancestries.find((a) => a.id === character.definition.ancestryId);
  const subrace = ancestry?.subraces?.find((sr) => sr.id === character.definition.subraceId);
  const background = system.backgrounds?.find((b) => b.id === character.definition.backgroundId);
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

  // Proficient skills: the player's chosen skills plus any the race grants outright (e.g. Elf
  // Perception, Half-Orc Intimidation — the skill-typed entries in grantedProficiencies).
  const grantedProficiencies = [
    ...(ancestry?.grantedProficiencies ?? []),
    ...(subrace?.grantedProficiencies ?? []),
  ];
  const racialSkillIds = grantedProficiencies.filter((pid) =>
    system.skills.some((s) => s.id === pid),
  );
  // Background skills are always proficient too; the Set dedupes an overlap with a class/race
  // pick so a skill is only counted once (proficiency applied once).
  const proficientSkillIds = [
    ...new Set([
      ...character.definition.chosenSkillIds,
      ...racialSkillIds,
      ...(background?.skillProficiencies ?? []),
    ]),
  ];
  const skills = proficientSkillIds.map((sid) => {
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

  // Spellcasting (caster classes only). Save DC / attack use the class's casting ability.
  const sc = cls?.spellcasting;
  const spell =
    sc && cls
      ? {
          ability: sc.ability,
          model: sc.type,
          maxSlots: spellSlots(cls, level),
          cantripsKnown: classLevel(cls, level).cantripsKnown ?? 0,
          spellsKnown: classLevel(cls, level).spellsKnown ?? 0,
          preparedCount: Math.max(1, (mods[sc.ability] ?? 0) + level),
          saveDc: 8 + pb + (mods[sc.ability] ?? 0),
          attackBonus: pb + (mods[sc.ability] ?? 0),
        }
      : undefined;

  const raceTraits = [...(ancestry?.traits ?? []), ...(subrace?.traits ?? [])];
  const resistances = [...(ancestry?.resistances ?? []), ...(subrace?.resistances ?? [])];
  // Breath weapon (subrace/draconic color wins). DC = 8 + CON mod + proficiency (SRD).
  const breathBase = subrace?.breath ?? ancestry?.breath;
  const breath = breathBase
    ? { ...breathBase, dice: breathDice(level), dc: 8 + mods.CON + pb }
    : undefined;

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
    ...(background ? { backgroundName: background.name } : {}),
    ...(background?.feature ? { backgroundFeature: background.feature } : {}),
    ...(ancestry ? { raceName: ancestry.name } : {}),
    ...(subrace ? { subraceName: subrace.name } : {}),
    speed: ancestry?.speed ?? 30,
    raceTraits,
    resistances,
    ...(breath ? { breath } : {}),
    lucky: !!ancestry?.lucky,
    ...(spell ? { spell } : {}),
  };
}

/**
 * The combat numbers to stamp onto a 5e PC's token so other users (the GM) can target it —
 * its AC (read when a monster attacks the PC) and max HP. Uses the same derivation as the sheet.
 */
export function pcTokenStats(system: SystemDefinition, character: Character): { ac: number; maxHp: number } {
  const d = pcDerived(system, character);
  return { ac: d.ac, maxHp: d.maxHp };
}
