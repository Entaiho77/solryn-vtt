import type { Skill, SkillCategory } from '../../engine/schema';

/**
 * Three skill categories chosen from at creation: base (3), weapon (3), crafting (1).
 *
 * NOTE on counts: the design doc specifies 32 base / 22 weapon / 45+ crafting skills.
 * The lists below are a structurally-complete REPRESENTATIVE subset (each carries the
 * required description + exampleUse hover fields and, for harvest skills, the `gates`
 * link). They are flagged for expansion to the full canonical lists when the skills
 * step (Phase B) is built against the v1.2 ruleset. The engine/UI do not care about the
 * count — adding entries is pure data.
 */
export const skillCategories: SkillCategory[] = [
  { id: 'base', name: 'Base Skills', chooseAtCreation: 3 },
  { id: 'weapon', name: 'Weapon Skills', chooseAtCreation: 3 },
  { id: 'crafting', name: 'Crafting & Trade', chooseAtCreation: 1 },
];

export const skills: Skill[] = [
  // --- Base skills ---
  { id: 'athletics', name: 'Athletics', categoryId: 'base', attribute: 'STR', description: 'Climbing, jumping, swimming, and raw physical exertion.', exampleUse: 'Scale a sheer cliff or break free of a grapple.' },
  { id: 'acrobatics', name: 'Acrobatics', categoryId: 'base', attribute: 'NIM', description: 'Balance, tumbling, and nimble movement.', exampleUse: 'Keep your feet on an icy ledge or roll past an enemy.' },
  { id: 'stealth', name: 'Stealth', categoryId: 'base', attribute: 'NIM', description: 'Sneaking, hiding, and moving silently.', exampleUse: 'Slip past a sleeping guard unseen.' },
  { id: 'perception', name: 'Perception', categoryId: 'base', attribute: 'WIS', description: 'Noticing details and spotting hidden things.', exampleUse: 'Spot a tripwire before you step on it.' },
  { id: 'insight', name: 'Insight', categoryId: 'base', attribute: 'WIS', description: 'Reading people and detecting lies.', exampleUse: 'Sense that the merchant is hiding something.' },
  { id: 'survival', name: 'Survival', categoryId: 'base', attribute: 'WIS', description: 'Tracking, foraging direction, and navigating the wild.', exampleUse: 'Follow a trail through the forest at dusk.' },
  { id: 'investigation', name: 'Investigation', categoryId: 'base', attribute: 'INT', description: 'Finding clues and deducing information.', exampleUse: 'Work out which floorboard hides the key.' },
  { id: 'arcana', name: 'Arcana', categoryId: 'base', attribute: 'ARC', description: 'Knowledge of magic, spells, and the weave.', exampleUse: 'Identify the school of a glowing sigil.' },
  { id: 'medicine', name: 'Medicine', categoryId: 'base', attribute: 'INT', description: 'Healing wounds and diagnosing ailments.', exampleUse: 'Stabilize a dying ally between fights.' },
  { id: 'persuasion', name: 'Persuasion', categoryId: 'base', attribute: 'INT', description: 'Convincing others through reason and charm.', exampleUse: 'Talk the gatekeeper into letting you through.' },
  { id: 'intimidation', name: 'Intimidation', categoryId: 'base', attribute: 'STR', description: 'Threatening or coercing through force of presence.', exampleUse: 'Make a bandit reconsider his ambush.' },
  { id: 'deception', name: 'Deception', categoryId: 'base', attribute: 'INT', description: 'Lying convincingly and maintaining a disguise.', exampleUse: 'Pass yourself off as a noble’s courier.' },
  { id: 'animal-handling', name: 'Animal Handling', categoryId: 'base', attribute: 'WIS', description: 'Calming, training, and reading animals.', exampleUse: 'Soothe a spooked warhorse mid-battle.' },
  { id: 'nature', name: 'Nature', categoryId: 'base', attribute: 'INT', description: 'Knowledge of flora, fauna, and natural hazards.', exampleUse: 'Recognize which berries are safe to eat.' },
  { id: 'history', name: 'History', categoryId: 'base', attribute: 'INT', description: 'Recall of events, lineages, and lore.', exampleUse: 'Remember who built the ruined keep.' },
  { id: 'sleight-of-hand', name: 'Sleight of Hand', categoryId: 'base', attribute: 'NIM', description: 'Pickpocketing, palming, and delicate manual tricks.', exampleUse: 'Lift a key from a guard’s belt.' },

  // --- Weapon skills (each maps to a weapon-skill id used by weapon items) ---
  { id: 'swords', name: 'Swords', categoryId: 'weapon', description: 'Bladed one-handed and versatile swords.', exampleUse: 'Wield a longsword with practiced form.' },
  { id: 'axes', name: 'Axes', categoryId: 'weapon', description: 'Hand axes and battleaxes.', exampleUse: 'Cleave with a battleaxe.' },
  { id: 'maces', name: 'Maces & Blunt', categoryId: 'weapon', description: 'Maces, hammers, and clubs.', exampleUse: 'Crush armor with a warhammer.' },
  { id: 'daggers', name: 'Daggers', categoryId: 'weapon', description: 'Knives and light thrown blades.', exampleUse: 'Strike fast and twice with paired daggers.' },
  { id: 'spears', name: 'Spears', categoryId: 'weapon', description: 'Spears and short thrusting polearms.', exampleUse: 'Keep an enemy at range with a spear.' },
  { id: 'polearms', name: 'Polearms', categoryId: 'weapon', description: 'Halberds, glaives, and long hafted weapons.', exampleUse: 'Sweep a line of foes with a halberd.' },
  { id: 'bows', name: 'Bows', categoryId: 'weapon', description: 'Shortbows and longbows.', exampleUse: 'Loose an arrow across the field.' },
  { id: 'crossbows', name: 'Crossbows', categoryId: 'weapon', description: 'Hand, light, and heavy crossbows.', exampleUse: 'Punch through a shield with a heavy bolt.' },
  { id: 'thrown', name: 'Thrown Weapons', categoryId: 'weapon', description: 'Javelins, throwing axes, and darts.', exampleUse: 'Hurl a javelin at a charging beast.' },
  { id: 'two-handed', name: 'Two-Handed Weapons', categoryId: 'weapon', description: 'Greatswords, mauls, and great axes.', exampleUse: 'Bring a greatsword down in a heavy arc.' },
  { id: 'unarmed', name: 'Unarmed Combat', categoryId: 'weapon', description: 'Fists, kicks, and grappling.', exampleUse: 'Disarm a foe with a quick grapple.' },
  { id: 'staves', name: 'Staves', categoryId: 'weapon', description: 'Quarterstaves and arcane focuses.', exampleUse: 'Parry and counter with a quarterstaff.' },

  // --- Crafting & trade (some gate harvest/collection activities) ---
  { id: 'blacksmithing', name: 'Blacksmithing', categoryId: 'crafting', description: 'Forging metal weapons and armor.', exampleUse: 'Reforge a chipped blade in town.' },
  { id: 'woodworking', name: 'Woodworking', categoryId: 'crafting', description: 'Crafting bows, hafts, and wooden items.', exampleUse: 'Carve a replacement bow stave.' },
  { id: 'alchemy', name: 'Alchemy', categoryId: 'crafting', description: 'Brewing potions and reagents.', exampleUse: 'Distill a healing potion from gathered herbs.' },
  { id: 'leatherworking', name: 'Leatherworking', categoryId: 'crafting', description: 'Crafting leather armor and goods; skinning carcasses.', exampleUse: 'Skin a slain beast for usable hide.', gates: ['skinning'] },
  { id: 'enchanting', name: 'Enchanting', categoryId: 'crafting', description: 'Imbuing items with magical properties.', exampleUse: 'Etch a minor rune of warmth into a cloak.' },
  { id: 'cooking', name: 'Cooking', categoryId: 'crafting', description: 'Preparing food and beneficial meals.', exampleUse: 'Cook a hearty stew that grants a rest bonus.' },
  { id: 'herbalism', name: 'Herbalism', categoryId: 'crafting', description: 'Identifying and foraging plants and fungi.', exampleUse: 'Forage rare moonbloom from a glade.', gates: ['foraging'] },
  { id: 'mining', name: 'Mining', categoryId: 'crafting', description: 'Extracting ore and minerals from nodes.', exampleUse: 'Work an iron vein for usable ore.', gates: ['ore'] },
  { id: 'tailoring', name: 'Tailoring', categoryId: 'crafting', description: 'Sewing cloth garments and light armor.', exampleUse: 'Stitch a padded gambeson.' },
  { id: 'jewelcrafting', name: 'Jewelcrafting', categoryId: 'crafting', description: 'Cutting gems and setting jewelry.', exampleUse: 'Facet a rough gem into a focus stone.' },
  { id: 'trapmaking', name: 'Trapmaking', categoryId: 'crafting', description: 'Building and disarming mechanical traps.', exampleUse: 'Disarm a pressure-plate trap safely.', gates: ['disarm-trap'] },
  { id: 'brewing', name: 'Brewing', categoryId: 'crafting', description: 'Fermenting drinks and tonics.', exampleUse: 'Brew a tonic that steadies the nerves.' },
  { id: 'calligraphy', name: 'Scribing', categoryId: 'crafting', description: 'Copying texts and inscribing scrolls.', exampleUse: 'Transcribe a spell onto a usable scroll.' },
  { id: 'soulcraft', name: 'Soulcraft', categoryId: 'crafting', description: 'Extracting and refining soul cores from magical creatures.', exampleUse: 'Harvest an infernal core from a fire elemental.', gates: ['soul-core'] },
];
