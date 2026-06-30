import type { Ancestry } from '../../engine/schema';

/** Minimal 5e races — Phase B/C ships only the standard Human (+1 to all six abilities). */
export const ancestries: Ancestry[] = [
  {
    id: 'human',
    name: 'Human',
    bonusSummary: '+1 to all six ability scores.',
    bonuses: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((stat) => ({
      kind: 'fixed' as const,
      stat,
      amount: 1,
    })),
    advantages: [],
    weaknesses: [],
    speed: 30,
    size: 'Medium',
    traits: ['Extra language of your choice.'],
  },
];
