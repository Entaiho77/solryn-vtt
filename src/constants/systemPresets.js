export const SYSTEM_PRESETS = {
  Solryn: [
    { id: 'strength', label: 'Strength', type: 'number' },
    { id: 'nimbleness', label: 'Nimbleness', type: 'number' },
    { id: 'endurance', label: 'Endurance', type: 'number' },
    { id: 'wisdom', label: 'Wisdom', type: 'number' },
    { id: 'intelligence', label: 'Intelligence', type: 'number' },
    { id: 'arcana', label: 'Arcana', type: 'number' },
    { id: 'luck', label: 'Luck', type: 'number' },
    { id: 'dr', label: 'Damage Reduction', type: 'number' },
    { id: 'hp', label: 'Hit Points', type: 'number' },
    { id: 'max-hp', label: 'Max Hit Points', type: 'number' },
    { id: 'arcana-points', label: 'Arcana Points', type: 'number' },
    { id: 'luck-points', label: 'Luck Points', type: 'number' },
    { id: 'speed', label: 'Movement Speed', type: 'number' },
  ],
  // Add 'D&D 5e' here once a D&D-backed API client exists.
  // 'Generic / Custom' intentionally has no entry — getPresetSchema falls
  // back to [] so the GM builds their own schema, same as today.
}

export function getPresetSchema(system) {
  return SYSTEM_PRESETS[system] ?? []
}
