import type { ClassDefinition, ClassLevel } from '../../../engine/schema';

/**
 * Fighter — populated as the proof the class shapes hold a real SRD class 1–20. Features are
 * named per level (subclass features appear as generic "Martial Archetype feature" entries
 * until subclasses are modeled). Non-caster, so no spellSlots.
 */

// 5e proficiency bonus by character level.
const profBonus = (l: number): number => (l < 5 ? 2 : l < 9 ? 3 : l < 13 ? 4 : l < 17 ? 5 : 6);

// Fighter is distinctive: ASIs at 6 and 14 in addition to the usual 4/8/12/16/19.
const ASI_LEVELS = new Set([4, 6, 8, 12, 14, 16, 19]);

const FEATURES: Record<number, string[]> = {
  1: ['Fighting Style', 'Second Wind'],
  2: ['Action Surge (one use)'],
  3: ['Martial Archetype'],
  4: ['Ability Score Improvement'],
  5: ['Extra Attack'],
  6: ['Ability Score Improvement'],
  7: ['Martial Archetype feature'],
  8: ['Ability Score Improvement'],
  9: ['Indomitable (one use)'],
  10: ['Martial Archetype feature'],
  11: ['Extra Attack (2)'],
  12: ['Ability Score Improvement'],
  13: ['Indomitable (two uses)'],
  14: ['Ability Score Improvement'],
  15: ['Martial Archetype feature'],
  16: ['Ability Score Improvement'],
  17: ['Action Surge (two uses)', 'Indomitable (three uses)'],
  18: ['Martial Archetype feature'],
  19: ['Ability Score Improvement'],
  20: ['Extra Attack (3)'],
};

const levels: ClassLevel[] = Array.from({ length: 20 }, (_, i) => {
  const level = i + 1;
  return {
    level,
    proficiencyBonus: profBonus(level),
    features: FEATURES[level] ?? [],
    ...(ASI_LEVELS.has(level) ? { abilityScoreImprovement: true } : {}),
  };
});

export const fighter: ClassDefinition = {
  id: 'fighter',
  name: 'Fighter',
  description: 'A master of martial combat, skilled with a variety of weapons and armor.',
  hitDie: 'd10',
  primaryAbilities: ['STR', 'DEX'],
  savingThrows: ['STR', 'CON'],
  proficiencies: {
    armor: ['light', 'medium', 'heavy', 'shields'],
    weapons: ['simple', 'martial'],
    tools: [],
  },
  skillChoices: {
    choose: 2,
    from: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
  },
  startingEquipment: [
    'Chain mail, or leather armor + longbow + 20 arrows',
    'A martial weapon and a shield, or two martial weapons',
    'A light crossbow + 20 bolts, or two handaxes',
    "A dungeoneer's pack, or an explorer's pack",
  ],
  levels,
  subclassLevel: 3,
  subclasses: [], // minimal — subclass features not yet modeled
};
