import type { BestiaryEntry, StatBlockShape } from '../../engine/schema';

/**
 * Stat-block shapes drive the add-creature form's fields by category. Solryn creatures
 * carry HP/DR/Speed/Damage + an optional initiative modifier (decision #2: default 0 is
 * book-accurate; the field lets a GM give fast creatures an edge). Traps carry
 * detection/disarm DCs, trigger, and effect.
 */
export const statBlockShapes: StatBlockShape[] = [
  {
    id: 'creature',
    label: 'Creature',
    fields: [
      { id: 'hp', label: 'HP', type: 'number' },
      { id: 'dr', label: 'DR', type: 'number' },
      { id: 'speed', label: 'Speed', type: 'text' },
      { id: 'damage', label: 'Damage', type: 'dice' },
      { id: 'initiativeMod', label: 'Init mod', type: 'number', hint: 'default 0' },
    ],
  },
  {
    id: 'trap',
    label: 'Trap',
    fields: [
      { id: 'detectionDC', label: 'Detection DC', type: 'number', hint: 'DC to spot' },
      { id: 'trigger', label: 'Trigger', type: 'text' },
      { id: 'effect', label: 'Effect / Damage', type: 'text' },
      { id: 'disarmDC', label: 'Disarm DC', type: 'number', hint: 'ties to Trap Making / Sleight of Hand' },
    ],
  },
];

/**
 * The Solryn starter bestiary — 10 canonical v1.2 creatures. (Loot/harvest pool contents
 * per creature are flagged for Matthew — the ruleset names soul cores but not full loot
 * tables.)
 */
export const bestiary: BestiaryEntry[] = [
  {
    id: 'mossback-hare',
    name: 'Mossback Hare',
    category: 'creature',
    stats: { hp: 8, dr: 0, speed: '35', damage: '—', initiativeMod: 0, threatLevel: 'Non-combatant', type: 'Beast', soulCore: 'none', native: 'Highland meadows' },
    abilities: ['Burrow Dodge', 'Lichen Blend', 'Harvestable: Sleeproot moss (healing ingredient)'],
  },
  {
    id: 'duskwatcher-owlcat',
    name: 'Duskwatcher Owlcat',
    category: 'creature',
    stats: { hp: 22, dr: 1, speed: '30 / glide 40', damage: '1d6+3 slashing (pounce +1d4)', initiativeMod: 0, threatLevel: 'Easy', type: 'Predator', soulCore: 'none', native: 'Highland woods' },
    abilities: ['Silent Descent', 'Twilight Tracker', 'Hiss-Screech'],
  },
  {
    id: 'bramble-boar',
    name: 'Bramble Boar',
    category: 'creature',
    stats: { hp: 28, dr: 2, speed: '30', damage: '1d6+4 piercing (charge +1d4)', initiativeMod: 0, threatLevel: 'Easy', type: 'Beast', soulCore: 'none', native: 'Highland thickets' },
    abilities: ['Thornshake (AoE)', 'Brushbreaker', 'Pain-Fueled Rage'],
  },
  {
    id: 'crag-hound',
    name: 'Crag Hound',
    category: 'creature',
    stats: { hp: 24, dr: 2, speed: '35', damage: '1d6+3 piercing', initiativeMod: 0, threatLevel: 'Easy', type: 'Shadow Beast', soulCore: 'Shadowbound (DC14)', native: 'Mountain passes' },
    abilities: ['Mountain Ghost', 'Death-Stalker', 'Shadowmeld'],
  },
  {
    id: 'knockerkin',
    name: 'Knockerkin',
    category: 'creature',
    stats: { hp: 18, dr: 1, speed: '25 / climb 20', damage: '1d4+2 piercing', initiativeMod: 0, threatLevel: 'Easy', type: 'Fey', soulCore: 'none (capturable)', native: 'Abandoned mines, caves' },
    abilities: ['False Echo', 'Tunnel Slinker', 'Greed Sense'],
  },
  {
    id: 'lantern-wraith',
    name: 'Lantern Wraith',
    category: 'creature',
    stats: { hp: 18, dr: 1, speed: '20 float', damage: '1d6 arcane', initiativeMod: 0, threatLevel: 'Easy', type: 'Spirit', soulCore: 'Arcane/Spirit (DC14)', native: 'Misty forests' },
    abilities: ['Lurelight Pulse', 'Misty Allure', 'Ethereal Drift'],
  },
  {
    id: 'hollow-man',
    name: 'Hollow Man',
    category: 'creature',
    stats: { hp: 22, dr: 2, speed: '25', damage: '1d6+1 slashing', initiativeMod: 0, threatLevel: 'Easy', type: 'Construct', soulCore: 'none', native: 'Deep woods, abandoned farmland' },
    abilities: ['Effigy Stillness', 'Silent Lurch', 'Restraining thorns'],
  },
  {
    id: 'whippoorwail',
    name: 'Whippoorwail',
    category: 'creature',
    stats: { hp: 16, dr: 1, speed: '30 fly', damage: '1d4+2 piercing + 1 arcane', initiativeMod: 0, threatLevel: 'Easy', type: 'Spirit Beast', soulCore: 'Fading (DC13, destroyed by Radiant)', native: 'Forest edges, burial grounds' },
    abilities: ['Death-Linked', 'Cry of the Dying', 'Blocks Luck recovery'],
  },
  {
    id: 'hollowkin',
    name: 'Hollowkin',
    category: 'creature',
    stats: { hp: 28, dr: 2, speed: '30 / hover 20', damage: '1d8 psychic + 1d4 arcane', initiativeMod: 0, threatLevel: 'Easy', type: 'Spirit', soulCore: 'Ethereal (DC14)', native: 'Highland ridges, misty ruins' },
    abilities: ['Misty Veil', 'Fade Step', 'Test of the Soul', 'Mirror Echo'],
  },
  {
    id: 'trellin-shaman',
    name: "T'rellin Shaman",
    category: 'creature',
    stats: { hp: 22, dr: 1, speed: '30 / climb 30', damage: '1d6 bludgeoning (staff)', initiativeMod: 0, threatLevel: 'Easy', type: 'Insectoid Caster', soulCore: 'Naturebound (DC14)', native: 'Canopy sanctuaries' },
    abilities: ['Spellcaster: Entangle, Sporeblind, Chitin Shield (1/rest each)', 'Nature magic'],
  },
];
