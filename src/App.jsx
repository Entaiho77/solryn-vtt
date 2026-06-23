import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ThemeProvider, useTheme } from './theme/ThemeContext.jsx'
import ThemeToggle from './theme/ThemeToggle.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Board from './board/Board.jsx'
import Toolbar from './board/Toolbar.jsx'
import TokenQuickView from './board/TokenQuickView.jsx'
import DiceDrawer from './drawers/DiceDrawer.jsx'
import TurnDrawer from './drawers/TurnDrawer.jsx'
import SheetDrawer from './drawers/SheetDrawer.jsx'
import FogDrawer from './drawers/FogDrawer.jsx'
import BestiaryDrawer from './drawers/BestiaryDrawer.jsx'
import SolrynCharacterBuilder from './components/charactercreation/SolrynCharacterBuilder.jsx'
import ReferenceDropdown from './board/ReferenceDropdown.jsx'
import EdgeButtonTabs from './board/EdgeButtonTabs.jsx'
import EdgeButton from './board/EdgeButton.jsx'
import { useRoomSync } from './sync/useRoomSync.js'
import { getOrCreateRoomId, roomShareLink } from './sync/roomId.js'
import { uploadImage } from './services/imageStorageService.js'
import { getScalePerSquare, getMapTypeInfo, MAP_NAMES, TERRAIN_NAMES } from './utils/distanceCalculator.js'
import './styles/board.css'

const DEFAULT_GRID_SIZE = 70

function AppContent() {
  const { theme } = useTheme()
  const [roomId] = useState(getOrCreateRoomId)
  // One drawer per side, max two open at once: left is sheet|bestiary, right is dice|turn|fog.
  const [leftDrawer, setLeftDrawer] = useState(null)
  const [rightDrawer, setRightDrawer] = useState(null)
  const [referenceOpen, setReferenceOpen] = useState(false)
  const [fogBrushActive, setFogBrushActive] = useState(false)
  const [selectedTokenId, setSelectedTokenId] = useState(null)
  const [quickViewToken, setQuickViewToken] = useState(null) // { tokenId, x, y }
  const [characterBuilderOpen, setCharacterBuilderOpen] = useState(false)
  const sync = useRoomSync(roomId)
  const gridSize = sync.grid?.pixelsPerSquare ?? DEFAULT_GRID_SIZE
  const [tokens, setTokens] = useState([])
  const [mapImage, setMapImage] = useState(null)
  const localTokensRef = useRef(tokens)
  localTokensRef.current = tokens

  // Merge remote token truth into local state without clobbering
  // renderX/renderY, which is local-only animation state Board eases
  // toward the target every frame.
  useEffect(() => {
    const remoteIds = Object.keys(sync.remoteTokens)
    const existingById = new Map(localTokensRef.current.map((t) => [t.id, t]))

    const merged = remoteIds.map((id) => {
      const remote = sync.remoteTokens[id]
      const existing = existingById.get(id)
      return existing
        ? {
            ...existing,
            color: remote.color,
            ownerUid: remote.ownerUid,
            sheet: remote.sheet,
            label: remote.label,
            portrait: remote.portrait,
            statusEffects: remote.statusEffects,
            targetX: remote.targetX,
            targetY: remote.targetY,
          }
        : {
            id,
            color: remote.color,
            ownerUid: remote.ownerUid,
            sheet: remote.sheet,
            label: remote.label,
            portrait: remote.portrait,
            statusEffects: remote.statusEffects,
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
      uploadImage(img).then(sync.setMap)
    },
    [sync],
  )

  const handleAddToken = useCallback(
    (color) => {
      const x = gridSize * 6 + gridSize / 2
      const y = gridSize * 2 + gridSize / 2
      sync.addToken(color, x, y)
    },
    [sync, gridSize],
  )

  const handleAddBestiaryToken = useCallback(
    (name) => {
      const x = gridSize * 6 + gridSize / 2
      const y = gridSize * 2 + gridSize / 2
      return sync.addToken('#c45b5b', x, y, name)
    },
    [sync, gridSize],
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

  const handleSelectToken = useCallback((tokenId) => {
    setSelectedTokenId(tokenId)
    setLeftDrawer('sheet')
  }, [])

  const handleFogPaint = useCallback(
    (col, row) => {
      sync.toggleFogCell(col, row)
    },
    [sync],
  )

  const handleTokenContextMenu = useCallback((tokenId, x, y) => {
    setQuickViewToken({ tokenId, x, y })
  }, [])

  const quickViewTokenData = quickViewToken
    ? tokens.find((t) => t.id === quickViewToken.tokenId)
    : null
  const closeQuickView = useCallback(() => setQuickViewToken(null), [])

  return (
    <>
      <Toolbar
        onLoadMap={handleLoadMap}
        onAddToken={handleAddToken}
        roomLink={roomShareLink(roomId)}
        presenceCount={sync.presenceCount}
        connected={sync.connected}
        isGm={sync.isGm}
        onToggleFog={() => setRightDrawer((d) => (d === 'fog' ? null : 'fog'))}
        onToggleReference={() => setReferenceOpen((o) => !o)}
        referenceOpen={referenceOpen}
        themeToggle={<ThemeToggle />}
        mapType={sync.mapType}
        terrainDifficulty={sync.terrainDifficulty}
        onSetMapType={sync.setMapType}
        onSetTerrainDifficulty={sync.setTerrainDifficulty}
        onSetGrid={sync.setGrid}
        canCreateCharacter={!sync.isGm && sync.system === 'Solryn'}
        onCreateCharacter={() => setCharacterBuilderOpen(true)}
      />
      {characterBuilderOpen && (
        <SolrynCharacterBuilder
          roomId={roomId}
          uid={sync.uid}
          onClose={() => setCharacterBuilderOpen(false)}
        />
      )}
      <ReferenceDropdown
        open={referenceOpen}
        onClose={() => setReferenceOpen(false)}
        system={sync.system}
      />
      <EdgeButtonTabs side="left">
        <EdgeButton
          icon="👤"
          label="Character Sheet"
          active={leftDrawer === 'sheet'}
          onClick={() => setLeftDrawer((d) => (d === 'sheet' ? null : 'sheet'))}
        />
        {sync.isGm && (
          <EdgeButton
            icon="👹"
            label="Bestiary"
            active={leftDrawer === 'bestiary'}
            onClick={() => setLeftDrawer((d) => (d === 'bestiary' ? null : 'bestiary'))}
          />
        )}
      </EdgeButtonTabs>
      <EdgeButtonTabs side="right">
        <EdgeButton
          icon="🎲"
          label="Dice Roller"
          active={rightDrawer === 'dice'}
          onClick={() => setRightDrawer((d) => (d === 'dice' ? null : 'dice'))}
        />
        <EdgeButton
          icon="≡"
          label="Turn Order"
          active={rightDrawer === 'turn'}
          onClick={() => setRightDrawer((d) => (d === 'turn' ? null : 'turn'))}
        />
      </EdgeButtonTabs>
      <Board
        gridSize={gridSize}
        mapImage={mapImage}
        tokens={tokens}
        onTokensChange={handleTokensChange}
        onTokenDrop={handleTokenDrop}
        onSelectToken={handleSelectToken}
        selectedTokenId={selectedTokenId}
        theme={theme}
        uid={sync.uid}
        isGm={sync.isGm}
        fog={sync.fog}
        fogBrushActive={fogBrushActive && rightDrawer === 'fog'}
        onFogPaint={handleFogPaint}
        onTokenContextMenu={handleTokenContextMenu}
      />
      {quickViewTokenData && (
        <TokenQuickView
          token={quickViewTokenData}
          schema={sync.sheetSchema}
          isOwnerOrGM={sync.isGm || quickViewTokenData.ownerUid === sync.uid}
          position={{ x: quickViewToken.x, y: quickViewToken.y }}
          onClose={closeQuickView}
          onAddStatusEffect={(effect) =>
            sync.setTokenStatusEffects(quickViewTokenData.id, [
              ...(quickViewTokenData.statusEffects ?? []),
              effect,
            ])
          }
          onRemoveStatusEffect={(effectId) =>
            sync.setTokenStatusEffects(
              quickViewTokenData.id,
              (quickViewTokenData.statusEffects ?? []).filter((e) => e.id !== effectId),
            )
          }
          onUploadPortrait={(dataUrl) => sync.setTokenPortrait(quickViewTokenData.id, dataUrl)}
          onRemovePortrait={() => sync.setTokenPortrait(quickViewTokenData.id, null)}
        />
      )}
      <div className="scale-label">
        {MAP_NAMES[sync.mapType]} &middot; {TERRAIN_NAMES[sync.terrainDifficulty]} terrain &middot;{' '}
        {getScalePerSquare(sync.mapType, sync.terrainDifficulty)} {getMapTypeInfo(sync.mapType).unit}/sq
      </div>
      <DiceDrawer
        open={rightDrawer === 'dice'}
        onClose={() => setRightDrawer(null)}
        diceLog={sync.diceLog}
        uid={sync.uid}
        onRoll={sync.rollDice}
      />
      <SheetDrawer
        open={leftDrawer === 'sheet'}
        onClose={() => setLeftDrawer(null)}
        isGm={sync.isGm}
        uid={sync.uid}
        schema={sync.sheetSchema}
        tokens={tokens}
        selectedTokenId={selectedTokenId}
        onSelectToken={setSelectedTokenId}
        onSaveSchema={sync.setRoomSheetSchema}
        onSaveTokenSheet={sync.updateTokenSheet}
        roomId={roomId}
        onRollDice={sync.rollDice}
        onRemoveStatusEffect={sync.setTokenStatusEffects}
      />
      <BestiaryDrawer
        open={leftDrawer === 'bestiary'}
        onClose={() => setLeftDrawer(null)}
        isGm={sync.isGm}
        system={sync.system}
        bestiary={sync.bestiary}
        onSave={sync.setBestiary}
        onAddToken={handleAddBestiaryToken}
        onUpdateTokenLabel={sync.updateTokenLabel}
        onRemoveToken={sync.removeToken}
        onSetTokenPortrait={sync.setTokenPortrait}
      />
      <TurnDrawer
        open={rightDrawer === 'turn'}
        onClose={() => setRightDrawer(null)}
        isGm={sync.isGm}
        tokens={tokens}
        turn={sync.turn}
        onSetOrder={sync.setTurnOrder}
        onAdvance={sync.advanceTurn}
        onClear={sync.clearTurnOrder}
      />
      <FogDrawer
        open={rightDrawer === 'fog'}
        onClose={() => {
          setRightDrawer(null)
          setFogBrushActive(false)
        }}
        fog={sync.fog}
        brushActive={fogBrushActive}
        onToggleEnabled={sync.setFogEnabled}
        onToggleBrush={setFogBrushActive}
        onClear={sync.clearFog}
      />
    </>
  )
}

export default function App() {
  // Room links (?room=...) skip the landing page entirely — players who
  // open a share link should drop straight into the board as before.
  const hasRoomParam = useMemo(
    () => new URL(window.location.href).searchParams.has('room'),
    [],
  )

  return (
    <ThemeProvider>
      {hasRoomParam ? <AppContent /> : <LandingPage />}
    </ThemeProvider>
  )
}
