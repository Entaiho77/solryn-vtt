import { ref, push, set } from 'firebase/database'
import { db } from '../firebase.js'
import { getModifier, WEAPON_SKILL_TO_ITEM_IDS } from '../utils/solrynCharacterRules.js'

// The chosen weapon (characterData.gear.weapon) only carries id/name/damage/
// damageType — it doesn't know which of the player's 3 weapon skills it
// belongs to. Reverse-match it against WEAPON_SKILL_TO_ITEM_IDS to label it;
// fall back to the first weapon skill name if no mapping matches (mirrors
// the same fallback StartingGearStep uses when listing weapon options).
function findWeaponSkillName(weapon, skillIds, skillNames) {
  if (!weapon) return null
  const index = (skillIds?.weapon ?? []).findIndex((skillId) =>
    WEAPON_SKILL_TO_ITEM_IDS[skillId]?.includes(weapon.id),
  )
  if (index !== -1) return skillNames?.weapon?.[index]
  return skillNames?.weapon?.[0] ?? null
}

function mapCharacterToSheet(characterData) {
  const arcanaPointsMax = getModifier(characterData.abilityScores.arcana) * 2 + 2
  const luckPointsMax = Math.max(getModifier(characterData.abilityScores.luck), 1)
  const weapon = characterData.gear?.weapon

  return {
    strength: characterData.abilityScores.strength,
    nimbleness: characterData.abilityScores.nimbleness,
    endurance: characterData.abilityScores.endurance,
    wisdom: characterData.abilityScores.wisdom,
    intelligence: characterData.abilityScores.intelligence,
    arcana: characterData.abilityScores.arcana,
    luck: characterData.abilityScores.luck,
    dr: characterData.finalDR,
    hp: characterData.hp,
    'max-hp': characterData.hp,
    speed: characterData.finalSpeed,
    'arcana-points': arcanaPointsMax,
    'arcana-points-max': arcanaPointsMax,
    'luck-points': luckPointsMax,
    'luck-points-max': luckPointsMax,
    notes: '',
    'equipped-weapons': [
      weapon
        ? {
            id: weapon.id,
            name: weapon.name,
            damage: weapon.damage,
            type: weapon.damageType,
            skill: findWeaponSkillName(weapon, characterData.skillIds, characterData.skills),
          }
        : null,
      null,
      null,
    ],
  }
}

export async function createSolrynCharacter(roomId, uid, characterData) {
  const charactersRef = ref(db, `rooms/${roomId}/characters`)
  const newCharRef = push(charactersRef)
  const characterId = newCharRef.key

  const characterDoc = {
    id: characterId,
    playerId: uid,
    system: 'solryn',
    abilityScores: characterData.abilityScores,
    race: characterData.race,
    hp: characterData.hp,
    maxHp: characterData.hp,
    dr: characterData.finalDR,
    speed: characterData.finalSpeed,
    skills: characterData.skills,
    spells: characterData.spells,
    bonusSpells: characterData.bonusSpells ?? [],
    gear: characterData.gear,
    created: Date.now(),
  }

  const tokensRef = ref(db, `rooms/${roomId}/tokens`)
  const newTokenRef = push(tokensRef)
  const tokenId = newTokenRef.key

  const tokenDoc = {
    ownerUid: uid,
    characterId,
    label: `${characterData.race} Character`,
    targetX: 0,
    targetY: 0,
    sheet: mapCharacterToSheet(characterData),
  }

  await set(newCharRef, characterDoc)
  await set(newTokenRef, tokenDoc)

  return { characterId, tokenId }
}
