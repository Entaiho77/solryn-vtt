import { describe, it, expect } from 'vitest';
import type { Character } from '../../../data/types';
import { dnd5eSystem } from '../index';
import { pcDerived } from '../character';
import { feats, featById, meetsFeatPrerequisite } from '../feats';
import { levelUpSummary, computeLevelUp } from '../levelUp';

function pc(
  classId: string,
  level: number,
  play: Partial<Character['play']> = {},
  scores: Record<string, number> = { STR: 16, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 10 },
): Character {
  return {
    id: 'pc', gameId: 'g', ownerUserId: 'u', systemId: 'dnd5e', name: 'X', buildComplete: true,
    definition: { ancestryId: 'human', classId, coreScores: scores, chosenSkillIds: [], knownSpellIds: [] },
    play: { level, reputation: 'Unaligned', pools: {}, skills: {}, equippedWeaponIds: ['greatsword'], equippedArmorId: 'chain-mail', ...play },
  };
}

describe('feats data + lookup', () => {
  it('exposes the full 2014 feat list, wired into the system', () => {
    expect(feats.length).toBeGreaterThanOrEqual(40);
    expect(dnd5eSystem.feats).toBe(feats);
    // ids are unique
    expect(new Set(feats.map((f) => f.id)).size).toBe(feats.length);
  });

  it('featById resolves a known feat and returns undefined otherwise', () => {
    expect(featById('lucky')?.name).toBe('Lucky');
    expect(featById('not-a-feat')).toBeUndefined();
  });
});

describe('meetsFeatPrerequisite', () => {
  const casterScores = { STR: 8, DEX: 20, CON: 10, INT: 10, WIS: 10, CHA: 10 };

  it('feats with no requirement are always eligible', () => {
    expect(meetsFeatPrerequisite(featById('tough')!, casterScores, false)).toBe(true);
  });

  it('ability minimums are enforced', () => {
    const grappler = featById('grappler')!; // needs STR 13
    expect(meetsFeatPrerequisite(grappler, { ...casterScores, STR: 12 }, false)).toBe(false);
    expect(meetsFeatPrerequisite(grappler, { ...casterScores, STR: 13 }, false)).toBe(true);
  });

  it('spellcasting requirement needs a caster', () => {
    const warCaster = featById('war-caster')!;
    expect(meetsFeatPrerequisite(warCaster, casterScores, false)).toBe(false);
    expect(meetsFeatPrerequisite(warCaster, casterScores, true)).toBe(true);
  });
});

describe('pcDerived folds feat effects', () => {
  it('fixed half-feat ability bonus raises the score and modifier', () => {
    const base = pcDerived(dnd5eSystem, pc('fighter', 4));
    const d = pcDerived(dnd5eSystem, pc('fighter', 4, { featIds: ['durable'] }));
    expect(d.scores.CON).toBe(base.scores.CON + 1); // Durable = +1 CON
  });

  it('flexible abilityChoice applies the stored choice', () => {
    const d = pcDerived(dnd5eSystem, pc('fighter', 4, { featIds: ['resilient'], featChoices: { resilient: 'DEX' } }));
    expect(d.scores.DEX).toBe(13); // 12 base + 1
  });

  it('Tough adds 2 HP per level; GWM exposes a power-attack toggle', () => {
    const base = pcDerived(dnd5eSystem, pc('fighter', 5));
    const tough = pcDerived(dnd5eSystem, pc('fighter', 5, { featIds: ['tough'] }));
    expect(tough.maxHp).toBe(base.maxHp + 2 * 5);
    const gwm = pcDerived(dnd5eSystem, pc('fighter', 5, { featIds: ['great-weapon-master'] }));
    expect(gwm.powerAttack).toEqual({ toHit: -5, damage: 10 });
  });

  it('Mobile adds speed; Lucky exposes a resource pool defaulting to full', () => {
    const mob = pcDerived(dnd5eSystem, pc('fighter', 3, { featIds: ['mobile'] }));
    expect(mob.speed).toBe(40); // human 30 + 10
    const lucky = pcDerived(dnd5eSystem, pc('fighter', 3, { featIds: ['lucky'] }));
    expect(lucky.featResources).toEqual([{ id: 'luck', name: 'Luck points', max: 3, current: 3 }]);
    const spent = pcDerived(dnd5eSystem, pc('fighter', 3, { featIds: ['lucky'], featResources: { luck: 1 } }));
    expect(spent.featResources[0].current).toBe(1);
  });
});

describe('computeLevelUp — feat instead of ASI', () => {
  it('appends the feat and its ability choice, leaving core scores untouched', () => {
    const c = pc('fighter', 3); // L3 → L4 is an ASI level for Fighter
    const summary = levelUpSummary(dnd5eSystem, c);
    expect(summary.isAsi).toBe(true);
    const result = computeLevelUp(dnd5eSystem, c, summary, {
      asi: {}, newCantripIds: [], newSpellIds: [], featId: 'resilient', featAbility: 'CON',
    });
    expect(result.featIds).toEqual(['resilient']);
    expect(result.featChoices).toEqual({ resilient: 'CON' });
    // The ASI path is NOT applied — coreScores are unchanged from the definition.
    expect(result.coreScores).toEqual(c.definition.coreScores);
  });

  it('dedupes against already-owned feats', () => {
    const c = pc('fighter', 3, { featIds: ['tough'] });
    const summary = levelUpSummary(dnd5eSystem, c);
    const result = computeLevelUp(dnd5eSystem, c, summary, {
      asi: {}, newCantripIds: [], newSpellIds: [], featId: 'lucky',
    });
    expect(result.featIds).toEqual(['tough', 'lucky']);
  });
});
