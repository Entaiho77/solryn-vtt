import { solrynApi } from './solrynAPI.js'

const SYSTEM_APIS = {
  Solryn: solrynApi,
  // 'D&D 5e': dnd5eApi,  -- re-add when a D&D-backed client exists
}

export function getSystemApi(system) {
  return SYSTEM_APIS[system] ?? null
}
