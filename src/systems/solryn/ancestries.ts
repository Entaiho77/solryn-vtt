import type { Ancestry } from '../../engine/schema';

/**
 * The nine Solryn races. Flexible-bonus races (Human, Dwarf, Elf) expand inline at
 * creation so the player assigns the choice before it applies to the live preview.
 *
 * NOTE: Human / Dwarf / Elf / Gnome are taken from the design doc. Drakari, Umbrin,
 * Marai, Ashborn and Etherials are flagged `provisional` — representative content
 * matching the doc's race roster, to be reconciled against the canonical v1.2 ruleset.
 */
export const ancestries: Ancestry[] = [
  {
    id: 'human',
    name: 'Human',
    lifespan: '70–100 years',
    bonusSummary: '+1 to any two stats',
    bonuses: [{ kind: 'choice', amount: 1, count: 2, distinct: true }],
    advantages: [
      'Versatile: +1 to any two stats of your choice.',
      'Quick Learner: −1 week on downtime skill training (3 weeks instead of 4).',
    ],
    weaknesses: ['Disadvantage on saves versus disease.'],
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    lifespan: '300–500 years',
    bonusSummary: '+2 Strength, +1 to any stat',
    bonuses: [
      { kind: 'fixed', stat: 'STR', amount: 2 },
      { kind: 'choice', amount: 1, count: 1 },
    ],
    advantages: [
      'Stonecraft: +2 to checks involving stone or minerals.',
      'Darkvision: see in complete darkness up to 60 feet.',
      'Poison Resistance: advantage on saves versus poison.',
    ],
    weaknesses: ['Cannot benefit from magical healing (potions and rest only).'],
  },
  {
    id: 'elf',
    name: 'Elf',
    lifespan: '500–1,000 years',
    bonusSummary: '+1 Nimbleness, +1 Wisdom or Arcana',
    bonuses: [
      { kind: 'fixed', stat: 'NIM', amount: 1 },
      { kind: 'choice', amount: 1, count: 1, from: ['WIS', 'ARC'] },
    ],
    advantages: [
      'Nature Smiths: +2 to crafting with wood, bone, or plants.',
      'Bonus Spells: learn 3 additional (non-damaging) spells beyond Arcana mod × 2.',
    ],
    weaknesses: ['Poison Vulnerability: disadvantage on saves versus poison.'],
  },
  {
    id: 'gnome',
    name: 'Gnome',
    lifespan: '400–600 years',
    bonusSummary: '+1 Intelligence, +1 Luck',
    bonuses: [
      { kind: 'fixed', stat: 'INT', amount: 1 },
      { kind: 'fixed', stat: 'LCK', amount: 1 },
    ],
    advantages: [
      'Small Size: can move through the space of any Medium or larger creature.',
      'Tinkerer: +2 to checks involving mechanisms or devices.',
      'Immune to the Disoriented condition.',
      'Lucky: reroll any natural 1 on a damage die (take the new result).',
    ],
    weaknesses: ['Small frame: carrying capacity limited to ~25% of body weight.'],
  },
  {
    id: 'drakari',
    name: 'Drakari',
    lifespan: '150–250 years',
    bonusSummary: '+1 Strength, +1 Arcana',
    bonuses: [
      { kind: 'fixed', stat: 'STR', amount: 1 },
      { kind: 'fixed', stat: 'ARC', amount: 1 },
    ],
    advantages: [
      'Draconic Scales: +1 natural DR.',
      'Elemental Breath: a short-range breath attack tied to your lineage.',
    ],
    weaknesses: ['Prideful: disadvantage on saves to resist a direct challenge.'],
    provisional: true,
  },
  {
    id: 'umbrin',
    name: 'Umbrin',
    lifespan: '90–140 years',
    bonusSummary: '+1 Nimbleness, +1 Intelligence',
    bonuses: [
      { kind: 'fixed', stat: 'NIM', amount: 1 },
      { kind: 'fixed', stat: 'INT', amount: 1 },
    ],
    advantages: [
      'Shadowmeld: advantage on Stealth in dim light or darkness.',
      'Darkvision up to 60 feet.',
    ],
    weaknesses: ['Light Sensitivity: disadvantage on Perception in bright light.'],
    provisional: true,
  },
  {
    id: 'marai',
    name: 'Marai',
    lifespan: '80–120 years',
    bonusSummary: '+1 Endurance, +1 Wisdom',
    bonuses: [
      { kind: 'fixed', stat: 'END', amount: 1 },
      { kind: 'fixed', stat: 'WIS', amount: 1 },
    ],
    advantages: [
      'Amphibious: breathe water and air; swim at full speed.',
      'Tidesense: advantage on navigation near water.',
    ],
    weaknesses: ['Dry Skin: disadvantage on Endurance saves in arid heat.'],
    provisional: true,
  },
  {
    id: 'ashborn',
    name: 'Ashborn',
    lifespan: '60–90 years',
    bonusSummary: '+1 Endurance, +1 Arcana',
    bonuses: [
      { kind: 'fixed', stat: 'END', amount: 1 },
      { kind: 'fixed', stat: 'ARC', amount: 1 },
    ],
    advantages: [
      'Cinderborn: resistance to fire damage.',
      'Emberlight: shed dim light at will.',
    ],
    weaknesses: ['Vulnerability to cold damage.'],
    provisional: true,
  },
  {
    id: 'etherials',
    name: 'Etherials',
    lifespan: 'Unknown (ageless)',
    bonusSummary: '+1 Wisdom, +1 Arcana',
    bonuses: [
      { kind: 'fixed', stat: 'WIS', amount: 1 },
      { kind: 'fixed', stat: 'ARC', amount: 1 },
    ],
    advantages: [
      'Spirit Step: once per rest, phase through a thin solid barrier.',
      'Resistance to non-magical physical damage.',
    ],
    weaknesses: ['Tenuous Form: disadvantage on saves versus forced movement.'],
    provisional: true,
  },
];
