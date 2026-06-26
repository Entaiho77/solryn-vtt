/**
 * SYSTEM-DEFINITION SCHEMA — the heart of the product.
 *
 * A "system" is data the app reads. Solryn is the first filled-in copy. Every screen
 * (sheet, builder, board, rules reference) reads "the current system's data" instead of
 * hardcoding any one game's rules. Getting this shape right matters more than any
 * screen's polish: the schema is the product, Solryn is the test that proves it.
 *
 * Design rule while extending this: prefer expressing a thing as PARAMETERS (data) read
 * by a generic engine path. Only reach for a new mechanical MODE (see modes.ts) when a
 * thing genuinely needs new engine logic. Never encode "Solryn is the only possibility".
 */

import type { Expr } from './expr';
import type { SystemModes } from './modes';

/** Semantic colors from the visual language (§6); used to tag data for the UI. */
export type SemanticColor = 'teal' | 'amber' | 'purple' | 'red' | 'neutral';

// --- Core stats -------------------------------------------------------------

export interface CoreStat {
  /** Stable id used in formulas and character data (e.g. "STR"). */
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  /** Dice expression rolled for this stat at creation (e.g. "2d4"). */
  roll: string;
}

/**
 * How a raw score maps to a modifier. A MODE-like choice expressed as parameters so the
 * engine stays generic. Solryn: "every 3 points = +1, no cap" → linear-step(3, +1).
 */
export interface ModifierRule {
  type: 'linear-step';
  /** Points per +1 step (Solryn: 3). */
  pointsPerStep: number;
  /** Bonus granted per step (Solryn: 1). */
  bonusPerStep: number;
  /** Optional cap on the modifier; null = no cap (Solryn). */
  cap: number | null;
}

// --- Derived stats ----------------------------------------------------------

/**
 * A value computed from core stats (+ sometimes equipment) via a formula tree.
 * "Show, don't ask": the builder displays the number + its equation breakdown.
 */
export interface DerivedStat {
  id: string;
  name: string;
  abbreviation?: string;
  /** Teaching "why": shown inline in the builder / rules reference. */
  description: string;
  compute:
    | { type: 'value'; expr: Expr }
    /** A per-use roll (e.g. Initiative = d20 + Nim mod); we store/display the modifier. */
    | { type: 'roll'; die: string; modifier: Expr };
  /** Pulls from gear, so it shows partial in the builder until step 13 (DR, Speed). */
  dependsOnEquipment?: boolean;
  /** Refreshed during the level-up ceremony (most derived values). */
  recalcOnLevelUp?: boolean;
  /** Doubles as a current/max resource tracker on the sheet (HP, Arcana, Luck). */
  resourcePool?: boolean;
  color?: SemanticColor;
  /** Optional unit shown after the number (e.g. "ft", "lbs"). */
  unit?: string;
}

// --- Ancestry (Solryn calls these "races") ----------------------------------

/** A stat bonus that may be fixed or a player choice (flexible-bonus ancestries). */
export type StatBonus =
  | { kind: 'fixed'; stat: string; amount: number }
  | {
      kind: 'choice';
      /** Amount applied to each chosen stat. */
      amount: number;
      /** How many stats the player picks. */
      count: number;
      /** Restrict choices to these stat ids; omit = any stat. */
      from?: string[];
      /** Chosen stats must be distinct (default true). */
      distinct?: boolean;
    };

export interface Ancestry {
  id: string;
  name: string;
  lifespan?: string;
  /** Plain-language summary of the bonus line (for the card). */
  bonusSummary: string;
  /** Machine-readable bonuses applied to the live stat preview. */
  bonuses: StatBonus[];
  /** Recorded at creation, mechanized in play (not at creation). */
  advantages: string[];
  weaknesses: string[];
  /** Narrative flavor for the race-detail panel. Optional and rendered only when present —
   * the canonical v1.2 ruleset doesn't enumerate it yet; fill it in later and the side
   * panel lights up automatically (no code change needed). */
  flavor?: string;
  /** Author flag: representative content pending the canonical ruleset. */
  provisional?: boolean;
}

// --- Skills -----------------------------------------------------------------

export interface SkillCategory {
  id: string;
  name: string;
  /** How many to choose at character creation (Solryn: base 3, weapon 3, crafting 1). */
  chooseAtCreation: number;
}

export interface Skill {
  id: string;
  name: string;
  categoryId: string;
  /** Hover tooltip text (build-time teaching). Optional — canonical blurbs pending. */
  description?: string;
  /** Concrete in-play example (hover). Optional — canonical blurbs pending. */
  exampleUse?: string;
  /** Optional governing core-stat id. */
  attribute?: string;
  /** Not chosen at creation (e.g. Action Economy skills, level 2+). */
  creationExcluded?: boolean;
  /**
   * Tasks this skill gates (harvest/crafting). Solryn rule: no skill = no roll.
   * e.g. "skinning", "foraging". Used by the universal harvest mechanic.
   */
  gates?: string[];
}

// --- Spells -----------------------------------------------------------------

export type SpellType = 'offensive' | 'utility';

export interface Spell {
  id: string;
  name: string;
  type: SpellType;
  /** Short blurb shown in context. Optional — canonical spell text pending. */
  synopsis?: string;
  /** Damage dice, or null for non-damage/utility spells. */
  damageDice: string | null;
  /** Damage type for offensive spells (fire, cold, necrotic, …). */
  damageType?: string;
  /** Resource cost in the casting pool (Solryn: Arcana points; base 0). */
  cost: number;
  range: string;
  duration: string;
  provisional?: boolean;
}

// --- Equipment --------------------------------------------------------------

export type ArmorWeight = 'light' | 'medium' | 'heavy';

export interface ArmorItem {
  id: string;
  name: string;
  weight: ArmorWeight;
  /** Damage reduction contributed (feeds the DR formula's equipment term). */
  dr: number;
  /** Speed reduction in feet (feeds the Speed formula; medium −5, heavy −10). */
  speedPenalty: number;
  /** Price in gp. */
  cost?: number;
  provisional?: boolean;
}

export interface ShieldItem {
  id: string;
  name: string;
  /** Bonus DR when equipped. (Shield equip slot is a follow-up; data captured now.) */
  dr: number;
  cost?: number;
  note?: string;
}

export interface WeaponItem {
  id: string;
  name: string;
  /** Weapon-skill category id this weapon belongs to (filters the gear step). */
  weaponSkillId: string;
  damageDice: string;
  /** Physical damage type: P (piercing) / S (slashing) / B (bludgeoning). */
  damageType?: string;
  range?: string;
  twoHanded?: boolean;
  cost?: number;
  provisional?: boolean;
}

export interface StartingKitItem {
  name: string;
  quantity?: number;
}

export interface EquipmentDefinition {
  armor: ArmorItem[];
  weapons: WeaponItem[];
  shields?: ShieldItem[];
  /** Auto-granted at creation (backpack, rope, rations, 3 healing potions…). */
  startingKit: StartingKitItem[];
}

// --- Maps -------------------------------------------------------------------

export interface MapType {
  id: string;
  name: string;
  /** Real-world distance one grid square represents. */
  perSquare: { value: number; unit: string };
  /** GM defines the scale at upload (the "Custom" type). */
  custom?: boolean;
  /**
   * Party-scale (travel) map: the party moves as a group on one shared "party token" that
   * any player can drag, and individual character tokens are hidden. Tactical maps (battle)
   * leave this unset and place per-character tokens as usual.
   */
  partyScale?: boolean;
  note?: string;
}

// --- Harvest / crafting quality ---------------------------------------------

export interface QualityTier {
  id: string;
  label: string;
  /** Inclusive d100 band (after skill bonus). */
  min: number;
  max: number;
  color?: SemanticColor;
  /** Genuine failure floor (Ruined), distinct from the crafting rarity scale. */
  isFailure?: boolean;
}

export interface QualityScale {
  /** Ordered worst → best. */
  tiers: QualityTier[];
  roll: {
    die: string; // "d100"
    addGoverningSkillBonus: boolean; // Solryn: always (skill gates the attempt)
    capAtTop: boolean; // over max caps at the top tier (Legendary)
  };
  /** Assist: a second helper with the skill → roll N dice, take highest. */
  assist: { enabled: boolean; diceWhenAssisted: number };
}

// --- Bestiary (creatures + traps share the "thing with a stat block" idea) --

/** Field descriptor so the add-creature panel adapts its inputs by category. */
export interface StatBlockField {
  id: string;
  label: string;
  type: 'number' | 'text' | 'dice';
  /** Difficulty class field (traps): detection / disarm. */
  hint?: string;
}

export interface StatBlockShape {
  /** Category id (e.g. "creature", "trap"). */
  id: string;
  label: string;
  fields: StatBlockField[];
}

export interface BestiaryEntry {
  id: string;
  name: string;
  /** Which stat-block shape this entry uses. */
  category: string;
  /** Free-form values keyed by field id (kept generic per the schema philosophy). */
  stats: Record<string, number | string>;
  abilities?: string[];
  /** Harvest/loot pool id (ties into the universal harvest mechanic). */
  lootPoolId?: string;
  provisional?: boolean;
}

// --- Rules reference & conditions -------------------------------------------

export interface RulesCard {
  id: string;
  category: string;
  name: string;
  description: string;
  details?: string;
}

export interface ConditionEntry {
  id: string;
  name: string;
  description: string;
  effects: string[];
  save?: string;
}

// --- Character-creation config ---------------------------------------------

/**
 * Casting access (Solryn v1.2 §5.5): a character is a caster if their casting-stat
 * modifier ≥ `casterThreshold` OR their ancestry grants it (Elf). Known spells =
 * (mod × knownPerMod) + (addLevel ? level : 0) + (granted ? ancestryBonus : 0).
 * A non-granted character below the threshold is NOT a caster (known = 0).
 */
export interface SpellAccessRule {
  modStatId: string;
  casterThreshold: number;
  knownPerMod: number;
  addLevel: boolean;
  grantedByAncestry: string[];
  ancestryBonus: number;
}

export interface CreationConfig {
  /** Stats rolled individually, in this order, locked on roll (anti-fishing). */
  statOrder: string[];
  allowReroll: false;
  allowRearrange: false;
  /** Starting reputation label (Solryn: "Neutral", no alignment system). */
  startingReputation: string;
  spellAccess: SpellAccessRule;
  /** Armor weights a character may CHOOSE at creation; heavier armor stays play/loot only.
   * Unset = every weight is allowed at creation. */
  startingArmorWeights?: ArmorWeight[];
}

// --- The system definition --------------------------------------------------

export interface SystemDefinition {
  /** Stable id stored on games (locked at creation). */
  id: string;
  name: string;
  /** Lobby/header badge. */
  glyph: string;
  color: string;
  version: string;
  tagline?: string;

  modes: SystemModes;

  coreStats: CoreStat[];
  modifierRule: ModifierRule;
  derivedStats: DerivedStat[];

  ancestries: Ancestry[];
  skillCategories: SkillCategory[];
  skills: Skill[];
  spells: Spell[];

  equipment: EquipmentDefinition;
  mapTypes: MapType[];
  qualityScale: QualityScale;

  statBlockShapes: StatBlockShape[];
  bestiary: BestiaryEntry[];

  rulesReference: RulesCard[];
  conditions: ConditionEntry[];

  creation: CreationConfig;
}
