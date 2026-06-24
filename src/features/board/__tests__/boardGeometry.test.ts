import { describe, it, expect } from 'vitest';
import type { Token } from '../../../data/types';
import {
  cellCenter,
  cellToPixel,
  clampCell,
  gridDimensions,
  pixelToCell,
  tokenAtCell,
} from '../boardGeometry';

describe('pixelToCell', () => {
  it.each([
    [0, 0, { col: 0, row: 0 }],
    [63, 63, { col: 0, row: 0 }],
    [64, 0, { col: 1, row: 0 }],
    [130, 200, { col: 2, row: 3 }],
  ])('(%i,%i) → cell', (x, y, expected) => {
    expect(pixelToCell(x, y, 64)).toEqual(expected);
  });
});

describe('cellToPixel / cellCenter', () => {
  it('maps a cell to its top-left and center', () => {
    expect(cellToPixel(2, 3, 64)).toEqual({ x: 128, y: 192 });
    expect(cellCenter(0, 0, 64)).toEqual({ x: 32, y: 32 });
  });
});

describe('gridDimensions', () => {
  it('covers the image, rounding up', () => {
    expect(gridDimensions(100, 100, 64)).toEqual({ cols: 2, rows: 2 });
    expect(gridDimensions(128, 64, 64)).toEqual({ cols: 2, rows: 1 });
  });
});

describe('tokenAtCell', () => {
  const tokens = [
    { id: 'a', col: 1, row: 1 },
    { id: 'b', col: 1, row: 1 },
    { id: 'c', col: 2, row: 0 },
  ] as Token[];

  it('returns the topmost token in a cell', () => {
    expect(tokenAtCell(tokens, 1, 1)?.id).toBe('b');
    expect(tokenAtCell(tokens, 2, 0)?.id).toBe('c');
    expect(tokenAtCell(tokens, 5, 5)).toBeUndefined();
  });
});

describe('clampCell', () => {
  it('keeps a cell within bounds', () => {
    expect(clampCell(-1, 5, 4, 4)).toEqual({ col: 0, row: 3 });
    expect(clampCell(2, 2, 4, 4)).toEqual({ col: 2, row: 2 });
  });
});
