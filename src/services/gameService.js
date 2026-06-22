import { ref, get, set, update, remove } from 'firebase/database'
import { db } from '../firebase.js'
import { generateRoomCode } from '../utils/roomCodeGenerator.js'
import { getPresetSchema } from '../constants/systemPresets.js'

export function getLastSystem(uid) {
  return get(ref(db, `users/${uid}/lastSystem`)).then((snap) => snap.val())
}

export function setLastSystem(uid, system) {
  return set(ref(db, `users/${uid}/lastSystem`), system)
}

export async function createGame(uid, { gameName, system }) {
  const roomCode = generateRoomCode()
  const now = Date.now()
  const sheetSchema = getPresetSchema(system)

  await set(ref(db, `rooms/${roomCode}/meta`), {
    ownerId: uid,
    gameName,
    system,
    created: now,
  })

  if (sheetSchema.length) {
    await set(ref(db, `rooms/${roomCode}/sheetSchema`), sheetSchema)
  }

  await set(ref(db, `users/${uid}/games/${roomCode}`), {
    gameName,
    system,
    created: now,
    lastPlayed: now,
  })

  return roomCode
}

export async function loadPreviousGames(uid) {
  const snap = await get(ref(db, `users/${uid}/games`))
  const games = snap.val() || {}
  return Object.entries(games)
    .map(([roomCode, data]) => ({ roomCode, ...data }))
    .sort((a, b) => b.lastPlayed - a.lastPlayed)
}

export function touchLastPlayed(uid, roomCode) {
  return update(ref(db, `users/${uid}/games/${roomCode}`), { lastPlayed: Date.now() })
}

export function deleteGame(uid, roomCode) {
  return remove(ref(db, `users/${uid}/games/${roomCode}`))
}
