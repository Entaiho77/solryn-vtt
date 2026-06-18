// Grid + camera math shared by rendering and hit-testing.

export function worldToScreen(camera, x, y) {
  return {
    x: (x - camera.x) * camera.scale,
    y: (y - camera.y) * camera.scale,
  }
}

export function screenToWorld(camera, x, y) {
  return {
    x: x / camera.scale + camera.x,
    y: y / camera.scale + camera.y,
  }
}

export function cellCenter(gridSize, col, row) {
  return {
    x: col * gridSize + gridSize / 2,
    y: row * gridSize + gridSize / 2,
  }
}

export function worldToCell(gridSize, x, y) {
  return {
    col: Math.floor(x / gridSize),
    row: Math.floor(y / gridSize),
  }
}
