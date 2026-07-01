import { describe, it, expect } from 'vitest';
import {
  armorClass,
  asiCount,
  asiLevels,
  attackBonus,
  cumulativeFeatures,
  maxHitPoints,
  proficiencyBonus,
  saveModifier,
} from '../classProgression';
import { fighter } from '../../../systems/dnd5e/classes/fighter';

describe('class progression — Fighter (proof the shapes hold)', () => {
  it('proficiency bonus by level', () => {
    expect(proficiencyBonus(fighter, 1)).toBe(2);
    expect(proficiencyBonus(fighter, 4)).toBe(2);
    expect(proficiencyBonus(fighter, 5)).toBe(3);
    expect(proficiencyBonus(fighter, 9)).toBe(4);
    expect(proficiencyBonus(fighter, 13)).toBe(5);
    expect(proficiencyBonus(fighter, 17)).toBe(6);
    expect(proficiencyBonus(fighter, 20)).toBe(6);
  });

  it('Extra Attack at level 5 (cumulative features)', () => {
    expect(cumulativeFeatures(fighter, 4)).not.toContain('Extra Attack');
    expect(cumulativeFeatures(fighter, 5)).toContain('Extra Attack');
    expect(cumulativeFeatures(fighter, 1)).toEqual(['Fighting Style', 'Second Wind']);
  });

  it('Fighter ASIs at 4/6/8/12/14/16/19 (incl. the distinctive 6 & 14)', () => {
    expect(asiLevels(fighter)).toEqual([4, 6, 8, 12, 14, 16, 19]);
    expect(asiCount(fighter, 3)).toBe(0);
    expect(asiCount(fighter, 6)).toBe(2); // 4 and 6
    expect(asiCount(fighter, 8)).toBe(3);
    expect(asiCount(fighter, 20)).toBe(7);
  });

  it('max HP from hit die + CON (fixed-average)', () => {
    // d10, CON +2: L1 = 10+2 = 12; each later level = (6+2)=8 → L5 = 12 + 4*8 = 44
    expect(maxHitPoints(fighter, 1, 2)).toBe(12);
    expect(maxHitPoints(fighter, 5, 2)).toBe(44);
    expect(maxHitPoints(fighter, 1, 0)).toBe(10);
  });

  it('save modifiers: proficient saves add the proficiency bonus', () => {
    // Fighter is proficient in STR & CON saves.
    expect(saveModifier(fighter, 'CON', 3, 2)).toBe(5); // proficient: 3 + 2
    expect(saveModifier(fighter, 'STR', 1, 2)).toBe(3);
    expect(saveModifier(fighter, 'DEX', 1, 2)).toBe(1); // not proficient: just the mod
  });

  it('attack bonus = ability mod + proficiency (feeds attackRollVsAc)', () => {
    expect(attackBonus(3, 2)).toBe(5);
    expect(attackBonus(3, 2, false)).toBe(3); // non-proficient weapon
  });

  it('armor class: unarmored and capped-dex armor (feeds targetAc)', () => {
    expect(armorClass(2)).toBe(12); // 10 + Dex 2
    expect(armorClass(4, { baseAc: 14, maxDexBonus: 2 })).toBe(16); // medium armor caps Dex at +2
    expect(armorClass(3, { baseAc: 18, maxDexBonus: 0 })).toBe(18); // plate ignores Dex
    expect(armorClass(3, { baseAc: 11 })).toBe(14); // light armor, uncapped Dex
  });

  it('full 1–20 table is present and well-formed', () => {
    expect(fighter.levels).toHaveLength(20);
    expect(fighter.levels.map((l) => l.level)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });
});
