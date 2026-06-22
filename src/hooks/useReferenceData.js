import { useState } from 'react'
import { solrynApi, CATEGORIES } from '../services/solrynAPI.js'

export function useReferenceData() {
  const [lists, setLists] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [detailCache, setDetailCache] = useState({})

  function loadLists() {
    if (lists || loading) return
    setLoading(true)
    setError(null)
    Promise.all(CATEGORIES.map((c) => solrynApi.fetchList(c.key)))
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
    const key = `${category}/${id}`
    if (detailCache[key]) return detailCache[key]
    const detail = await solrynApi.fetchDetail(category, id)
    setDetailCache((c) => ({ ...c, [key]: detail }))
    return detail
  }

  return { lists, loading, error, loadLists, getDetail }
}
