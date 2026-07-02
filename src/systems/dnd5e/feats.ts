import type { FeatDefinition } from '../../engine/schema';

// The standard 2014 feats. NOTE: the strict SRD 5.1 contains only the *Grappler* feat; the rest
// are 2014 PHB feats included here per the build brief (a licensing consideration — flagged).
//
// Mechanization tiers:
//  - Passive effects (ability bonuses, +HP/level, +AC, +speed, resistances, proficiency grants)
//    fold into pcDerived automatically.
//  - powerAttack feats (GWM/Sharpshooter) add a −5/+10 toggle to weapon attack rows.
//  - resource feats (Lucky) add a point tracker on the sheet.
//  - Everything else is display-only text with an accurate description + note; feats needing a
//    system we don't model yet (grapple, mounts, wild shape) are marked displayOnly.

const half = (ability: string) => ({ abilityBonus: [{ ability, amount: 1 }] });

export const feats: FeatDefinition[] = [
  {
    id: 'alert',
    name: 'Alert',
    description: 'Always on the lookout for danger: +5 to initiative, you can’t be surprised while conscious, and creatures don’t gain advantage on attacks against you from being hidden.',
    displayOnly: true,
    note: '+5 initiative (apply manually when rolling initiative); can’t be surprised.',
  },
  {
    id: 'actor',
    name: 'Actor',
    description: 'Skilled at mimicry and drama. +1 CHA, advantage on Deception/Performance to pass as someone else, and you can mimic speech or sounds you’ve heard.',
    effects: { ...half('CHA') },
  },
  {
    id: 'athlete',
    name: 'Athlete',
    description: 'Intense training. +1 STR or DEX; standing from prone costs only 5 ft; climbing costs no extra movement; you can make a running long/high jump after only 5 ft of run.',
    effects: { abilityChoice: { amount: 1, from: ['STR', 'DEX'] } },
  },
  {
    id: 'charger',
    name: 'Charger',
    description: 'When you Dash, you can make one melee attack or shove as a bonus action; if you moved 10+ ft straight the attack deals +5 damage (or the shove pushes 10 ft).',
    displayOnly: true,
    note: 'Bonus-action charge attack — apply the +5 damage manually.',
  },
  {
    id: 'crossbow-expert',
    name: 'Crossbow Expert',
    description: 'Ignore the loading property of crossbows you’re proficient with; being within 5 ft of an enemy doesn’t impose disadvantage on your ranged attacks; bonus-action hand-crossbow shot.',
    displayOnly: true,
  },
  {
    id: 'defensive-duelist',
    name: 'Defensive Duelist',
    description: 'When wielding a finesse weapon you’re proficient with, use your reaction to add your proficiency bonus to AC against one melee attack that would hit you.',
    prerequisite: 'Dexterity 13 or higher',
    requires: { ability: 'DEX', min: 13 },
    displayOnly: true,
    note: 'Reaction AC bonus — apply manually against one melee attack.',
  },
  {
    id: 'dual-wielder',
    name: 'Dual Wielder',
    description: '+1 AC while wielding a separate melee weapon in each hand; you can two-weapon fight with non-light weapons; you can draw or stow two one-handed weapons at once.',
    effects: { acBonus: 1 },
    note: '+1 AC applies only while dual-wielding — remove it if you’re not.',
  },
  {
    id: 'dungeon-delver',
    name: 'Dungeon Delver',
    description: 'Advantage on Perception/Investigation to detect secret doors; advantage on saves vs traps and resistance to trap damage; search for traps at normal pace.',
    displayOnly: true,
  },
  {
    id: 'durable',
    name: 'Durable',
    description: '+1 CON; when you roll a Hit Die to regain HP, the minimum you regain is twice your CON modifier (minimum 2).',
    effects: { ...half('CON') },
  },
  {
    id: 'elemental-adept',
    name: 'Elemental Adept',
    description: 'Choose a damage type (acid, cold, fire, lightning, or thunder). Your spells ignore resistance to it, and you treat any 1 on a damage die for that type as a 2.',
    prerequisite: 'The ability to cast at least one spell',
    requires: { needsSpellcasting: true },
    displayOnly: true,
  },
  {
    id: 'grappler',
    name: 'Grappler',
    description: 'Advantage on attacks against a creature you’re grappling; you can try to pin a grappled creature (both restrained).',
    prerequisite: 'Strength 13 or higher',
    requires: { ability: 'STR', min: 13 },
    displayOnly: true,
    note: 'Needs the grapple/condition system (not modeled yet).',
  },
  {
    id: 'great-weapon-master',
    name: 'Great Weapon Master',
    description: 'On a crit or a kill with a melee weapon, make a bonus-action melee attack. Before a heavy-weapon attack you may take −5 to hit for +10 damage.',
    effects: { powerAttack: { toHit: -5, damage: 10 } },
    note: 'Bonus-action attack on a crit/kill — apply manually.',
  },
  {
    id: 'healer',
    name: 'Healer',
    description: 'When you use a healer’s kit to stabilize a creature, it regains 1 HP. As an action, spend a healer’s-kit use to restore 1d6 + 4 + the creature’s Hit Dice count in HP (once per creature per rest).',
    effects: { resource: { id: 'healer-kit', name: 'Healer’s kit', max: 10 } },
    note: 'Track kit uses here; roll the healing manually (1d6 + 4 + target HD).',
  },
  {
    id: 'heavily-armored',
    name: 'Heavily Armored',
    description: '+1 STR and proficiency with heavy armor.',
    prerequisite: 'Proficiency with medium armor',
    effects: { abilityBonus: [{ ability: 'STR', amount: 1 }], grantedProficiencies: ['heavy'] },
  },
  {
    id: 'heavy-armor-master',
    name: 'Heavy Armor Master',
    description: '+1 STR; while wearing heavy armor, bludgeoning/piercing/slashing damage from nonmagical weapons is reduced by 3.',
    prerequisite: 'Proficiency with heavy armor',
    effects: { ...half('STR') },
    note: 'Reduce nonmagical b/p/s damage by 3 while in heavy armor (apply manually).',
  },
  {
    id: 'inspiring-leader',
    name: 'Inspiring Leader',
    description: 'Spend 10 minutes inspiring up to 6 creatures (including you) that can see/hear and understand you; each gains temp HP equal to your level + your CHA modifier.',
    prerequisite: 'Charisma 13 or higher',
    requires: { ability: 'CHA', min: 13 },
    displayOnly: true,
    note: 'Grants allies temp HP = level + CHA mod — apply on their sheets.',
  },
  {
    id: 'keen-mind',
    name: 'Keen Mind',
    description: '+1 INT; you always know which way is north and hours until sunrise/sunset, and can recall anything you’ve seen or heard in the past month.',
    effects: { ...half('INT') },
  },
  {
    id: 'lightly-armored',
    name: 'Lightly Armored',
    description: '+1 STR or DEX and proficiency with light armor.',
    effects: { abilityChoice: { amount: 1, from: ['STR', 'DEX'] }, grantedProficiencies: ['light'] },
  },
  {
    id: 'linguist',
    name: 'Linguist',
    description: '+1 INT; you learn three languages and can create written ciphers.',
    effects: { ...half('INT') },
  },
  {
    id: 'lucky',
    name: 'Lucky',
    description: 'You have 3 luck points (regained on a long rest). Spend one to roll an extra d20 for an attack, ability check, or save and choose which to use — or to impose a reroll on an attack against you.',
    effects: { resource: { id: 'luck', name: 'Luck points', max: 3 } },
    note: 'Spend a luck point, then roll an extra d20 and keep the better roll.',
  },
  {
    id: 'mage-slayer',
    name: 'Mage Slayer',
    description: 'Reaction melee attack when a creature within 5 ft casts a spell; advantage on saves vs spells cast within 5 ft; you impose disadvantage on their concentration saves when you damage them.',
    displayOnly: true,
  },
  {
    id: 'magic-initiate',
    name: 'Magic Initiate',
    description: 'Choose a class (bard, cleric, druid, sorcerer, warlock, or wizard): learn two of its cantrips and one 1st-level spell (castable once per long rest without a slot).',
    displayOnly: true,
    note: 'Learn 2 cantrips + 1 first-level spell — add them via the spell system once feat-spell selection ships.',
  },
  {
    id: 'martial-adept',
    name: 'Martial Adept',
    description: 'Learn two maneuvers from Battle Master; gain one superiority die (d6, regained on a short/long rest).',
    displayOnly: true,
    note: 'Needs the maneuver/superiority-die system (not modeled).',
  },
  {
    id: 'medium-armor-master',
    name: 'Medium Armor Master',
    description: 'Medium armor doesn’t impose disadvantage on Stealth; and you can add up to +3 DEX (instead of +2) to AC in medium armor.',
    prerequisite: 'Proficiency with medium armor',
    displayOnly: true,
    note: 'Max DEX bonus in medium armor becomes +3 (apply when relevant).',
  },
  {
    id: 'mobile',
    name: 'Mobile',
    description: '+10 ft speed; Dash ignores difficult terrain; and you don’t provoke opportunity attacks from a creature you made a melee attack against this turn.',
    effects: { speedBonus: 10 },
  },
  {
    id: 'moderately-armored',
    name: 'Moderately Armored',
    description: '+1 STR or DEX and proficiency with medium armor and shields.',
    prerequisite: 'Proficiency with light armor',
    effects: { abilityChoice: { amount: 1, from: ['STR', 'DEX'] }, grantedProficiencies: ['medium', 'shields'] },
  },
  {
    id: 'mounted-combatant',
    name: 'Mounted Combatant',
    description: 'Advantage on melee attacks vs unmounted creatures smaller than your mount; you can redirect attacks aimed at your mount to yourself; your mount takes no damage on a successful DEX save (half if it fails).',
    displayOnly: true,
    note: 'Needs a mount system (not modeled).',
  },
  {
    id: 'observant',
    name: 'Observant',
    description: '+1 INT or WIS; you can read lips; +5 to passive Perception and passive Investigation.',
    effects: { abilityChoice: { amount: 1, from: ['INT', 'WIS'] } },
    note: '+5 passive Perception & Investigation.',
  },
  {
    id: 'polearm-master',
    name: 'Polearm Master',
    description: 'Bonus-action butt-end attack (1d4) with a glaive/halberd/quarterstaff/spear; and creatures provoke an opportunity attack when they enter your reach.',
    displayOnly: true,
  },
  {
    id: 'resilient',
    name: 'Resilient',
    description: '+1 to one ability score of your choice, and you gain proficiency in saving throws using that ability.',
    effects: { abilityChoice: { amount: 1, from: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] } },
    note: 'Also grants save proficiency in the chosen ability (apply manually).',
  },
  {
    id: 'ritual-caster',
    name: 'Ritual Caster',
    description: 'Choose a spellcasting class; you gain a ritual book with two 1st-level ritual spells and can add more you find. You can cast them only as rituals.',
    prerequisite: 'Intelligence or Wisdom 13 or higher',
    displayOnly: true,
  },
  {
    id: 'savage-attacker',
    name: 'Savage Attacker',
    description: 'Once per turn when you roll damage for a melee weapon attack, you can reroll the weapon’s damage dice and use either total.',
    note: 'Reroll melee weapon damage once per turn and keep the better result (apply manually).',
    displayOnly: true,
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    description: 'Opportunity attacks reduce a creature’s speed to 0; creatures provoke even if they Disengage; when a creature within 5 ft attacks a target other than you, you can make a reaction melee attack against it.',
    displayOnly: true,
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Long range doesn’t impose disadvantage; your ranged attacks ignore half and three-quarters cover; before a ranged attack you may take −5 to hit for +10 damage.',
    effects: { powerAttack: { toHit: -5, damage: 10 } },
  },
  {
    id: 'shield-master',
    name: 'Shield Master',
    description: 'Bonus-action shove with your shield after an Attack; add your shield’s AC to DEX saves against effects targeting only you; and you can use a reaction to take no damage on a successful DEX save.',
    displayOnly: true,
  },
  {
    id: 'skilled',
    name: 'Skilled',
    description: 'Gain proficiency in any combination of three skills or tools of your choice.',
    displayOnly: true,
    note: 'Choose 3 skill/tool proficiencies (feat proficiency-choice UI pending).',
  },
  {
    id: 'skulker',
    name: 'Skulker',
    description: 'You can hide when lightly obscured; missing with a ranged attack doesn’t reveal you; and dim light doesn’t impose disadvantage on your Perception checks relying on sight.',
    prerequisite: 'Dexterity 13 or higher',
    requires: { ability: 'DEX', min: 13 },
    displayOnly: true,
  },
  {
    id: 'spell-sniper',
    name: 'Spell Sniper',
    description: 'Double the range of your attack-roll spells; your ranged spell attacks ignore half and three-quarters cover; and you learn one attack-roll cantrip.',
    prerequisite: 'The ability to cast at least one spell',
    requires: { needsSpellcasting: true },
    displayOnly: true,
  },
  {
    id: 'tavern-brawler',
    name: 'Tavern Brawler',
    description: '+1 STR or CON; proficiency with improvised weapons; your unarmed strikes use a d4; and when you hit with an unarmed strike or improvised weapon you can try to grapple as a bonus action.',
    effects: { abilityChoice: { amount: 1, from: ['STR', 'CON'] } },
    note: 'Unarmed strike die becomes 1d4; improvised-weapon proficiency.',
  },
  {
    id: 'tough',
    name: 'Tough',
    description: 'Your hit point maximum increases by 2 for every character level (2 now, +2 per level gained).',
    effects: { hpPerLevel: 2 },
  },
  {
    id: 'war-caster',
    name: 'War Caster',
    description: 'Advantage on CON saves to maintain concentration; you can perform somatic components with weapon/shield in hand; and you can cast a spell as an opportunity-attack reaction.',
    prerequisite: 'The ability to cast at least one spell',
    requires: { needsSpellcasting: true },
    note: 'Advantage on CON saves to keep concentration (roll it manually with advantage).',
    displayOnly: true,
  },
  {
    id: 'weapon-master',
    name: 'Weapon Master',
    description: '+1 STR or DEX and proficiency with four weapons of your choice.',
    effects: { abilityChoice: { amount: 1, from: ['STR', 'DEX'] } },
    note: 'Also grants four weapon proficiencies of your choice (apply manually).',
  },
];

/** A feat by id. */
export function featById(id: string): FeatDefinition | undefined {
  return feats.find((f) => f.id === id);
}

/**
 * Whether a character meets a feat's structured prerequisite. `scores` are the effective ability
 * scores; `isCaster` is whether the class has spellcasting. Feats with no `requires` are always
 * eligible. (Free-text-only prerequisites aren't enforced — the requires field drives the filter.)
 */
export function meetsFeatPrerequisite(
  feat: FeatDefinition,
  scores: Record<string, number>,
  isCaster: boolean,
): boolean {
  const req = feat.requires;
  if (!req) return true;
  if (req.needsSpellcasting && !isCaster) return false;
  if (req.ability && req.min != null && (scores[req.ability] ?? 10) < req.min) return false;
  return true;
}
