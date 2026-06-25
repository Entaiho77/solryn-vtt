import { describe, it, expect } from 'vitest';
import { solrynSystem } from '../../../systems/solryn';
import {
  ancestryChoicesComplete,
  buildStepPlan,
  canAdvanceStep,
  chosenInCategory,
  createInitialDraft,
  createReducer,
  effectiveScores,
  finalizeCharacter,
  spellAccess,
  type BuilderDraft,
} from '../builderModel';

const reducer = createReducer(solrynSystem);

/** All seven stats rolled; ARC controls caster-ness. */
function rolledDraft(arc: number): BuilderDraft {
  return {
    ...createInitialDraft(),
    coreScores: { STR: 6, NIM: 6, END: 6, WIS: 3, INT: 6, ARC: arc, LCK: 3 },
  };
}

describe('buildStepPlan (data-driven, not hardcoded to 13)', () => {
  it('non-caster gets no spell step', () => {
    const plan = buildStepPlan(solrynSystem, rolledDraft(2)); // ARC mod 0
    expect(plan.some((s) => s.kind === 'spells')).toBe(false);
    // roll + race + 7 derived + skills + reputation + gear = 12
    expect(plan).toHaveLength(12);
  });

  it('caster gets the spell step (13 total)', () => {
    const plan = buildStepPlan(solrynSystem, rolledDraft(6)); // ARC mod 2 → 4 known
    expect(plan.some((s) => s.kind === 'spells')).toBe(true);
    expect(plan).toHaveLength(13);
  });

  it('emits one derived step per system derived stat, in order', () => {
    const derived = buildStepPlan(solrynSystem, rolledDraft(6))
      .filter((s) => s.kind === 'derived')
      .map((s) => s.derivedId);
    expect(derived).toEqual(solrynSystem.derivedStats.map((d) => d.id));
  });
});

describe('effectiveScores applies ancestry bonuses', () => {
  it('Dwarf: +2 STR and a chosen +1', () => {
    let draft = rolledDraft(3);
    draft = reducer(draft, { type: 'chooseAncestry', ancestryId: 'dwarf' });
    // bonus 0 = fixed +2 STR; bonus 1 = choice +1 (pick END)
    draft = reducer(draft, { type: 'setChoiceSelection', bonusIndex: 1, statIds: ['END'] });
    const scores = effectiveScores(solrynSystem, draft);
    expect(scores.STR).toBe(8); // 6 + 2
    expect(scores.END).toBe(7); // 6 + 1
  });
});

describe('spellAccess', () => {
  it('non-caster has no access; caster knows (Arcana mod × 2) + level', () => {
    expect(spellAccess(solrynSystem, rolledDraft(2)).isCaster).toBe(false);
    // ARC 6 → mod 2 → (2×2) + level 1 = 5
    expect(spellAccess(solrynSystem, rolledDraft(6)).knownCount).toBe(5);
  });

  it('Elf gains access even at Arcana mod 0', () => {
    let draft = rolledDraft(2);
    draft = reducer(draft, { type: 'chooseAncestry', ancestryId: 'elf' });
    const access = spellAccess(solrynSystem, draft);
    expect(access.ancestryBonus).toBe(3);
    expect(access.isCaster).toBe(true);
  });
});

describe('reducer', () => {
  it('locks a rolled stat (no reroll)', () => {
    let draft = createInitialDraft();
    draft = reducer(draft, { type: 'rollStat', statId: 'STR', value: 5 });
    draft = reducer(draft, { type: 'rollStat', statId: 'STR', value: 8 });
    expect(draft.coreScores.STR).toBe(5);
  });

  it('enforces the per-category skill limit (no doubling)', () => {
    let draft = rolledDraft(3);
    // base category allows 3
    for (const id of ['athletics', 'stealth', 'perception', 'insight']) {
      draft = reducer(draft, { type: 'toggleSkill', skillId: id });
    }
    expect(chosenInCategory(solrynSystem, draft, 'base')).toHaveLength(3);
  });

  it('toggles a skill off', () => {
    let draft = rolledDraft(3);
    draft = reducer(draft, { type: 'toggleSkill', skillId: 'athletics' });
    draft = reducer(draft, { type: 'toggleSkill', skillId: 'athletics' });
    expect(draft.chosenSkillIds).not.toContain('athletics');
  });

  it('caps known spells at the access limit', () => {
    let draft = rolledDraft(6); // knownCount = 5
    for (const id of ['s1', 's2', 's3', 's4', 's5', 's6']) {
      draft = reducer(draft, { type: 'toggleSpell', spellId: id });
    }
    expect(draft.knownSpellIds).toHaveLength(5);
  });
});

describe('canAdvanceStep gating', () => {
  const plan = buildStepPlan(solrynSystem, rolledDraft(6));
  const step = (kind: string) => plan.find((s) => s.kind === kind)!;

  it('roll step needs all seven stats', () => {
    const partial = { ...createInitialDraft(), coreScores: { STR: 6 } };
    expect(canAdvanceStep(solrynSystem, partial, step('roll'), 0)).toBe(false);
    expect(canAdvanceStep(solrynSystem, rolledDraft(6), step('roll'), 0)).toBe(true);
  });

  it('skills sub-page needs exactly N selected', () => {
    let draft = rolledDraft(6);
    draft = reducer(draft, { type: 'toggleSkill', skillId: 'athletics' });
    expect(canAdvanceStep(solrynSystem, draft, step('skills'), 0)).toBe(false);
    draft = reducer(draft, { type: 'toggleSkill', skillId: 'stealth' });
    draft = reducer(draft, { type: 'toggleSkill', skillId: 'perception' });
    expect(canAdvanceStep(solrynSystem, draft, step('skills'), 0)).toBe(true);
  });

  it('gear step needs name, armor, and weapon', () => {
    let draft = rolledDraft(6);
    draft = reducer(draft, { type: 'toggleSkill', skillId: 'light-swords' });
    draft = reducer(draft, { type: 'setName', name: 'Kael' });
    draft = reducer(draft, { type: 'setArmor', armorId: 'leather' });
    expect(canAdvanceStep(solrynSystem, draft, step('gear'), 0)).toBe(false);
    draft = reducer(draft, { type: 'setWeapon', weaponId: 'shortsword' });
    expect(canAdvanceStep(solrynSystem, draft, step('gear'), 0)).toBe(true);
  });

  it('Human flexible bonus must be fully assigned', () => {
    let draft = rolledDraft(3);
    draft = reducer(draft, { type: 'chooseAncestry', ancestryId: 'human' });
    expect(ancestryChoicesComplete(solrynSystem, draft)).toBe(false);
    draft = reducer(draft, { type: 'setChoiceSelection', bonusIndex: 0, statIds: ['STR', 'WIS'] });
    expect(ancestryChoicesComplete(solrynSystem, draft)).toBe(true);
  });
});

describe('finalizeCharacter', () => {
  it('produces a play-ready character with full pools and trained skills', () => {
    let draft = rolledDraft(6);
    draft = reducer(draft, { type: 'chooseAncestry', ancestryId: 'gnome' });
    draft = reducer(draft, { type: 'toggleSkill', skillId: 'athletics' });
    draft = reducer(draft, { type: 'toggleSkill', skillId: 'light-swords' });
    draft = reducer(draft, { type: 'setName', name: 'Kael' });
    draft = reducer(draft, { type: 'setArmor', armorId: 'leather' });
    draft = reducer(draft, { type: 'setWeapon', weaponId: 'shortsword' });

    const char = finalizeCharacter(solrynSystem, draft, {
      gameId: 'g1',
      ownerUserId: 'u1',
    });

    expect(char.buildComplete).toBe(true);
    expect(char.name).toBe('Kael');
    // Gnome: +1 Nimbleness, +1 Wisdom on top of rolled (WIS 3 + 1 = 4)
    expect(char.definition.coreScores.WIS).toBe(4);
    // HP pool present and full (END 6 + mod 2 = 8)
    expect(char.play.pools.hp.current).toBe(8);
    // Chosen skills start trained at Novice
    expect(char.play.skills.athletics).toEqual({ investedPoints: 1, realizedPoints: 1 });
    expect(char.play.equippedArmorId).toBe('leather');
    expect(char.play.equippedWeaponIds).toEqual(['shortsword']);
  });

  it('omits undefined optional fields (RTDB-safe)', () => {
    let draft = rolledDraft(2); // non-caster → no loadedSpellId
    draft = reducer(draft, { type: 'setName', name: 'Bo' });
    draft = reducer(draft, { type: 'setWeapon', weaponId: 'longsword' });
    const char = finalizeCharacter(solrynSystem, draft, { gameId: 'g', ownerUserId: 'u' });
    expect('loadedSpellId' in char.play).toBe(false);
    expect('equippedArmorId' in char.play).toBe(false);
  });
});
