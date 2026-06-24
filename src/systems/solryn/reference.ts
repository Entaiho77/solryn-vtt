import type { ConditionEntry, RulesCard } from '../../engine/schema';

/**
 * Searchable rules-reference cards (Design Doc §4.8). Because rules are system DATA, this
 * panel is populated automatically — a custom system surfaces its own rules in the same
 * UI for free.
 */
export const rulesReference: RulesCard[] = [
  {
    id: 'modifiers',
    category: 'Core',
    name: 'Stat Modifiers',
    description: 'Every 3 points in a stat grants +1 to its modifier — and the pattern continues with no cap.',
    details: 'Score 3 → +1, 6 → +2, 9 → +3, 12 → +4, and so on. Stats are rolled 2d4 at creation and rise with level-ups.',
  },
  {
    id: 'auto-hit',
    category: 'Combat',
    name: 'Auto-Hit Combat',
    description: 'Attacks automatically hit. Roll damage directly instead of an attack roll.',
    details: 'There is no to-hit roll. Defense is handled entirely through Damage Reduction (DR).',
  },
  {
    id: 'damage-dr',
    category: 'Combat',
    name: 'Damage Reduction (DR)',
    description: 'DR = Armor DR + Nimbleness modifier + Endurance modifier. Subtract DR from incoming damage.',
    details: 'Heavier armor grants more DR but reduces Speed (medium −5 ft, heavy −10 ft).',
  },
  {
    id: 'initiative',
    category: 'Combat',
    name: 'Initiative',
    description: 'Rolled fresh each combat: d20 + Nimbleness modifier, highest first.',
    details: 'Players win ties against monsters. Each player rolls themselves in when the GM opens combat.',
  },
  {
    id: 'critical-hits',
    category: 'Combat',
    name: 'Critical Hits',
    description: 'A natural 20 on a damage die (or specific effects) ignores DR and deals double maximum damage.',
  },
  {
    id: 'cover',
    category: 'Combat',
    name: 'Cover',
    description: 'Cover grants bonus DR: light +2, half +3, three-quarters +4. Full cover cannot be targeted.',
  },
  {
    id: 'arcana',
    category: 'Magic',
    name: 'Arcana Points & Spellcasting',
    description: 'Arcana Points = Arcana modifier × 2. Spend up to your level per turn. Spells auto-hit and start at a 1d4 base die.',
    details: 'A non-caster who rolls Arcana up over levels grows a pool from 0 organically. Elves learn 3 bonus non-damaging spells.',
  },
  {
    id: 'luck',
    category: 'Core',
    name: 'Luck Points',
    description: 'Luck Points equal your Luck modifier. Spend them for rerolls and fortune in tight moments.',
  },
  {
    id: 'skills-training',
    category: 'Progression',
    name: 'Skills & Training',
    description: 'Skills use tiers — Novice (+1), Journeyman (+2), Master (+3). 3 points fill a tier; the next point crosses to the next.',
    details: 'A placed point does not raise the bonus until you train in town with someone more skilled. Points earned in the wild stay "pending" until then.',
  },
  {
    id: 'harvest-quality',
    category: 'Crafting',
    name: 'Harvest & Quality',
    description: 'Roll d100 + the governing skill bonus to determine the QUALITY of what you gather: Ruined, Common, Uncommon, Rare, Very Rare, Legendary.',
    details: 'No skill, no roll. A helper with the same skill lets you roll twice and take the highest. Quality maps directly onto the crafting rarity scale.',
  },
  {
    id: 'level-up',
    category: 'Progression',
    name: 'Leveling Up',
    description: 'The GM grants level-ups (party-wide). You roll each stat’s increase in order, then recalculate derived values and place 2 skill points.',
    details: 'Increase die by level: 1d4 standard, 2d6 at milestones (6/10/14/18), 1d8 epic (20+). HP fully recalculates from the new Endurance.',
  },
];

/** Conditions reference (also surfaced in the rules panel). */
export const conditions: ConditionEntry[] = [
  { id: 'poisoned', name: 'Poisoned', description: 'Ingested or absorbed a toxin.', effects: ['Lasts 1d4 rounds', 'Take damage each round', 'Cured with an antidote'], save: 'Endurance' },
  { id: 'venomous', name: 'Venomous', description: 'Injected with venom (bite, sting).', effects: ['As Poisoned', 'Requires antivenom (not antidote)'], save: 'Endurance' },
  { id: 'entangled', name: 'Entangled', description: 'Caught in ropes, vines, nets, or grappled.', effects: ['Speed becomes 0', 'STR or Athletics check to break free', 'Failure = lose turn'], save: 'Strength / Athletics' },
  { id: 'stunned', name: 'Stunned', description: 'Dazed, shocked, or overwhelmed.', effects: ['Cannot move or act', 'Attacks ignore DR', 'Lasts 1d4 rounds'], save: 'Any attribute' },
  { id: 'blinded', name: 'Blinded', description: 'Cannot see.', effects: ['Melee: base damage only', 'Ranged: impossible', 'Attacks ignore DR', 'Lasts 1d4 rounds'], save: 'Any logical attribute' },
  { id: 'frightened', name: 'Frightened', description: 'Terrified of a specific source.', effects: ['Cannot attack or approach the source', 'Disadvantage on checks', 'Lasts 1d4 rounds'], save: 'Wisdom / Luck' },
  { id: 'paralyzed', name: 'Paralyzed', description: 'Cannot move any part of the body.', effects: ['Cannot move or act', 'Attacks auto-crit (ignore DR, double max damage)', 'Lasts 1d4 rounds'], save: 'Endurance / Wisdom' },
  { id: 'unconscious', name: 'Unconscious', description: 'Magically put to sleep (not 0 HP).', effects: ['Cannot perceive or act', 'Attacks ignore DR', 'Wake if damaged or shaken', 'Lasts 1d4 rounds'], save: 'Intelligence / Endurance' },
  { id: 'exhausted', name: 'Exhausted', description: 'Physically and mentally drained.', effects: ['Disadvantage on all d20 rolls', 'Movement halved', 'Removed only by a long rest'], save: 'None (rest)' },
  { id: 'disoriented', name: 'Disoriented', description: 'Confused about direction or location (Gnomes immune).', effects: ['Lasts 1d4 rounds', 'Roll 1d4 each turn for a random effect'], save: 'Wisdom / Intelligence' },
];
