import { useState } from 'react'
import { MAP_TYPES, MAP_NAMES, SCALE_MAPS } from '../utils/distanceCalculator.js'
import './MapTypeModal.css'

export default function MapTypeModal({ onConfirm, onCancel }) {
  const [selected, setSelected] = useState('battle')

  return (
    <div className="map-type-modal-overlay">
      <div className="map-type-modal">
        <h2>Map Type</h2>
        <p className="map-type-modal-desc">Choose the scale for this map</p>
        <div className="map-type-options">
          {MAP_TYPES.map((type) => (
            <label key={type} className="map-type-option">
              <input
                type="radio"
                name="map-type"
                value={type}
                checked={selected === type}
                onChange={() => setSelected(type)}
              />
              {MAP_NAMES[type]} ({SCALE_MAPS[type].normal} {SCALE_MAPS[type].unit}/sq)
            </label>
          ))}
        </div>
        <div className="map-type-modal-actions">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={() => onConfirm(selected)}>Load</button>
        </div>
      </div>
    </div>
  )
}
