import type { Spell } from '../../engine/schema';

/**
 * Solryn spells — canonical v1.2. All damage spells: base 1d4, auto-hit vs DR, base
 * range Touch or 20 ft, base cost 0 AP (modifications cost AP). Offensive spells feed
 * the attack row; utility spells live only in the spell book.
 *
 * AUTHORING NOTE (flagged for Matthew): the ruleset gives short mechanical tags only.
 * The fuller `synopsis` text is intentionally left blank rather than invented; the UI
 * hides the synopsis line until it's provided. Damage type / range / cost are canonical.
 */
const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const off = (name: string, range: 'touch' | 'ranged', damageType: string): Spell => ({
  id: slug(name),
  name,
  type: 'offensive',
  damageDice: '1d4',
  damageType,
  cost: 0,
  range: range === 'touch' ? 'Touch' : '20 ft',
  duration: 'Instant',
});

const util = (name: string, range: string, duration: string): Spell => ({
  id: slug(name),
  name,
  type: 'utility',
  damageDice: null,
  cost: 0,
  range,
  duration,
});

export const spells: Spell[] = [
  // Elemental
  off('Ember Strike', 'touch', 'fire'),
  off('Ignition Bolt', 'ranged', 'fire'),
  off('Frostbite Surge', 'touch', 'cold'),
  off('Glacial Spear', 'ranged', 'cold'),
  off('Thunder Palm', 'touch', 'lightning'),
  off('Arc Spark', 'ranged', 'lightning'),
  off('Earthen Crush', 'touch', 'bludgeoning'),
  off('Stone Shard', 'ranged', 'piercing'),
  off('Gust Slash', 'touch', 'slashing'),
  off('Cyclone Dart', 'ranged', 'force'),
  // Arcane Energy
  off('Arcane Jolt', 'touch', 'force'),
  off('Void Lance', 'ranged', 'necrotic'),
  off('Astral Spike', 'touch', 'psychic'),
  off('Soul Rend', 'ranged', 'psychic'),
  off('Echo Strike', 'touch', 'thunder'),
  off('Resonance Beam', 'ranged', 'thunder'),
  off('Mystic Shock', 'touch', 'radiant'),
  off('Starfire Ray', 'ranged', 'radiant'),
  off('Eldritch Claw', 'touch', 'necrotic'),
  off('Shadow Dart', 'ranged', 'necrotic'),
  // Poison & Corrupting
  off('Venom Strike', 'touch', 'poison'),
  off('Toxic Dart', 'ranged', 'poison'),
  off('Rotting Grip', 'touch', 'necrotic'),
  off('Decay Arrow', 'ranged', 'necrotic'),
  off('Withering Touch', 'touch', 'necrotic'),
  off('Blight Surge', 'ranged', 'necrotic'),
  off('Acidic Claw', 'touch', 'acid'),
  off('Corrosive Orb', 'ranged', 'acid'),
  off('Ashen Grasp', 'touch', 'necrotic'),
  off('Hallowed Rupture', 'ranged', 'radiant'),
  // Adaptive Combat
  off('Mirror Strike', 'touch', "mimics target's last type"),
  off('Prismatic Sting', 'ranged', 'random elemental'),
  off('Aether Burst', 'touch', 'force (ignores resistance)'),
  off('Lethal Echo', 'ranged', 'psychic'),
  off('Burning Rune', 'touch', 'fire (lingers)'),
  off('Glacial Lash', 'ranged', 'cold (slows)'),
  off('Thundering Claw', 'touch', 'thunder (shockwave)'),
  off('Explosive Arc', 'ranged', 'force (jumps)'),
  off('Void Pulse', 'touch', 'necrotic (disrupts magic)'),
  off('Radiant Wave', 'touch', 'radiant (area)'),
  // Utility (non-damaging)
  util('Light', 'Object · 20 ft', '1 hour'),
  util('Mage Hand', '30 ft', '1 minute'),
  util('Prestidigitation', '10 ft', 'Instant'),
  util('Message', '120 ft', 'Instant'),
  util('Create Water', '30 ft', 'Instant'),
  util('Blade Ward', 'Self', '1 round'),
  util('True Strike', '30 ft', '1 round'),
];
