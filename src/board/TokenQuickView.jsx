import { useEffect, useRef, useState } from 'react'
import { STATUS_EFFECT_PRESETS } from '../utils/statusEffects.js'
import { imageToDataUrl } from '../utils/resizeImage.js'
import './TokenQuickView.css'

const PORTRAIT_MAX_DIMENSION = 160

export default function TokenQuickView({
  token,
  schema,
  isOwnerOrGM,
  position,
  onClose,
  onAddStatusEffect,
  onRemoveStatusEffect,
  onUploadPortrait,
  onRemovePortrait,
}) {
  const [addingCustom, setAddingCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customColor, setCustomColor] = useState('#c45b46')
  const popoverRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    function handlePointerDown(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose()
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  function handlePresetSelect(e) {
    const value = e.target.value
    e.target.value = ''
    if (!value) return
    if (value === 'custom') {
      setAddingCustom(true)
      return
    }
    const preset = STATUS_EFFECT_PRESETS.find((p) => p.id === value)
    if (preset) onAddStatusEffect(preset)
  }

  function handleAddCustom() {
    if (!customName.trim()) return
    onAddStatusEffect({ id: `custom-${Date.now()}`, name: customName.trim(), color: customColor })
    setCustomName('')
    setAddingCustom(false)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => {
      onUploadPortrait(imageToDataUrl(img, PORTRAIT_MAX_DIMENSION, 0.85))
    }
    img.src = URL.createObjectURL(file)
    e.target.value = ''
  }

  const statusEffects = token.statusEffects ?? []
  const sheet = token.sheet ?? {}

  return (
    <div
      ref={popoverRef}
      className="token-quick-view"
      style={{ left: position.x, top: position.y }}
    >
      <div className="token-quick-view-header">
        <span>{token.label || 'Token'}</span>
        <button type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {isOwnerOrGM && (
        <div className="token-quick-view-portrait">
          {token.portrait ? (
            <img src={token.portrait} alt="" className="token-quick-view-portrait-preview" />
          ) : (
            <span className="token-quick-view-portrait-empty">No portrait</span>
          )}
          <div className="token-quick-view-portrait-actions">
            <button type="button" onClick={() => fileInputRef.current.click()}>
              {token.portrait ? 'Replace' : 'Upload portrait'}
            </button>
            {token.portrait && (
              <button type="button" onClick={onRemovePortrait}>
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
        </div>
      )}

      {schema.length > 0 && (
        <dl className="token-quick-view-sheet">
          {schema.map((field) => (
            <div key={field.id} className="token-quick-view-sheet-row">
              <dt>{field.label}</dt>
              <dd>{sheet[field.id] || '—'}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="token-quick-view-effects">
        <span className="token-quick-view-section-label">Status Effects</span>
        {statusEffects.length === 0 && <p className="token-quick-view-hint">None active</p>}
        <ul>
          {statusEffects.map((effect) => (
            <li key={effect.id}>
              <span className="token-quick-view-effect-dot" style={{ background: effect.color }} />
              {effect.name}
              {isOwnerOrGM && (
                <button
                  type="button"
                  onClick={() => onRemoveStatusEffect(effect.id)}
                  aria-label={`Remove ${effect.name}`}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>

        {isOwnerOrGM && !addingCustom && (
          <select defaultValue="" onChange={handlePresetSelect}>
            <option value="" disabled>
              Add status effect…
            </option>
            {STATUS_EFFECT_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
            <option value="custom">Custom…</option>
          </select>
        )}

        {isOwnerOrGM && addingCustom && (
          <div className="token-quick-view-custom-effect">
            <input
              type="text"
              placeholder="Effect name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
            />
            <button type="button" onClick={handleAddCustom}>
              Add
            </button>
            <button type="button" onClick={() => setAddingCustom(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
