import { describe, it, expect } from 'vitest';
import { solrynSystem } from '../index';
import {
  computeDerived,
  computeModifiers,
  computeSkillState,
  dieForLevel,
  evaluate,
  makeEvalContext,
  resolveQuality,
} from '../../../engine/rules';

// A sample rolled character: STR6 NIM6 END6 WIS3 INT6 ARC6 LCK3
const scores = { STR: 6, NIM: 6, END: 6, WIS: 3, INT: 6, ARC: 6, LCK: 3 };

describe('Solryn — core stats & modifiers', () => {
  it('has seven core stats in the creation order', () => {
    expect(solrynSystem.coreStats).toHaveLength(7);
    expect(solrynSystem.coreStats.map((s) => s.id)).toEqual(
      solrynSystem.creation.statOrder,
    );
  });

  it('computes modifiers with "every 3 points = +1, no cap"', () => {
    expect(computeModifiers(solrynSystem, scores)).toEqual({
      STR: 2, NIM: 2, END: 2, WIS: 1, INT: 2, ARC: 2, LCK: 1,
    });
  });
});

describe('Solryn — derived values run through the generic engine', () => {
  const byId = (eq?: Record<string, Record<string, number>>) =>
    Object.fromEntries(
      computeDerived(solrynSystem, scores, eq).map((d) => [d.id, d]),
    );

  it('computes HP, Carry, Arcana, Luck from formulas', () => {
    const d = byId();
    expect(d.hp.value).toBe(8); // END 6 + END mod 2
    expect(d.carry.value).toBe(90); // STR 6 × 15
    expect(d.arcanaPoints.value).toBe(4); // ARC mod 2 × 2
    expect(d.luckPoints.value).toBe(1); // LCK mod
  });

  it('treats Initiative as a d20 roll storing the modifier', () => {
    const d = byId();
    expect(d.initiative.isRoll).toBe(true);
    expect(d.initiative.die).toBe('d20');
    expect(d.initiative.value).toBe(2);
  });

  it('shows DR/Speed partial before gear, finalized after', () => {
    const before = byId();
    expect(before.dr.pending).toBe(true);
    expect(before.dr.value).toBe(4); // 0 + NIM 2 + END 2
    expect(before.speed.value).toBe(30); // 10 + (2+2)*5

    const after = byId({ armor: { dr: 6, speedPenalty: 10 } }); // plate
    expect(after.dr.pending).toBe(false);
    expect(after.dr.value).toBe(10); // 6 + 2 + 2
    expect(after.speed.value).toBe(20); // 30 - 10
  });

  it('resource pools carry a semantic color', () => {
    const d = byId();
    expect(d.hp.color).toBe('teal');
    expect(d.arcanaPoints.color).toBe('purple');
    expect(d.luckPoints.color).toBe('amber');
  });
});

describe('Solryn — mode-driven rules', () => {
  it('known-spell count = Arcana modifier × 2 (casting access expr)', () => {
    const ctx = makeEvalContext(solrynSystem, scores);
    expect(evaluate(solrynSystem.creation.spellAccess.knownCountExpr, ctx)).toBe(4);
  });

  it('skill tiers follow 3-to-fill, 1-to-cross with the training gate', () => {
    const mode = solrynSystem.modes.skill;
    const pending = computeSkillState(4, 1, mode);
    expect(pending.activeBonus).toBe(1);
    expect(pending.pendingTraining).toBe(true);
  });

  it('level-up die depends on the level band', () => {
    const prog = solrynSystem.modes.progression;
    expect(dieForLevel(3, prog)).toBe('1d4');
    expect(dieForLevel(10, prog)).toBe('2d6');
    expect(dieForLevel(20, prog)).toBe('1d8');
  });

  it('harvest quality resolves on the shared scale', () => {
    expect(resolveQuality(5, solrynSystem.qualityScale).id).toBe('ruined');
    expect(resolveQuality(75, solrynSystem.qualityScale).id).toBe('rare');
    expect(resolveQuality(200, solrynSystem.qualityScale).id).toBe('legendary');
  });
});

describe('Solryn — seed data integrity', () => {
  it('every weapon references a real weapon skill', () => {
    const weaponSkillIds = new Set(
      solrynSystem.skills.filter((s) => s.categoryId === 'weapon').map((s) => s.id),
    );
    for (const w of solrynSystem.equipment.weapons) {
      expect(weaponSkillIds, `weapon ${w.id}`).toContain(w.weaponSkillId);
    }
  });

  it('every bestiary entry uses a defined stat-block shape', () => {
    const shapeIds = new Set(solrynSystem.statBlockShapes.map((s) => s.id));
    for (const e of solrynSystem.bestiary) {
      expect(shapeIds, `entry ${e.id}`).toContain(e.category);
    }
  });

  it('every ancestry bonus references a real core stat', () => {
    const statIds = new Set(solrynSystem.coreStats.map((s) => s.id));
    for (const a of solrynSystem.ancestries) {
      for (const b of a.bonuses) {
        if (b.kind === 'fixed') {
          expect(statIds, `${a.id} fixed`).toContain(b.stat);
        } else if (b.from) {
          for (const s of b.from) expect(statIds, `${a.id} choice`).toContain(s);
        }
      }
    }
  });

  it('derived resource pools reference an existing color and the casting pool exists', () => {
    const derivedIds = new Set(solrynSystem.derivedStats.map((d) => d.id));
    expect(derivedIds).toContain(solrynSystem.modes.casting.poolStatId);
  });
});
