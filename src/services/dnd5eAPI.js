const BASE_URL = 'https://www.dnd5eapi.co/api'

export const CATEGORIES = [
  { key: 'spells', label: 'Spells' },
  { key: 'classes', label: 'Classes' },
  { key: 'races', label: 'Races' },
  { key: 'equipment', label: 'Items' },
]

async function fetchList(category) {
  const res = await fetch(`${BASE_URL}/${category}`)
  if (!res.ok) throw new Error(`Failed to fetch ${category}`)
  const data = await res.json()
  return data.results // [{ index, name, url }, ...]
}

async function fetchDetail(category, index) {
  const res = await fetch(`${BASE_URL}/${category}/${index}`)
  if (!res.ok) throw new Error(`Failed to fetch ${category}/${index}`)
  return res.json()
}

export const dnd5eApi = { fetchList, fetchDetail }
