import { useEffect, useRef, useState } from 'react'
import {
  ref,
  onValue,
  onDisconnect,
  set,
  update,
  push,
  remove,
  runTransaction,
  serverTimestamp,
} from 'firebase/database'
import { db, ensureSignedIn } from '../firebase.js'

// Schema (Realtime Database):
//   rooms/{roomId}/map                    -> data URL string | null
//   rooms/{roomId}/gmUid                  -> uid of the room's GM (claimed once)
//   rooms/{roomId}/tokens/{tokenId}        -> { color, ownerUid, targetX, targetY, sheet? }
//   rooms/{roomId}/presence/{uid}          -> { joinedAt }
//   rooms/{roomId}/diceLog/{rollId}        -> { uid, expression, rolls, modifier, total, rolledAt }
//   rooms/{roomId}/turn                    -> { order: [tokenId, ...], currentIndex }
//   rooms/{roomId}/sheetSchema             -> [{ id, label, type }, ...] (GM-defined fields)
//   rooms/{roomId}/bestiary                -> [{ id, name, notes }, ...] (GM-only creature notes)
//   rooms/{roomId}/fog                     -> { enabled: bool, revealed: { "col,row": true, ... } }
//   rooms/{roomId}/mapType                 -> "world" | "area" | "city" | "battle"
//   rooms/{roomId}/terrainDifficulty       -> "normal" | "difficult" | "favored"
//
// Token positions are owned fields, not concurrent text — last write per
// field wins, which is exactly what RTDB path writes give us for free.
// renderX/renderY (the animated, in-between-cells position) are NOT
// synced — they're local-only interpolation state. Only the *target*
// cell is written, and only when a drag ends, not on every drag frame.
// Tradeoff: other players see a token jump to its new cell on drop
// rather than glide live during the drag. Quick + cheap now; if it ever
// feels wrong, the clean fix is throttled position writes during drag.
//
// Roles: the first person to load a fresh room link claims `gmUid` via a
// transaction (only succeeds if it's still empty) and becomes GM. This is
// enforced in `database.rules.json`, not just the UI — only the GM can
// write `map`, `turn`, `sheetSchema`, and `fog`, and a token (including
// its `sheet` sub-object) can only be written by its `ownerUid` or the GM.

export function useRoomSync(roomId) {
  const [remoteTokens, setRemoteTokens] = useState({})
  const [mapDataUrl, setMapDataUrl] = useState(null)
  const [presenceCount, setPresenceCount] = useState(0)
  const [connected, setConnected] = useState(false)
  const [uid, setUid] = useState(null)
  const [gmUid, setGmUid] = useState(null)
  const [diceLog, setDiceLog] = useState({})
  const [turn, setTurn] = useState(null)
  const [sheetSchema, setSheetSchema] = useState([])
  const [bestiary, setBestiaryState] = useState([])
  const [fog, setFog] = useState(null)
  const [mapType, setMapTypeState] = useState('battle')
  const [terrainDifficulty, setTerrainDifficultyState] = useState('normal')

  useEffect(() => {
    let unsubTokens = () => {}
    let unsubMap = () => {}
    let unsubPresence = () => {}
    let unsubConnected = () => {}
    let unsubGm = () => {}
    let unsubDiceLog = () => {}
    let unsubTurn = () => {}
    let unsubSheetSchema = () => {}
    let unsubBestiary = () => {}
    let unsubFog = () => {}
    let unsubMapType = () => {}
    let unsubTerrain = () => {}

    ensureSignedIn().then((user) => {
      setUid(user.uid)

      const tokensRef = ref(db, `rooms/${roomId}/tokens`)
      unsubTokens = onValue(tokensRef, (snapshot) => {
        setRemoteTokens(snapshot.val() || {})
      })

      const mapRef = ref(db, `rooms/${roomId}/map`)
      unsubMap = onValue(mapRef, (snapshot) => {
        setMapDataUrl(snapshot.val() || null)
      })

      const gmRef = ref(db, `rooms/${roomId}/gmUid`)
      unsubGm = onValue(gmRef, (snapshot) => {
        const val = snapshot.val()
        setGmUid(val || null)
        if (!val) {
          // Nobody is GM yet (fresh room) — claim it. The transaction only
          // commits if the value is still empty, so a race between two
          // tabs opening the same fresh link resolves to a single winner.
          runTransaction(gmRef, (current) => (current === null ? user.uid : current))
        }
      })

      const diceLogRef = ref(db, `rooms/${roomId}/diceLog`)
      unsubDiceLog = onValue(diceLogRef, (snapshot) => {
        setDiceLog(snapshot.val() || {})
      })

      const turnRef = ref(db, `rooms/${roomId}/turn`)
      unsubTurn = onValue(turnRef, (snapshot) => {
        setTurn(snapshot.val() || null)
      })

      const sheetSchemaRef = ref(db, `rooms/${roomId}/sheetSchema`)
      unsubSheetSchema = onValue(sheetSchemaRef, (snapshot) => {
        setSheetSchema(snapshot.val() || [])
      })

      const bestiaryRef = ref(db, `rooms/${roomId}/bestiary`)
      unsubBestiary = onValue(bestiaryRef, (snapshot) => {
        setBestiaryState(snapshot.val() || [])
      })

      const fogRef = ref(db, `rooms/${roomId}/fog`)
      unsubFog = onValue(fogRef, (snapshot) => {
        setFog(snapshot.val() || null)
      })

      const mapTypeRef = ref(db, `rooms/${roomId}/mapType`)
      unsubMapType = onValue(mapTypeRef, (snapshot) => {
        setMapTypeState(snapshot.val() || 'battle')
      })

      const terrainRef = ref(db, `rooms/${roomId}/terrainDifficulty`)
      unsubTerrain = onValue(terrainRef, (snapshot) => {
        setTerrainDifficultyState(snapshot.val() || 'normal')
      })

      const presenceRef = ref(db, `rooms/${roomId}/presence`)
      unsubPresence = onValue(presenceRef, (snapshot) => {
        const val = snapshot.val() || {}
        setPresenceCount(Object.keys(val).length)
      })

      // .info/connected fires on connect AND reconnect after a drop, so
      // this also re-registers onDisconnect after the connection recovers.
      const connectedInfoRef = ref(db, '.info/connected')
      unsubConnected = onValue(connectedInfoRef, (snapshot) => {
        const isConnected = snapshot.val() === true
        setConnected(isConnected)
        if (!isConnected) return

        const myPresenceRef = ref(db, `rooms/${roomId}/presence/${user.uid}`)
        onDisconnect(myPresenceRef)
          .remove()
          .then(() => {
            set(myPresenceRef, { joinedAt: serverTimestamp() })
          })
      })
    })

    return () => {
      unsubTokens()
      unsubMap()
      unsubPresence()
      unsubConnected()
      unsubGm()
      unsubDiceLog()
      unsubTurn()
      unsubSheetSchema()
      unsubBestiary()
      unsubFog()
      unsubMapType()
      unsubTerrain()
    }
  }, [roomId])

  function addToken(color, x, y) {
    const tokensRef = ref(db, `rooms/${roomId}/tokens`)
    const newRef = push(tokensRef)
    set(newRef, { color, ownerUid: uid, targetX: x, targetY: y })
  }

  function moveToken(tokenId, x, y) {
    update(ref(db, `rooms/${roomId}/tokens/${tokenId}`), {
      targetX: x,
      targetY: y,
    })
  }

  function removeToken(tokenId) {
    remove(ref(db, `rooms/${roomId}/tokens/${tokenId}`))
  }

  function setMap(dataUrl) {
    set(ref(db, `rooms/${roomId}/map`), dataUrl)
  }

  function setMapType(type) {
    set(ref(db, `rooms/${roomId}/mapType`), type)
  }

  function setTerrainDifficulty(difficulty) {
    set(ref(db, `rooms/${roomId}/terrainDifficulty`), difficulty)
  }

  function rollDice(roll) {
    const logRef = ref(db, `rooms/${roomId}/diceLog`)
    const newRef = push(logRef)
    set(newRef, { uid, ...roll, rolledAt: serverTimestamp() })
  }

  function setTurnOrder(order) {
    set(ref(db, `rooms/${roomId}/turn`), { order, currentIndex: 0 })
  }

  function advanceTurn() {
    const turnRef = ref(db, `rooms/${roomId}/turn`)
    runTransaction(turnRef, (current) => {
      if (!current || !current.order?.length) return current
      return {
        ...current,
        currentIndex: (current.currentIndex + 1) % current.order.length,
      }
    })
  }

  function clearTurnOrder() {
    remove(ref(db, `rooms/${roomId}/turn`))
  }

  function setRoomSheetSchema(fields) {
    set(ref(db, `rooms/${roomId}/sheetSchema`), fields)
  }

  function updateTokenSheet(tokenId, sheet) {
    update(ref(db, `rooms/${roomId}/tokens/${tokenId}`), { sheet })
  }

  function setBestiary(creatures) {
    set(ref(db, `rooms/${roomId}/bestiary`), creatures)
  }

  function setFogEnabled(enabled) {
    update(ref(db, `rooms/${roomId}/fog`), { enabled, revealed: fog?.revealed ?? {} })
  }

  function toggleFogCell(col, row) {
    const cellRef = ref(db, `rooms/${roomId}/fog/revealed/${col},${row}`)
    runTransaction(cellRef, (current) => (current ? null : true))
  }

  function clearFog() {
    remove(ref(db, `rooms/${roomId}/fog/revealed`))
  }

  return {
    remoteTokens,
    mapDataUrl,
    presenceCount,
    connected,
    uid,
    gmUid,
    isGm: !!uid && uid === gmUid,
    diceLog,
    turn,
    sheetSchema,
    bestiary,
    fog,
    mapType,
    terrainDifficulty,
    addToken,
    moveToken,
    removeToken,
    setMap,
    setMapType,
    setTerrainDifficulty,
    rollDice,
    setTurnOrder,
    advanceTurn,
    clearTurnOrder,
    setRoomSheetSchema,
    updateTokenSheet,
    setBestiary,
    setFogEnabled,
    toggleFogCell,
    clearFog,
  }
}
