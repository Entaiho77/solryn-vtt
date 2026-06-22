import { useEffect, useMemo, useRef, useState } from 'react'
import { useReferenceData, CATEGORIES } from '../hooks/useReferenceData.js'
import './ReferenceDropdown.css'

const TABS = [{ key: 'all', label: 'All' }, ...CATEGORIES]

function describeDetail(category, detail) {
  const lines = []
  if (category === 'spells') {
    lines.push(`${detail.type ?? ''} · ${detail.damageType ?? ''}`.trim())
    if (detail.damage) lines.push(`Damage: ${detail.damage}`)
    if (detail.range) lines.push(`Range: ${detail.range}`)
    if (detail.arcanaPointCost !== undefined) lines.push(`Arcana Point Cost: ${detail.arcanaPointCost}`)
  } else if (category === 'races') {
    if (detail.bonuses?.length) {
      lines.push(`Bonuses: ${detail.bonuses.map((b) => `${b.stat} +${b.value}${b.note ? ` (${b.note})` : ''}`).join(', ')}`)
    }
    if (detail.advantages?.length) lines.push(`Advantages: ${detail.advantages.join(', ')}`)
    if (detail.weakness) lines.push(`Weakness: ${detail.weakness}`)
  } else if (category === 'skills') {
    if (detail.category) lines.push(`Category: ${detail.category}`)
    if (detail.cost) lines.push(`Cost: ${detail.cost}`)
    if (detail.minLevel) lines.push(`Min Level: ${detail.minLevel}`)
  } else if (category === 'equipment') {
    if (detail.category) lines.push(detail.category)
    if (detail.cost) lines.push(`Cost: ${detail.cost}`)
    if (detail.dr !== undefined) lines.push(`DR: ${detail.dr}`)
    if (detail.drBonus !== undefined) lines.push(`DR Bonus: ${detail.drBonus}`)
    if (detail.damage) lines.push(`Damage: ${detail.damage} ${detail.damageType ?? ''}`.trim())
    if (detail.properties) lines.push(detail.properties)
    if (detail.range) lines.push(`Range: ${detail.range}`)
  }
  return lines
}

export default function ReferenceDropdown({ open, onClose, system }) {
  const { lists, loading, error, loadLists, getDetail, hasData } = useReferenceData(system)
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selected, setSelected] = useState(null) // { category, id, detail, loading, error }
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (open) {
      loadLists()
      searchInputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(id)
  }, [query])

  const categoriesToSearch = activeTab === 'all' ? CATEGORIES.map((c) => c.key) : [activeTab]

  const results = useMemo(() => {
    if (!lists) return []
    const q = debouncedQuery.trim().toLowerCase()
    return categoriesToSearch.flatMap((categoryKey) =>
      (lists[categoryKey] ?? [])
        .filter((entry) => !q || entry.name.toLowerCase().includes(q))
        .map((entry) => ({ ...entry, category: categoryKey })),
    )
  }, [lists, debouncedQuery, categoriesToSearch])

  function handleSelectItem(category, id) {
    setSelected({ category, id, detail: null, loading: true, error: null })
    getDetail(category, id)
      .then((detail) => setSelected({ category, id, detail, loading: false, error: null }))
      .catch((e) => setSelected({ category, id, detail: null, loading: false, error: e.message }))
  }

  if (!open) return null

  return (
    <div className="reference-dropdown open">
      <div className="reference-search">
        <input
          ref={searchInputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search spells, races, skills, items..."
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>
      <div className="reference-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`reference-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="reference-body">
        <div className="reference-results">
          {!hasData && <p className="reference-hint">No reference data available for this system.</p>}
          {hasData && loading && <p className="reference-hint">Loading reference data...</p>}
          {hasData && error && <p className="reference-hint">Failed to load reference data: {error}</p>}
          {hasData && !loading && !error && results.length === 0 && (
            <p className="reference-hint">No matching results. Try a different search.</p>
          )}
          <ul>
            {results.map((entry) => (
              <li key={`${entry.category}/${entry.id}`}>
                <button
                  className={
                    selected?.category === entry.category && selected?.id === entry.id ? 'is-selected' : ''
                  }
                  onClick={() => handleSelectItem(entry.category, entry.id)}
                >
                  {entry.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {selected && (
          <div className="reference-detail">
            <div className="reference-detail-header">
              <h3>{selected.detail?.name ?? selected.id}</h3>
              <button onClick={() => setSelected(null)} aria-label="Close detail">
                ✕
              </button>
            </div>
            {selected.loading && <p className="reference-hint">Loading...</p>}
            {selected.error && <p className="reference-hint">Unable to load details.</p>}
            {selected.detail && (
              <div className="reference-detail-body">
                {describeDetail(selected.category, selected.detail).map((line) => (
                  <p key={line} className="reference-detail-meta">
                    {line}
                  </p>
                ))}
                {selected.detail.description && <p>{selected.detail.description}</p>}
                {Array.isArray(selected.detail.special) && (
                  <p>Special: {selected.detail.special.join(', ')}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
