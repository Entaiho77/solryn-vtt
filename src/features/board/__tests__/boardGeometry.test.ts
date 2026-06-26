import { describe, it, expect } from 'vitest';
import type { Token } from '../../../data/types';
import {
  cellCenter,
  cellToPixel,
  clampCell,
  cycleSelection,
  firstFreeCell,
  gridDimensions,
  gridDistanceSquares,
  pixelToCell,
  tokenAtCell,
  tokensAtCell,
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

describe('tokensAtCell', () => {
  const tokens = [
    { id: 'a', col: 1, row: 1 },
    { id: 'b', col: 1, row: 1 },
    { id: 'c', col: 2, row: 0 },
  ] as Token[];

  it('returns every token in a cell, bottom → top', () => {
    expect(tokensAtCell(tokens, 1, 1).map((t) => t.id)).toEqual(['a', 'b']);
    expect(tokensAtCell(tokens, 2, 0).map((t) => t.id)).toEqual(['c']);
    expect(tokensAtCell(tokens, 5, 5)).toEqual([]);
  });
});

describe('cycleSelection (click-cycling through a stack)', () => {
  const stack = [
    { id: 'a', col: 1, row: 1 },
    { id: 'b', col: 1, row: 1 },
    { id: 'c', col: 1, row: 1 },
  ] as Token[]; // a bottom, c top

  it('first click (nothing selected here) picks the topmost', () => {
    expect(cycleSelection(stack, undefined)?.id).toBe('c');
    expect(cycleSelection(stack, 'z')?.id).toBe('c'); // selection not in this stack
  });

  it('repeat clicks step down and wrap back to the top', () => {
    expect(cycleSelection(stack, 'c')?.id).toBe('b');
    expect(cycleSelection(stack, 'b')?.id).toBe('a');
    expect(cycleSelection(stack, 'a')?.id).toBe('c'); // wrap
  });

  it('returns undefined for an empty cell', () => {
    expect(cycleSelection([], 'a')).toBeUndefined();
  });
});

describe('firstFreeCell (creature placement)', () => {
  it('keeps the start cell when it is free', () => {
    expect(firstFreeCell(new Set(), 2, 2, 5, 5)).toEqual({ col: 2, row: 2 });
  });

  it('finds the nearest free cell when the start is taken', () => {
    const occupied = new Set(['2,2']);
    const cell = firstFreeCell(occupied, 2, 2, 5, 5);
    expect(occupied.has(`${cell.col},${cell.row}`)).toBe(false);
    expect(gridDistanceSquares(2, 2, cell.col, cell.row)).toBe(1); // adjacent ring
  });

  it('searches outward past a full inner ring', () => {
    // centre + all 8 neighbours occupied → must land two rings out.
    const occupied = new Set<string>();
    for (let c = 1; c <= 3; c++) for (let r = 1; r <= 3; r++) occupied.add(`${c},${r}`);
    const cell = firstFreeCell(occupied, 2, 2, 7, 7);
    expect(occupied.has(`${cell.col},${cell.row}`)).toBe(false);
    expect(gridDistanceSquares(2, 2, cell.col, cell.row)).toBe(2);
  });

  it('falls back to the start cell when the whole board is full', () => {
    const occupied = new Set<string>();
    for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) occupied.add(`${c},${r}`);
    expect(firstFreeCell(occupied, 1, 1, 3, 3)).toEqual({ col: 1, row: 1 });
  });
});

describe('gridDistanceSquares (Chebyshev — for the measure tool)', () => {
  it.each([
    [0, 0, 3, 2, 3],
    [1, 1, 1, 5, 4],
    [0, 0, 0, 0, 0],
    [2, 2, 5, 8, 6],
  ])('(%i,%i)→(%i,%i) = %i squares', (sc, sr, ec, er, expected) => {
    expect(gridDistanceSquares(sc, sr, ec, er)).toBe(expected);
  });
});

describe('clampCell', () => {
  it('keeps a cell within bounds', () => {
    expect(clampCell(-1, 5, 4, 4)).toEqual({ col: 0, row: 3 });
    expect(clampCell(2, 2, 4, 4)).toEqual({ col: 2, row: 2 });
  });
});
