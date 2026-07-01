import { describe, it, expect } from 'vitest';
import type { Character } from '../../../data/types';
import { dnd5eSystem } from '../index';
import { effectiveScores, pcDerived } from '../character';

// A standard-array Human Fighter: STR15 DEX13 CON14 INT10 WIS12 CHA8 (+1 all from Human).
const ASSIGNED = { STR: 15, DEX: 13, CON: 14, INT: 10, WIS: 12, CHA: 8 };

function humanFighter(): Character {
  const human = dnd5eSystem.ancestries.find((a) => a.id === 'human');
  const scores = effectiveScores(ASSIGNED, human);
  return {
    id: 'pc',
    gameId: 'g',
    ownerUserId: 'u',
    systemId: 'dnd5e',
    name: 'Aria',
    buildComplete: true,
    definition: { ancestryId: 'human', classId: 'fighter', coreScores: scores, chosenSkillIds: ['athletics'], knownSpellIds: [] },
    play: { level: 1, reputation: 'Unaligned', pools: { hp: { current: 12 } }, skills: {}, equippedWeaponIds: ['longsword'], equippedArmorId: 'chain-mail' },
  };
}

describe('5e Human Fighter (level 1) derivation', () => {
  it('Human applies +1 to all six abilities', () => {
    const scores = effectiveScores(ASSIGNED, dnd5eSystem.ancestries[0]);
    expect(scores).toEqual({ STR: 16, DEX: 14, CON: 15, INT: 11, WIS: 13, CHA: 9 });
  });

  const d = pcDerived(dnd5eSystem, humanFighter());

  it('ability modifiers', () => {
    expect(d.mods).toMatchObject({ STR: 3, DEX: 2, CON: 2, INT: 0, WIS: 1, CHA: -1 });
  });

  it('AC 16 from chain mail (heavy, no Dex)', () => {
    expect(d.ac).toBe(16);
  });

  it('HP 12 at level 1 (d10 max + CON +2)', () => {
    expect(d.maxHp).toBe(12);
  });

  it('proficiency bonus +2', () => {
    expect(d.proficiencyBonus).toBe(2);
  });

  it('saves: STR/CON proficient (+prof), others bare ability mod', () => {
    const byId = Object.fromEntries(d.saves.map((s) => [s.id, s]));
    expect(byId.STR).toMatchObject({ mod: 5, proficient: true }); // 3 + 2
    expect(byId.CON).toMatchObject({ mod: 4, proficient: true }); // 2 + 2
    expect(byId.DEX).toMatchObject({ mod: 2, proficient: false }); // bare
  });

  it('Longsword attack: STR mod + proficiency to hit, +STR damage', () => {
    const ls = d.attacks.find((a) => a.name === 'Longsword');
    expect(ls).toMatchObject({ attackBonus: 5, dice: '1d8+3', damageType: 'Slashing' });
  });

  it('chosen skill: ability mod + proficiency (Athletics = STR)', () => {
    const ath = d.skills.find((s) => s.id === 'athletics');
    expect(ath?.mod).toBe(5); // STR 3 + prof 2
  });
});
