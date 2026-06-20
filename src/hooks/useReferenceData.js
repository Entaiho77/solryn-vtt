import { useState } from 'react'
import { dnd5eApi, CATEGORIES } from '../services/dnd5eAPI.js'

export function useReferenceData() {
  const [lists, setLists] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [detailCache, setDetailCache] = useState({})

  function loadLists() {
    if (lists || loading) return
    setLoading(true)
    setError(null)
    Promise.all(CATEGORIES.map((c) => dnd5eApi.fetchList(c.key)))
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

  async function getDetail(category, index) {
    const key = `${category}/${index}`
    if (detailCache[key]) return detailCache[key]
    const detail = await dnd5eApi.fetchDetail(category, index)
    setDetailCache((c) => ({ ...c, [key]: detail }))
    return detail
  }

  return { lists, loading, error, loadLists, getDetail }
}
