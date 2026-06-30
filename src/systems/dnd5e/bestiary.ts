import type { BestiaryEntry } from '../../engine/schema';

/**
 * A few hand-authored SRD-ish 5e creatures so the attack-roll-vs-AC resolver can be verified
 * on a real board before the full SRD conversion (Phase 2c). Real 5e stats: AC, HP, and
 * per-attack to-hit (`attackBonus`) + damage dice. Not the Solryn-converted bestiary.
 */
export const bestiary: BestiaryEntry[] = [
  {
    id: 'goblin',
    name: 'Goblin',
    category: 'creature',
    stats: { ac: 15, hp: 7, speed: '30 ft' },
    attacks: [
      { name: 'Scimitar', diceExpr: '1d6+2', damageType: 'Slashing', attackBonus: 4 },
      { name: 'Shortbow', diceExpr: '1d6+2', damageType: 'Piercing', attackBonus: 4, note: 'range 80/320' },
    ],
    abilities: ['Nimble Escape: Disengage or Hide as a bonus action.'],
  },
  {
    id: 'orc',
    name: 'Orc',
    category: 'creature',
    stats: { ac: 13, hp: 15, speed: '30 ft' },
    attacks: [
      { name: 'Greataxe', diceExpr: '1d12+3', damageType: 'Slashing', attackBonus: 5 },
      { name: 'Javelin', diceExpr: '1d6+3', damageType: 'Piercing', attackBonus: 5, note: 'range 30/120' },
    ],
    abilities: ['Aggressive: Bonus-action move toward a hostile creature.'],
  },
  {
    id: 'dire-wolf',
    name: 'Dire Wolf',
    category: 'creature',
    stats: { ac: 14, hp: 37, speed: '50 ft' },
    attacks: [
      { name: 'Bite', diceExpr: '2d6+3', damageType: 'Piercing', attackBonus: 5, note: 'DC 13 STR or prone' },
    ],
    abilities: ['Pack Tactics: Advantage when an ally is adjacent to the target.'],
  },
];
