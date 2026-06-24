import { describe, it, expect } from 'vitest';
import type { Combatant } from '../types';
import { sortOrder } from '../combat';

const c = (
  id: string,
  kind: 'character' | 'creature',
  initiative: number,
  tieBreak = 0,
): Combatant => ({ id, name: id, kind, initiative, tieBreak });

describe('sortOrder', () => {
  it('orders highest initiative first', () => {
    const order = sortOrder([c('a', 'creature', 10), c('b', 'character', 20)]);
    expect(order.map((o) => o.id)).toEqual(['b', 'a']);
  });

  it('players win ties versus monsters', () => {
    const order = sortOrder([c('goblin', 'creature', 15), c('hero', 'character', 15)]);
    expect(order[0].id).toBe('hero');
  });

  it('breaks remaining ties by tieBreak (modifier)', () => {
    const order = sortOrder([c('a', 'character', 12, 1), c('b', 'character', 12, 3)]);
    expect(order[0].id).toBe('b');
  });
});
