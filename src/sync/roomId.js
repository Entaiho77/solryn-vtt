// A room id is just a path segment in the Realtime Database
// (rooms/{roomId}/...). Anyone with the link reads/writes that path —
// there's no separate "room exists" check, the path is created on first
// write. Good enough for a link-based, no-signup room.

function randomRoomId() {
  return Math.random().toString(36).slice(2, 8)
}

export function getOrCreateRoomId() {
  const url = new URL(window.location.href)
  let roomId = url.searchParams.get('room')

  if (!roomId) {
    roomId = randomRoomId()
    url.searchParams.set('room', roomId)
    window.history.replaceState({}, '', url)
  }

  return roomId
}

export function roomShareLink(roomId) {
  const url = new URL(window.location.href)
  url.searchParams.set('room', roomId)
  return url.toString()
}
