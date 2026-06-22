import { ref, push, set } from 'firebase/database'
import { db } from '../firebase.js'

function mapCharacterToSheet(characterData) {
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
