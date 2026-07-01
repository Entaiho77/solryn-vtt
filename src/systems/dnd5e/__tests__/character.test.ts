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

function pc(classId: string, scores: Record<string, number>, weaponIds: string[], armorId?: string): Character {
  return {
    id: 'pc', gameId: 'g', ownerUserId: 'u', systemId: 'dnd5e', name: 'X', buildComplete: true,
    definition: { ancestryId: 'human', classId, coreScores: scores, chosenSkillIds: [], knownSpellIds: [] },
    play: { level: 1, reputation: 'Unaligned', pools: {}, skills: {}, equippedWeaponIds: weaponIds, ...(armorId ? { equippedArmorId: armorId } : {}) },
  };
}

describe('martial distinctions', () => {
  it('Barbarian Unarmored Defense: AC 10 + DEX + CON with no armor', () => {
    // DEX 14 (+2), CON 15 (+2) → 10 + 2 + 2 = 14; greataxe (STR) attack
    const d = pcDerived(dnd5eSystem, pc('barbarian', { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 10 }, ['greataxe']));
    expect(d.ac).toBe(14);
    expect(d.maxHp).toBe(14); // d12 + CON 2
    expect(d.attacks[0]).toMatchObject({ name: 'Greataxe', dice: '1d12+3', attackBonus: 5 });
  });

  it('Monk Unarmored Defense uses WIS', () => {
    const d = pcDerived(dnd5eSystem, pc('monk', { STR: 12, DEX: 16, CON: 12, INT: 10, WIS: 14, CHA: 10 }, ['quarterstaff']));
    expect(d.ac).toBe(10 + 3 + 2); // DEX +3, WIS +2 = 15
  });

  it('Rogue finesse: rapier uses DEX when higher, and exposes Sneak Attack dice', () => {
    // STR 10 (0), DEX 16 (+3) → finesse picks DEX; leather AC 11 + DEX 3 = 14
    const d = pcDerived(dnd5eSystem, pc('rogue', { STR: 10, DEX: 16, CON: 12, INT: 13, WIS: 10, CHA: 10 }, ['rapier', 'shortbow'], 'leather-armor'));
    expect(d.ac).toBe(14);
    const rapier = d.attacks.find((a) => a.name === 'Rapier');
    expect(rapier).toMatchObject({ dice: '1d8+3', attackBonus: 5 }); // DEX +3 + prof 2
    expect(d.sneakAttackDice).toBe('1d6');
  });

  it('Fighter regression: armored AC 16 and STR longsword unchanged', () => {
    const d = pcDerived(dnd5eSystem, pc('fighter', { STR: 16, DEX: 14, CON: 15, INT: 11, WIS: 13, CHA: 9 }, ['longsword'], 'chain-mail'));
    expect(d.ac).toBe(16);
    expect(d.attacks[0]).toMatchObject({ name: 'Longsword', dice: '1d8+3', attackBonus: 5 });
  });
});
