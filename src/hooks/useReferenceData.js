import { useState } from 'react'
import { getSystemApi } from '../services/systemDataService.js'

export const CATEGORIES = [
  { key: 'spells', label: 'Spells' },
  { key: 'races', label: 'Races' },
  { key: 'skills', label: 'Skills' },
  { key: 'equipment', label: 'Items' },
]

export function useReferenceData(system) {
  const [lists, setLists] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [detailCache, setDetailCache] = useState({})

  const api = getSystemApi(system)

  function loadLists() {
    if (!api || lists || loading) return
    setLoading(true)
    setError(null)
    Promise.all(CATEGORIES.map((c) => api.fetchList(c.key)))
      .then((results) => {
        const next = {}
        CATEGORIES.forEach((c, i) => {
          next[c.key] = results[i]
        })
        setLists(next)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  async function getDetail(category, id) {
    if (!api) throw new Error('No reference data available for this system')
    const key = `${category}/${id}`
    if (detailCache[key]) return detailCache[key]
    const detail = await api.fetchDetail(category, id)
    setDetailCache((c) => ({ ...c, [key]: detail }))
    return detail
  }

  return { lists, loading, error, loadLists, getDetail, hasData: !!api }
}
