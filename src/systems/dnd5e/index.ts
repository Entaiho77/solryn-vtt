import type {
  Ancestry,
  BackgroundDefinition,
  ClassDefinition,
  ConditionEntry,
  CoreStat,
  CreationConfig,
  DerivedStat,
  EquipmentDefinition,
  MapType,
  ModifierRule,
  QualityScale,
  RulesCard,
  Spell,
  StatBlockShape,
  SystemDefinition,
  SystemModes,
} from '../../engine/schema';
import { c } from '../../engine/schema';
import { bestiary } from './bestiary';
import { skills, skillCategories } from './skills';
import { fighter } from './classes/fighter';

/**
 * D&D 5e (SRD) — Phase 2a: a MINIMAL but valid system so the registry/selection path works
 * for a real second system. It declares the 5e mechanical modes (attack-roll-vs-ac,
 * class-and-level, spell-slots, proficiency-bonus) — declaring a mode ≠ implementing it; the
 * combat resolver and real content (monsters, spells, classes, conditions) land in later
 * phases. Most content fields are intentionally empty placeholders.
 */

// The six ability scores.
const coreStats: CoreStat[] = [
  { id: 'STR', name: 'Strength', abbreviation: 'STR', description: 'Physical power.', roll: '3d6' },
  { id: 'DEX', name: 'Dexterity', abbreviation: 'DEX', description: 'Agility and reflexes.', roll: '3d6' },
  { id: 'CON', name: 'Constitution', abbreviation: 'CON', description: 'Health and stamina.', roll: '3d6' },
  { id: 'INT', name: 'Intelligence', abbreviation: 'INT', description: 'Reasoning and memory.', roll: '3d6' },
  { id: 'WIS', name: 'Wisdom', abbreviation: 'WIS', description: 'Perception and insight.', roll: '3d6' },
  { id: 'CHA', name: 'Charisma', abbreviation: 'CHA', description: 'Force of personality.', roll: '3d6' },
];

// 5e ability modifier: floor((score − 10) / 2).
const modifierRule: ModifierRule = { type: 'ability-modifier', baseline: 10, pointsPerStep: 2 };

// Proficiency bonus. NOTE: real 5e scales it with level (2 → 6), but the formula AST has no
// `level` term yet, so this is a constant +2 placeholder; level-scaling lands with the 5e
// progression phase (needs an Expr `level` node).
const derivedStats: DerivedStat[] = [
  {
    id: 'proficiencyBonus',
    name: 'Proficiency Bonus',
    abbreviation: 'Prof',
    description: 'Added to proficient rolls. Placeholder +2 — scales with level in a later phase.',
    compute: { type: 'value', expr: c(2) },
    recalcOnLevelUp: true,
  },
];

const modes: SystemModes = {
  combat: { id: 'attack-roll-vs-ac' },
  casting: { id: 'spell-slots' },
  progression: { id: 'class-and-level' },
  skill: {
    id: 'proficiency-bonus',
    // tiers/training fields don't apply to the proficiency model — minimal valid values.
    tiers: [],
    pointsPerTier: 0,
    crossOnNextPoint: false,
    maxPointsPerSkill: 0,
    trainingGated: false,
  },
};

const creation: CreationConfig = {
  statOrder: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'],
  allowReroll: false,
  allowRearrange: false,
  startingReputation: 'Unaligned',
  // 5e default ability-score assignment (the builder that uses this lands in Phase B/C).
  abilityScoreMethod: 'standard-array',
  standardArray: [15, 14, 13, 12, 10, 8],
  pointBuyBudget: 27,
  // No auto-granted spells yet (casting content is a later phase).
  spellAccess: {
    modStatId: 'INT',
    casterThreshold: 99,
    knownPerMod: 0,
    addLevel: false,
    grantedByAncestry: [],
    ancestryBonus: 0,
  },
};

// Class-and-level content. Phase A populates Fighter only as proof the shapes hold; other
// classes and backgrounds are defined-but-minimal (filled in Phase C onward).
const classes: ClassDefinition[] = [fighter];
const backgrounds: BackgroundDefinition[] = [];

// 5e uses a 5 ft tactical grid; region/world are travel-scale. Enough for maps to work.
const mapTypes: MapType[] = [
  { id: 'battle', name: 'Battle map', perSquare: { value: 5, unit: 'ft' } },
  { id: 'region', name: 'Region map', perSquare: { value: 1, unit: 'mi' }, partyScale: true },
  { id: 'custom', name: 'Custom', perSquare: { value: 1, unit: 'unit' }, custom: true, note: 'GM defines one square.' },
];

// 5e has no universal harvest/quality mechanic — minimal valid scaffold (unused).
const qualityScale: QualityScale = {
  tiers: [],
  roll: { die: 'd100', addGoverningSkillBonus: false, capAtTop: false },
  assist: { enabled: false, diceWhenAssisted: 1 },
};

// A creature stat-block shape so the bestiary/add-creature panel has a 5e-shaped category.
const statBlockShapes: StatBlockShape[] = [
  {
    id: 'creature',
    label: 'Creature',
    fields: [
      { id: 'ac', label: 'AC', type: 'number' },
      { id: 'hp', label: 'HP', type: 'number' },
      { id: 'speed', label: 'Speed', type: 'text' },
    ],
  },
];

const rulesReference: RulesCard[] = [
  {
    id: 'placeholder',
    category: 'About',
    name: 'D&D 5e (SRD) — in progress',
    description: 'Combat, spells, conditions, and character options are being added in stages.',
  },
];

// Empty content placeholders — real data arrives in later phases.
const ancestries: Ancestry[] = [];
const spells: Spell[] = [];
const equipment: EquipmentDefinition = { armor: [], weapons: [], startingKit: [] };
const conditions: ConditionEntry[] = [];

export const dnd5eSystem: SystemDefinition = {
  id: 'dnd5e',
  name: 'D&D 5e',
  glyph: '⚔',
  color: '#b5402f',
  version: '0.1.0',
  tagline: 'd20 attacks · classes & levels · spell slots. (In progress)',

  modes,

  coreStats,
  modifierRule,
  derivedStats,

  ancestries,
  skillCategories,
  skills,
  spells,

  equipment,
  mapTypes,
  qualityScale,

  statBlockShapes,
  bestiary,

  rulesReference,
  conditions,

  creation,

  classes,
  backgrounds,
};
