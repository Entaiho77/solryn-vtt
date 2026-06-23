import { useState } from 'react'
import Drawer from './Drawer.jsx'
import SolrynCharacterSheet from '../components/charactersheet/SolrynCharacterSheet.jsx'
import './SheetDrawer.css'

const FIELD_TYPES = ['text', 'number', 'longtext']

function emptyField() {
  return { id: `f${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, label: '', type: 'text' }
}

export default function SheetDrawer({
  open,
  onClose,
  isGm,
  uid,
  schema,
  tokens,
  selectedTokenId,
  onSelectToken,
  onSaveSchema,
  onSaveTokenSheet,
  roomId,
  onRollDice,
  onRemoveStatusEffect,
}) {
  const [editingSchema, setEditingSchema] = useState(false)
  const [draftFields, setDraftFields] = useState(schema)

  const selectedToken = tokens.find((t) => t.id === selectedTokenId)

  function startEditingSchema() {
    setDraftFields(schema.length ? schema : [emptyField()])
    setEditingSchema(true)
  }

  function updateDraftField(index, patch) {
    setDraftFields((fields) => fields.map((f, i) => (i === index ? { ...f, ...patch } : f)))
  }

  function addDraftField() {
    setDraftFields((fields) => [...fields, emptyField()])
  }

  function removeDraftField(index) {
    setDraftFields((fields) => fields.filter((_, i) => i !== index))
  }

  function saveSchema() {
    onSaveSchema(draftFields.filter((f) => f.label.trim()))
    setEditingSchema(false)
  }

  function updateSheetValue(fieldId, value) {
    if (!selectedToken) return
    onSaveTokenSheet(selectedToken.id, { ...selectedToken.sheet, [fieldId]: value })
  }

  const canEditSelected = selectedToken && (isGm || selectedToken.ownerUid === uid)

  return (
    <Drawer side="left" title="Character sheet" open={open} onClose={onClose}>
      {isGm && (
        <div className="sheet-schema-controls">
          {editingSchema ? (
            <>
              {draftFields.map((field, i) => (
                <div key={field.id} className="sheet-field-editor">
                  <input
                    placeholder="Field label"
                    value={field.label}
                    onChange={(e) => updateDraftField(i, { label: e.target.value })}
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateDraftField(i, { type: e.target.value })}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => removeDraftField(i)} aria-label="Remove field">
                    ✕
                  </button>
                </div>
              ))}
              <div className="sheet-schema-actions">
                <button onClick={addDraftField}>Add field</button>
                <button onClick={saveSchema}>Save schema</button>
              </div>
            </>
          ) : (
            <button onClick={startEditingSchema}>
              {schema.length ? 'Edit sheet fields' : 'Define sheet fields'}
            </button>
          )}
        </div>
      )}

      <p className="sheet-hint">Click a token on the board to view or edit its sheet.</p>

      <ul className="sheet-token-picker">
        {tokens.map((t) => (
          <li key={t.id}>
            <button
              className={t.id === selectedTokenId ? 'is-selected' : ''}
              onClick={() => onSelectToken(t.id)}
            >
              <span className="sheet-token-swatch" style={{ background: t.color }} />
              Token
            </button>
          </li>
        ))}
      </ul>

      {selectedToken && selectedToken.characterId && (
        <SolrynCharacterSheet
          roomId={roomId}
          token={selectedToken}
          isEditable={canEditSelected}
          onRollDice={onRollDice}
          onRemoveStatusEffect={(effectId) =>
            onRemoveStatusEffect(
              selectedToken.id,
              (selectedToken.statusEffects ?? []).filter((e) => e.id !== effectId),
            )
          }
        />
      )}

      {selectedToken && !selectedToken.characterId && (
        <div className="sheet-fields">
          {schema.length === 0 && <p className="sheet-hint">No sheet fields defined yet.</p>}
          {schema.map((field) => (
            <label key={field.id} className="sheet-field">
              <span>{field.label}</span>
              {field.type === 'longtext' ? (
                <textarea
                  disabled={!canEditSelected}
                  value={selectedToken.sheet?.[field.id] ?? ''}
                  onChange={(e) => updateSheetValue(field.id, e.target.value)}
                />
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  disabled={!canEditSelected}
                  value={selectedToken.sheet?.[field.id] ?? ''}
                  onChange={(e) => updateSheetValue(field.id, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>
      )}
    </Drawer>
  )
}
