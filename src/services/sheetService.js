import { ref, update } from 'firebase/database'
import { db } from '../firebase.js'

// Partial update — only touches the given keys under tokens/{tokenId}/sheet,
// unlike useRoomSync's updateTokenSheet which replaces the whole sheet object.
export function updateSheetField(roomId, tokenId, updates) {
  return update(ref(db, `rooms/${roomId}/tokens/${tokenId}/sheet`), updates)
}
