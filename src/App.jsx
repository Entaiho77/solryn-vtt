import { useCallback, useEffect, useRef, useState } from 'react'
import { ThemeProvider, useTheme } from './theme/ThemeContext.jsx'
import ThemeToggle from './theme/ThemeToggle.jsx'
import Board from './board/Board.jsx'
import Toolbar from './board/Toolbar.jsx'
import { useRoomSync } from './sync/useRoomSync.js'
import { getOrCreateRoomId, roomShareLink } from './sync/roomId.js'
import { imageToDataUrl } from './utils/resizeImage.js'
import './styles/board.css'

const GRID_SIZE = 70

function AppContent() {
  const { theme } = useTheme()
  const [roomId] = useState(getOrCreateRoomId)
  const sync = useRoomSync(roomId)
  const [tokens, setTokens] = useState([])
  const [mapImage, setMapImage] = useState(null)
  const localTokensRef = useRef(tokens)
  localTokensRef.current = tokens

  // Merge remote token truth (color/targetX/targetY) into local state
  // without clobbering renderX/renderY, which is local-only animation
  // state Board eases toward the target every frame.
  useEffect(() => {
    const remoteIds = Object.keys(sync.remoteTokens)
    const existingById = new Map(localTokensRef.current.map((t) => [t.id, t]))

    const merged = remoteIds.map((id) => {
      const remote = sync.remoteTokens[id]
      const existing = existingById.get(id)
      return existing
        ? { ...existing, color: remote.color, targetX: remote.targetX, targetY: remote.targetY }
        : {
            id,
            color: remote.color,
            targetX: remote.targetX,
            targetY: remote.targetY,
            renderX: remote.targetX,
            renderY: remote.targetY,
          }
    })

    setTokens(merged)
  }, [sync.remoteTokens])

  // load the synced map (data URL) as an Image whenever it changes
  useEffect(() => {
    if (!sync.mapDataUrl) {
      setMapImage(null)
      return
    }
    const img = new Image()
    img.onload = () => setMapImage(img)
    img.src = sync.mapDataUrl
  }, [sync.mapDataUrl])

  const handleLoadMap = useCallback(
    (img) => {
      sync.setMap(imageToDataUrl(img))
    },
    [sync],
  )

  const handleAddToken = useCallback(
    (color) => {
      const x = GRID_SIZE * 2 + GRID_SIZE / 2
      const y = GRID_SIZE * 2 + GRID_SIZE / 2
      sync.addToken(color, x, y)
    },
    [sync],
  )

  const handleTokensChange = useCallback((updated) => {
    setTokens(updated)
  }, [])

  const handleTokenDrop = useCallback(
    (id, x, y) => {
      sync.moveToken(id, x, y)
    },
    [sync],
  )

  return (
    <>
      <ThemeToggle />
      <Toolbar
        onLoadMap={handleLoadMap}
        onAddToken={handleAddToken}
        roomLink={roomShareLink(roomId)}
        presenceCount={sync.presenceCount}
        connected={sync.connected}
      />
      <Board
        gridSize={GRID_SIZE}
        mapImage={mapImage}
        tokens={tokens}
        onTokensChange={handleTokensChange}
        onTokenDrop={handleTokenDrop}
        theme={theme}
      />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
