import { useState } from 'react'
import {
  MAP_TYPE_PRESETS,
  calculateGridSize,
  validateGridDimensions,
  validatePixelsPerSquare,
} from '../utils/gridCalculation.js'
import './MapLoadDialog.css'

const PRESET_TYPES = ['battle', 'city', 'area', 'world']

export default function MapLoadDialog({ image, onConfirm, onCancel }) {
  const [selectedType, setSelectedType] = useState('battle')
  const [customGrid, setCustomGrid] = useState(MAP_TYPE_PRESETS.battle.defaultGrid)
  const [error, setError] = useState(null)

  const isCustom = selectedType === 'custom'
  const gridDimensions = isCustom ? customGrid : MAP_TYPE_PRESETS[selectedType].defaultGrid

  function selectType(type) {
    setSelectedType(type)
    setError(null)
    if (type === 'custom') setCustomGrid(MAP_TYPE_PRESETS.battle.defaultGrid)
  }

  function updateCustomGrid(patch) {
    setCustomGrid((g) => ({ ...g, ...patch }))
    setError(null)
  }

  function handleLoad() {
    const dimError = validateGridDimensions(gridDimensions)
    if (dimError) {
      setError(dimError)
      return
    }
    const pixelsPerSquare = calculateGridSize(
      { width: image.width, height: image.height },
      gridDimensions,
    )
    const pxError = validatePixelsPerSquare(pixelsPerSquare)
    if (pxError) {
      setError(pxError)
      return
    }
    onConfirm({
      // Custom grids don't define their own distance-per-square scale, so
      // they keep battle's ft/sq scale — the GM can still override that
      // afterward via the Map Type / Terrain dropdowns on the toolbar.
      mapType: isCustom ? 'battle' : selectedType,
      gridDimensions,
      pixelsPerSquare,
    })
  }

  return (
    <div className="map-load-overlay">
      <div className="map-load-dialog">
        <h2>Map Setup</h2>
        <p className="map-load-desc">Select a map type or define a custom grid</p>

        <div className="map-type-selector">
          {PRESET_TYPES.map((type) => {
            const preset = MAP_TYPE_PRESETS[type]
            return (
              <button
                key={type}
                type="button"
                className={`map-type-option ${selectedType === type ? 'selected' : ''}`}
                onClick={() => selectType(type)}
              >
                <span className="map-type-circle" />
                <span className="map-type-label">{preset.name}</span>
                <span className="map-type-dimensions">
                  {preset.defaultGrid.width}×{preset.defaultGrid.height}
                </span>
              </button>
            )
          })}
          <button
            type="button"
            className={`map-type-option ${isCustom ? 'selected' : ''}`}
            onClick={() => selectType('custom')}
          >
            <span className="map-type-circle" />
            <span className="map-type-label">Custom Grid</span>
          </button>
        </div>

        <div className={`grid-dimension-input ${isCustom ? 'enabled' : ''}`}>
          <label>
            Width
            <input
              type="number"
              min="1"
              max="99"
              value={gridDimensions.width}
              disabled={!isCustom}
              onChange={(e) => updateCustomGrid({ width: Number(e.target.value) })}
            />
          </label>
          <label>
            Height
            <input
              type="number"
              min="1"
              max="99"
              value={gridDimensions.height}
              disabled={!isCustom}
              onChange={(e) => updateCustomGrid({ height: Number(e.target.value) })}
            />
          </label>
        </div>

        {error && <p className="map-load-error">{error}</p>}

        <div className="dialog-buttons">
          <button type="button" className="dialog-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="dialog-button primary" onClick={handleLoad}>
            Load
          </button>
        </div>
      </div>
    </div>
  )
}
