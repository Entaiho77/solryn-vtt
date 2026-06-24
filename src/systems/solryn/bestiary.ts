import type { BestiaryEntry, StatBlockShape } from '../../engine/schema';

/**
 * Stat-block shapes let the add-creature panel adapt its fields by category: creatures
 * carry HP/DR/damage; traps carry detection/disarm DCs, trigger, and effect. Both are
 * just "things with a stat block" placed as tokens.
 */
export const statBlockShapes: StatBlockShape[] = [
  {
    id: 'creature',
    label: 'Creature',
    fields: [
      { id: 'hp', label: 'HP', type: 'number' },
      { id: 'dr', label: 'DR', type: 'number' },
      { id: 'damage', label: 'Damage', type: 'dice' },
      { id: 'tier', label: 'Tier', type: 'number' },
    ],
  },
  {
    id: 'trap',
    label: 'Trap',
    fields: [
      { id: 'detectionDC', label: 'Detection DC', type: 'number', hint: 'DC to spot' },
      { id: 'trigger', label: 'Trigger', type: 'text' },
      { id: 'effect', label: 'Effect / Damage', type: 'text' },
      { id: 'disarmDC', label: 'Disarm DC', type: 'number', hint: 'ties to Trapmaking / Sleight of Hand' },
    ],
  },
];

/**
 * The Solryn bestiary (system data). The board's "My creatures" tab holds GM customs
 * alongside these. Representative content, flagged provisional.
 */
export const bestiary: BestiaryEntry[] = [
  {
    id: 'goblin-warrior',
    name: 'Goblin Warrior',
    category: 'creature',
    stats: { hp: 5, dr: 5, damage: '1d6+1', tier: 1 },
    abilities: ['Nimble Escape: can disengage or hide as a bonus action.'],
    lootPoolId: 'goblin-loot',
    provisional: true,
  },
  {
    id: 'stone-golem',
    name: 'Stone Golem',
    category: 'creature',
    stats: { hp: 16, dr: 8, damage: '2d10+2', tier: 5 },
    abilities: [
      'Immutable Form: immune to any spell that would alter its form.',
      'Magic Resistance: advantage on saves against spells.',
    ],
    lootPoolId: 'golem-core',
    provisional: true,
  },
  {
    id: 'spiked-pit',
    name: 'Spiked Pit',
    category: 'trap',
    stats: {
      detectionDC: 13,
      trigger: 'Entering the covered square',
      effect: '2d6 piercing, fall prone',
      disarmDC: 15,
    },
    provisional: true,
  },
];
