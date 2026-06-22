// Pure calculation helpers for the Solryn character builder (Solryn v1.2).
export const ABILITY_ORDER = [
  'strength',
  'nimbleness',
  'endurance',
  'wisdom',
  'intelligence',
  'arcana',
  'luck',
]

export const ABILITY_LABELS = {
  strength: 'Strength',
  nimbleness: 'Nimbleness',
  endurance: 'Endurance',
  wisdom: 'Wisdom',
  intelligence: 'Intelligence',
  arcana: 'Arcana',
  luck: 'Luck',
}

export function getModifier(score) {
  return Math.floor((score - 1) / 3)
}

export function rollAbilityScore() {
  const d4 = () => Math.floor(Math.random() * 4) + 1
  return d4() + d4()
}

export function calculateHp(abilityScores) {
  return abilityScores.endurance + getModifier(abilityScores.endurance)
}

export function calculateDrBase(abilityScores) {
  return getModifier(abilityScores.nimbleness) + getModifier(abilityScores.endurance)
}

export function calculateBaseSpeed(abilityScores) {
  const strMod = getModifier(abilityScores.strength)
  const endMod = getModifier(abilityScores.endurance)
  return 10 + (strMod + endMod) * 5
}

export function calculateSpellsKnown(abilityScores) {
  return getModifier(abilityScores.arcana) * 2 + 1
}

// equipment.json's weapon groups (swords/axes/maces/polearms/ranged) don't
// line up 1:1 with the 22 weapon skills, so this maps each skill to the
// closest starting-gear-appropriate item ids. Skills with no entry (e.g.
// Daggers, Staves, Wands — not yet stocked in equipment.json) fall back to
// showing the full weapon list in StartingGearStep.
export const WEAPON_SKILL_TO_ITEM_IDS = {
  'light-swords': ['shortsword', 'rapier', 'scimitar', 'sabre'],
  'heavy-swords': ['broadsword', 'greatsword'],
  'curved-swords': ['scimitar', 'sabre'],
  'hand-axes': ['handaxe', 'hatchet'],
  battleaxes: ['battleaxe', 'war-axe'],
  'great-axes': ['greataxe'],
  'light-maces': ['club', 'mace'],
  'heavy-maces': ['warhammer', 'morningstar'],
  'two-handed-maces': ['maul', 'sledgehammer'],
  polearms: ['spear', 'javelin', 'halberd', 'glaive', 'pike', 'lance'],
  spears: ['spear', 'javelin', 'lance'],
  'thrown-weapons': ['javelin', 'handaxe', 'hatchet'],
  'light-bows': ['shortbow'],
  'heavy-bows': ['longbow'],
}

export function getWeaponsForSkills(weapons, weaponSkillIds) {
  const ids = new Set(
    weaponSkillIds.flatMap((skillId) => WEAPON_SKILL_TO_ITEM_IDS[skillId] ?? []),
  )
  const matched = weapons.filter((w) => ids.has(w.id))
  return matched.length ? matched : weapons
}
