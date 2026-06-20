export const SCALE_MAPS = {
  world: { unit: 'miles', normal: 20, difficult: 10, favored: 30 },
  area: { unit: 'miles', normal: 10, difficult: 5, favored: 15 },
  city: { unit: 'feet', normal: 20, difficult: 10, favored: 30 },
  battle: { unit: 'feet', normal: 5, difficult: 2.5, favored: 7.5 },
}

export const MAP_TYPES = ['world', 'area', 'city', 'battle']
export const TERRAIN_DIFFICULTIES = ['normal', 'difficult', 'favored']

export const MAP_NAMES = {
  world: 'World Map',
  area: 'Area Map',
  city: 'City Map',
  battle: 'Battle Map',
}

export const TERRAIN_NAMES = {
  normal: 'Normal',
  difficult: 'Difficult',
  favored: 'Favored',
}

export function getScalePerSquare(mapType, terrainDifficulty) {
  const scaleData = SCALE_MAPS[mapType] ?? SCALE_MAPS.battle
  return scaleData[terrainDifficulty] ?? scaleData.normal
}

export function calculateDistance(gridSquares, mapType, terrainDifficulty) {
  const scaleData = SCALE_MAPS[mapType] ?? SCALE_MAPS.battle
  const perSquare = scaleData[terrainDifficulty] ?? scaleData.normal
  const distance = gridSquares * perSquare
  const unit = scaleData.unit

  return {
    distance,
    unit,
    perSquare,
    formatted: `${distance} ${unit}`,
  }
}

export function getMapTypeInfo(mapType) {
  const scaleData = SCALE_MAPS[mapType] ?? SCALE_MAPS.battle
  return {
    name: MAP_NAMES[mapType] ?? MAP_NAMES.battle,
    unit: scaleData.unit,
    scales: scaleData,
  }
}

// Display-only for now — token movement isn't blocked by terrain/speed yet.
export function isMovementValid() {
  return true
}
