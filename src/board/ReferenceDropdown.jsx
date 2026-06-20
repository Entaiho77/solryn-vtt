import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES } from '../services/dnd5eAPI.js'
import { useReferenceData } from '../hooks/useReferenceData.js'
import './ReferenceDropdown.css'

const TABS = [{ key: 'all', label: 'All' }, ...CATEGORIES]

function describeDetail(category, detail) {
  const lines = []
  if (category === 'spells') {
    lines.push(`${detail.level === 0 ? 'Cantrip' : `${detail.level} level`} ${detail.school?.name ?? ''}`.trim())
    if (detail.casting_time) lines.push(`Casting Time: ${detail.casting_time}`)
    if (detail.range) lines.push(`Range: ${detail.range}`)
    if (detail.duration) lines.push(`Duration: ${detail.duration}`)
  } else if (category === 'classes') {
    if (detail.hit_die) lines.push(`Hit Die: d${detail.hit_die}`)
  } else if (category === 'races') {
    if (detail.speed) lines.push(`Speed: ${detail.speed} ft`)
    if (detail.size) lines.push(`Size: ${detail.size}`)
  } else if (category === 'equipment') {
    if (detail.equipment_category?.name) lines.push(detail.equipment_category.name)
    if (detail.cost) lines.push(`Cost: ${detail.cost.quantity} ${detail.cost.unit}`)
    if (detail.weight) lines.push(`Weight: ${detail.weight} lb`)
  }
  return lines
}

export default function ReferenceDropdown({ open, onClose }) {
  const { lists, loading, error, loadLists, getDetail } = useReferenceData()
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selected, setSelected] = useState(null) // { category, index, detail, loading, error }
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

  function handleSelectItem(category, index) {
    setSelected({ category, index, detail: null, loading: true, error: null })
    getDetail(category, index)
      .then((detail) => setSelected({ category, index, detail, loading: false, error: null }))
      .catch((e) => setSelected({ category, index, detail: null, loading: false, error: e.message }))
  }

  if (!open) return null

  return (
    <div className="reference-dropdown open">
      <div className="reference-search">
        <input
          ref={searchInputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search spells, classes, races, items..."
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
          {loading && <p className="reference-hint">Loading 5e SRD data...</p>}
          {error && <p className="reference-hint">Failed to load reference data: {error}</p>}
          {!loading && !error && results.length === 0 && (
            <p className="reference-hint">No matching results. Try a different search.</p>
          )}
          <ul>
            {results.map((entry) => (
              <li key={`${entry.category}/${entry.index}`}>
                <button
                  className={
                    selected?.category === entry.category && selected?.index === entry.index
                      ? 'is-selected'
                      : ''
                  }
                  onClick={() => handleSelectItem(entry.category, entry.index)}
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
              <h3>{selected.detail?.name ?? selected.index}</h3>
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
                {Array.isArray(selected.detail.desc) &&
                  selected.detail.desc.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
