import { useEffect, useRef, useState } from 'react'
import {
  ref,
  onValue,
  onDisconnect,
  set,
  update,
  push,
  remove,
  serverTimestamp,
} from 'firebase/database'
import { db, ensureSignedIn } from '../firebase.js'

// Schema (Realtime Database):
//   rooms/{roomId}/map                    -> data URL string | null
//   rooms/{roomId}/tokens/{tokenId}        -> { color, targetX, targetY }
//   rooms/{roomId}/presence/{uid}          -> { joinedAt }
//
// Token positions are owned fields, not concurrent text — last write per
// field wins, which is exactly what RTDB path writes give us for free.
// renderX/renderY (the animated, in-between-cells position) are NOT
// synced — they're local-only interpolation state. Only the *target*
// cell is written, and only when a drag ends, not on every drag frame.
// Tradeoff: other players see a token jump to its new cell on drop
// rather than glide live during the drag. Quick + cheap now; if it ever
// feels wrong, the clean fix is throttled position writes during drag.

export function useRoomSync(roomId) {
  const [remoteTokens, setRemoteTokens] = useState({})
  const [mapDataUrl, setMapDataUrl] = useState(null)
  const [presenceCount, setPresenceCount] = useState(0)
  const [connected, setConnected] = useState(false)
  const uidRef = useRef(null)

  useEffect(() => {
    let unsubTokens = () => {}
    let unsubMap = () => {}
    let unsubPresence = () => {}
    let unsubConnected = () => {}

    ensureSignedIn().then((user) => {
      uidRef.current = user.uid

      const tokensRef = ref(db, `rooms/${roomId}/tokens`)
      unsubTokens = onValue(tokensRef, (snapshot) => {
        setRemoteTokens(snapshot.val() || {})
      })

      const mapRef = ref(db, `rooms/${roomId}/map`)
      unsubMap = onValue(mapRef, (snapshot) => {
        setMapDataUrl(snapshot.val() || null)
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
    }
  }, [roomId])

  function addToken(color, x, y) {
    const tokensRef = ref(db, `rooms/${roomId}/tokens`)
    const newRef = push(tokensRef)
    set(newRef, { color, targetX: x, targetY: y })
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

  return {
    remoteTokens,
    mapDataUrl,
    presenceCount,
    connected,
    addToken,
    moveToken,
    removeToken,
    setMap,
  }
}
