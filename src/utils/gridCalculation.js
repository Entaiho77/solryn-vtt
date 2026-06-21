export const MAP_TYPE_PRESETS = {
  battle: { name: 'Battle', defaultGrid: { width: 20, height: 15 } },
  city: { name: 'City', defaultGrid: { width: 25, height: 25 } },
  area: { name: 'Area', defaultGrid: { width: 30, height: 20 } },
  world: { name: 'World', defaultGrid: { width: 40, height: 30 } },
}

const MIN_PIXELS_PER_SQUARE = 32
const MAX_GRID_SQUARES = 99

// Average the X/Y pixels-per-square so a non-square grid still gets one
// consistent cell size, rather than stretching squares into rectangles.
export function calculateGridSize(imageDimensions, gridDimensions) {
  const pixelsPerSquareX = imageDimensions.width / gridDimensions.width
  const pixelsPerSquareY = imageDimensions.height / gridDimensions.height
  return Math.round((pixelsPerSquareX + pixelsPerSquareY) / 2)
}

export function validateGridDimensions({ width, height }) {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return 'Grid dimensions must be whole numbers.'
  }
  if (width <= 0 || height <= 0) {
    return 'Grid dimensions must be greater than 0.'
  }
  if (width > MAX_GRID_SQUARES || height > MAX_GRID_SQUARES) {
    return `Grid dimensions must be ${MAX_GRID_SQUARES} squares or fewer.`
  }
  return null
}

export function validatePixelsPerSquare(pixelsPerSquare) {
  if (pixelsPerSquare < MIN_PIXELS_PER_SQUARE) {
    return `Grid is too fine for this image (${pixelsPerSquare}px per square, minimum ${MIN_PIXELS_PER_SQUARE}px). Try fewer squares.`
  }
  return null
}
