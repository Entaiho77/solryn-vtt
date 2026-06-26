import type { Token } from '../../data/types';

/** Pure board geometry: grid-cell ↔ pixel math, snapping, and hit-testing. No I/O. */

export interface Cell {
  col: number;
  row: number;
}

/** Which cell a pixel coordinate falls in (used for snap-to-grid and clicks). */
export function pixelToCell(x: number, y: number, gridSize: number): Cell {
  return { col: Math.floor(x / gridSize), row: Math.floor(y / gridSize) };
}

/** Top-left pixel of a cell. */
export function cellToPixel(
  col: number,
  row: number,
  gridSize: number,
): { x: number; y: number } {
  return { x: col * gridSize, y: row * gridSize };
}

/** Center pixel of a cell (token art is centered here). */
export function cellCenter(
  col: number,
  row: number,
  gridSize: number,
): { x: number; y: number } {
  return { x: (col + 0.5) * gridSize, y: (row + 0.5) * gridSize };
}

/** Grid dimensions covering an image of the given pixel size. */
export function gridDimensions(
  width: number,
  height: number,
  gridSize: number,
): { cols: number; rows: number } {
  return {
    cols: Math.max(1, Math.ceil(width / gridSize)),
    rows: Math.max(1, Math.ceil(height / gridSize)),
  };
}

/** Topmost token occupying a cell (later tokens render on top). */
export function tokenAtCell(
  tokens: Token[],
  col: number,
  row: number,
): Token | undefined {
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].col === col && tokens[i].row === row) return tokens[i];
  }
  return undefined;
}

/** Every token occupying a cell, in render order (bottom → top; topmost is last). */
export function tokensAtCell(tokens: Token[], col: number, row: number): Token[] {
  return tokens.filter((t) => t.col === col && t.row === row);
}

/**
 * Click-cycling through a stack of tokens sharing a cell. The stack is in render order
 * (bottom → top), so the topmost token is the last element. A fresh click (the current
 * selection isn't in this stack) picks the topmost; each repeat click steps one token
 * down and wraps from the bottom back to the top — so every stacked token is reachable
 * by clicking the cell again. Returns undefined for an empty cell.
 */
export function cycleSelection(
  stack: Token[],
  currentId: string | undefined,
): Token | undefined {
  if (stack.length === 0) return undefined;
  const idx = currentId ? stack.findIndex((t) => t.id === currentId) : -1;
  if (idx === -1) return stack[stack.length - 1]; // first click → topmost
  return stack[(idx - 1 + stack.length) % stack.length]; // step down, wrap to top
}

/**
 * Nearest unoccupied cell to a start cell, searched in growing Chebyshev rings and
 * clamped to the board. Used when dropping a new creature so several placements don't
 * pile onto one square. Falls back to the start cell if the whole board is full.
 * `occupied` keys are `"col,row"`.
 */
export function firstFreeCell(
  occupied: Set<string>,
  startCol: number,
  startRow: number,
  cols: number,
  rows: number,
): Cell {
  const key = (c: number, r: number) => `${c},${r}`;
  if (!occupied.has(key(startCol, startRow))) return { col: startCol, row: startRow };
  const maxRadius = Math.max(cols, rows);
  for (let radius = 1; radius <= maxRadius; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== radius) continue; // ring perimeter only
        const c = startCol + dc;
        const r = startRow + dr;
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
        if (!occupied.has(key(c, r))) return { col: c, row: r };
      }
    }
  }
  return { col: startCol, row: startRow }; // board full — fall back
}

/**
 * Distance between two cells in squares (Chebyshev — diagonal counts as one step, the
 * usual grid-movement count). Multiply by a map type's per-square scale for feet/miles.
 */
export function gridDistanceSquares(
  sc: number,
  sr: number,
  ec: number,
  er: number,
): number {
  return Math.max(Math.abs(ec - sc), Math.abs(er - sr));
}

/** Clamp a cell to the board bounds. */
export function clampCell(
  col: number,
  row: number,
  cols: number,
  rows: number,
): Cell {
  return {
    col: Math.max(0, Math.min(col, cols - 1)),
    row: Math.max(0, Math.min(row, rows - 1)),
  };
}
