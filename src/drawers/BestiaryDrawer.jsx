import { useEffect, useMemo, useState } from 'react'
import Drawer from './Drawer.jsx'
import { solrynApi } from '../services/solrynAPI.js'
import './BestiaryDrawer.css'

function emptyCreature() {
  return { id: `c${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: '', notes: '' }
}

function describeMonster(monster) {
  const lines = [
    `${monster.type ?? ''} · ${monster.threatLevel ?? ''}`.trim(),
    `HP ${monster.hp ?? '?'} · DR ${monster.dr ?? '?'} · Speed ${monster.speed ?? '?'}`,
    monster.damage ? `Damage: ${monster.damage}` : null,
  ]
  return lines.filter(Boolean).join('\n')
}

export default function BestiaryDrawer({
  open,
  onClose,
  isGm,
  bestiary,
  onSave,
  onAddToken,
  onUpdateTokenLabel,
  onRemoveToken,
}) {
  const [monsterList, setMonsterList] = useState(null)
  const [monsterQuery, setMonsterQuery] = useState('')
  const [loadingMonster, setLoadingMonster] = useState(false)

  useEffect(() => {
    if (!open || monsterList || !isGm) return
    solrynApi
      .fetchList('creatures')
      .then(setMonsterList)
      .catch(() => setMonsterList([]))
  }, [open, monsterList, isGm])

  const monsterResults = useMemo(() => {
    if (!monsterList) return []
    const q = monsterQuery.trim().toLowerCase()
    if (!q) return []
    return monsterList.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 20)
  }, [monsterList, monsterQuery])

  function addCreature() {
    const creature = emptyCreature()
    creature.tokenId = onAddToken?.('')
    onSave([...bestiary, creature])
  }

  async function addMonster(monster) {
    setLoadingMonster(true)
    try {
      const detail = await solrynApi.fetchDetail('creatures', monster.id)
      const tokenId = onAddToken?.(detail.name)
      onSave([
        ...bestiary,
        {
          id: `c${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: detail.name,
          notes: describeMonster(detail),
          tokenId,
        },
      ])
      setMonsterQuery('')
    } finally {
      setLoadingMonster(false)
    }
  }

  function updateCreature(index, patch) {
    const creature = bestiary[index]
    if (patch.name !== undefined && creature.tokenId) {
      onUpdateTokenLabel?.(creature.tokenId, patch.name)
    }
    onSave(bestiary.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  function removeCreature(index) {
    const creature = bestiary[index]
    if (creature.tokenId) onRemoveToken?.(creature.tokenId)
    onSave(bestiary.filter((_, i) => i !== index))
  }

  return (
    <Drawer side="left" title="Bestiary" open={open} onClose={onClose}>
      {!isGm && <p className="bestiary-hint">Only the GM can view the bestiary.</p>}
      {isGm && (
        <>
          <div className="bestiary-srd-search">
            <input
              placeholder="Search Solryn creatures to add..."
              value={monsterQuery}
              onChange={(e) => setMonsterQuery(e.target.value)}
            />
            {monsterQuery && (
              <ul className="bestiary-srd-results">
                {monsterResults.length === 0 && <li className="bestiary-hint">No matches.</li>}
                {monsterResults.map((m) => (
                  <li key={m.id}>
                    <button disabled={loadingMonster} onClick={() => addMonster(m)}>
                      {m.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {bestiary.length === 0 && <p className="bestiary-hint">No creatures added yet.</p>}
          <ul className="bestiary-list">
            {bestiary.map((creature, i) => (
              <li key={creature.id} className="bestiary-entry">
                <input
                  placeholder="Creature name"
                  value={creature.name}
                  onChange={(e) => updateCreature(i, { name: e.target.value })}
                />
                <textarea
                  placeholder="Notes (stats, abilities, etc.)"
                  value={creature.notes}
                  onChange={(e) => updateCreature(i, { notes: e.target.value })}
                />
                <button onClick={() => removeCreature(i)} aria-label="Remove creature">
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button onClick={addCreature}>Add custom creature</button>
        </>
      )}
    </Drawer>
  )
}
