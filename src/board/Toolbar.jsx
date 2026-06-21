import { useRef, useState } from 'react'
import MapLoadDialog from './MapLoadDialog.jsx'
import { MAP_TYPES, MAP_NAMES, TERRAIN_DIFFICULTIES, TERRAIN_NAMES, SCALE_MAPS } from '../utils/distanceCalculator.js'
import './Toolbar.css'

const TOKEN_COLORS = ['#5b8cff', '#ff5b6e', '#4cd97b', '#ffc24c', '#c45bff']

export default function Toolbar({
  onLoadMap,
  onAddToken,
  roomLink,
  presenceCount,
  connected,
  isGm,
  onToggleFog,
  onToggleReference,
  referenceOpen,
  themeToggle,
  mapType,
  terrainDifficulty,
  onSetMapType,
  onSetTerrainDifficulty,
  onSetGrid,
}) {
  const fileInputRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [pendingImage, setPendingImage] = useState(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => setPendingImage(img)
    img.src = URL.createObjectURL(file)
    e.target.value = ''
  }

  function handleConfirmMapSetup({ mapType: type, gridDimensions, pixelsPerSquare }) {
    onSetMapType(type)
    onSetGrid({ ...gridDimensions, pixelsPerSquare })
    onLoadMap(pendingImage)
    setPendingImage(null)
  }

  function handleCancelMapSetup() {
    setPendingImage(null)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(roomLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        {isGm && (
          <button onClick={() => fileInputRef.current.click()}>Load map</button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
        <button
          onClick={() =>
            onAddToken(TOKEN_COLORS[Math.floor(Math.random() * TOKEN_COLORS.length)])
          }
        >
          Add token
        </button>
        <button className={referenceOpen ? 'is-active' : ''} onClick={onToggleReference}>
          📖 Reference
        </button>
        {isGm && <button onClick={onToggleFog}>Fog</button>}
        <button onClick={handleCopyLink}>
          {copied ? 'Link copied!' : 'Copy room link'}
        </button>
      </div>
      <div className="toolbar-group">
        <label className="toolbar-select">
          Map Type:
          <select
            value={mapType}
            disabled={!isGm}
            onChange={(e) => onSetMapType(e.target.value)}
          >
            {MAP_TYPES.map((type) => (
              <option key={type} value={type}>
                {MAP_NAMES[type]} ({SCALE_MAPS[type].normal} {SCALE_MAPS[type].unit}/sq)
              </option>
            ))}
          </select>
        </label>
        <label className="toolbar-select">
          Terrain:
          <select
            value={terrainDifficulty}
            disabled={!isGm}
            onChange={(e) => onSetTerrainDifficulty(e.target.value)}
          >
            {TERRAIN_DIFFICULTIES.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {TERRAIN_NAMES[difficulty]}
              </option>
            ))}
          </select>
        </label>
        {themeToggle}
        <span className="role-pill">{isGm ? 'GM' : 'Player'}</span>
        <span className={`presence-pill ${connected ? 'is-connected' : 'is-disconnected'}`}>
          {connected ? `● ${presenceCount} connected` : '○ reconnecting…'}
        </span>
      </div>
      {pendingImage && (
        <MapLoadDialog
          image={pendingImage}
          onConfirm={handleConfirmMapSetup}
          onCancel={handleCancelMapSetup}
        />
      )}
    </div>
  )
}
