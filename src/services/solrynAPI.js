const BASE_URL = import.meta.env.VITE_SOLRYN_API_URL || 'http://localhost:3000'
const GM_TOKEN = import.meta.env.VITE_SOLRYN_GM_TOKEN || ''

function flattenSkills(data) {
  return [
    ...data.baseSkills,
    ...data.weaponSkills,
    ...data.actionEconomySkills,
    ...data.craftingSkills,
  ]
}

function flattenEquipment(data) {
  const items = []
  for (const tier of Object.values(data.armor ?? {})) {
    for (const piece of tier) items.push({ ...piece, category: 'Armor' })
  }
  for (const shield of data.shields ?? []) items.push({ ...shield, category: 'Shield' })
  for (const group of Object.values(data.weapons ?? {})) {
    for (const weapon of group) items.push({ ...weapon, category: 'Weapon' })
  }
  for (const potion of data.healingPotions ?? []) items.push({ ...potion, category: 'Healing Potion' })
  for (const core of data.soulCores ?? []) items.push({ ...core, category: 'Soul Core' })
  return items
}

async function fetchJson(path, { gmOnly = false } = {}) {
  const headers = gmOnly ? { 'x-gm-token': GM_TOKEN } : undefined
  const res = await fetch(`${BASE_URL}/api/${path}`, { headers })
  if (!res.ok) throw new Error(`Failed to fetch ${path}`)
  return res.json()
}

async function fetchList(category) {
  if (category === 'races') return fetchJson('races')
  if (category === 'spells') return fetchJson('spells')
  if (category === 'skills') return flattenSkills(await fetchJson('skills'))
  if (category === 'equipment') return flattenEquipment(await fetchJson('equipment'))
  if (category === 'creatures') return fetchJson('creatures', { gmOnly: true })
  throw new Error(`Unknown category: ${category}`)
}

async function fetchDetail(category, id) {
  if (category === 'creatures') return fetchJson(`creatures/${id}`, { gmOnly: true })
  if (category === 'races') return fetchJson(`races/${id}`)
  if (category === 'spells') return fetchJson(`spells/${id}`)
  if (category === 'skills') {
    const all = flattenSkills(await fetchJson('skills'))
    const skill = all.find((s) => s.id === id)
    if (!skill) throw new Error('Skill not found')
    return skill
  }
  if (category === 'equipment') {
    const all = flattenEquipment(await fetchJson('equipment'))
    const item = all.find((e) => e.id === id)
    if (!item) throw new Error('Item not found')
    return item
  }
  throw new Error(`Unknown category: ${category}`)
}

export const solrynApi = { fetchList, fetchDetail }
