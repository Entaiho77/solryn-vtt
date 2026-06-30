import { describe, it, expect } from 'vitest';
import type { SystemDefinition } from '../../schema';
import { describeRoll, getCombatResolver } from '../combat';
import { rollDice, type Rng } from '../dice';

/** Deterministic RNG cycling through provided [0,1) values. */
const seqRng = (vals: number[]): Rng => {
  let i = 0;
  return () => vals[i++ % vals.length];
};
/** An rng value that makes `rollDie(sides)` land on a specific face. */
const face = (f: number, sides: number) => (f - 0.5) / sides;

const solrynLike = {
  modes: { combat: { id: 'auto-hit-vs-dr' } },
} as unknown as SystemDefinition;

describe('getCombatResolver', () => {
  it('selects auto-hit-vs-dr for Solryn-like systems', () => {
    expect(getCombatResolver(solrynLike)).toBeDefined();
  });

  it('throws for an unmapped combat mode', () => {
    const bad = { modes: { combat: { id: 'attack-roll-vs-ac' } } } as unknown as SystemDefinition;
    expect(() => getCombatResolver(bad)).toThrow(/No combat resolver/);
  });
});

describe('autoHitVsDr — identical Solryn log lines', () => {
  const resolver = getCombatResolver(solrynLike);

  it('weapon with skill bonus (no type)', () => {
    const res = resolver.resolveAttack({
      label: 'Shortsword',
      dice: '1d6',
      bonus: 2,
      rng: seqRng([face(4, 6)]),
    });
    expect(res.logText).toBe('Shortsword: rolled 4 +2 = 6 damage');
    expect(res.damage).toBe(6);
    expect(res.hit).toBeUndefined(); // auto-hit → no hit/miss
  });

  it('multi-die weapon, no bonus', () => {
    const res = resolver.resolveAttack({
      label: 'Greatsword',
      dice: '2d6',
      rng: seqRng([face(3, 6), face(5, 6)]),
    });
    expect(res.logText).toBe('Greatsword: rolled 3+5 = 8 damage');
  });

  it('spell damage roll with a type (suffix added by caller)', () => {
    const res = resolver.resolveAttack({
      label: 'Ember Strike',
      dice: '1d4',
      damageType: 'Fire',
      rng: seqRng([face(3, 4)]),
    });
    expect(res.logText).toBe('Ember Strike: rolled 3 = 3 Fire damage');
  });

  it('monster attack: name-prefixed label, dice modifier + type', () => {
    const res = resolver.resolveAttack({
      label: 'Goblin — Scimitar',
      dice: '1d6+2',
      damageType: 'Slashing',
      rng: seqRng([face(4, 6)]),
    });
    expect(res.logText).toBe('Goblin — Scimitar: rolled 4 +2 = 6 Slashing damage');
    expect(res.modifier).toBe(2);
    expect(res.damage).toBe(6);
  });

  it('monster ability: no type, no bonus', () => {
    const res = resolver.resolveAttack({
      label: 'Goblin — Pack Tactics',
      dice: '2d6',
      rng: seqRng([face(3, 6), face(5, 6)]),
    });
    expect(res.logText).toBe('Goblin — Pack Tactics: rolled 3+5 = 8 damage');
  });

  it('logText matches a direct describeRoll over the same roll', () => {
    const expected = describeRoll('Shortsword', rollDice('1d6', seqRng([face(4, 6)])), { bonus: 2 });
    const res = resolver.resolveAttack({ label: 'Shortsword', dice: '1d6', bonus: 2, rng: seqRng([face(4, 6)]) });
    expect(res.logText).toBe(expected);
  });
});
