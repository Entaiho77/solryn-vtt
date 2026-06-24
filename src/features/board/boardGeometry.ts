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
