import type {
  Ancestry,
  SystemDefinition,
  WeaponItem,
} from '../../engine/schema';
import {
  computeDerived,
  evaluate,
  makeEvalContext,
} from '../../engine/rules';
import type { Character, CharacterSkillState } from '../../data/types';

/**
 * Builder model — pure logic for the guided character creator (§4.5).
 *
 * The step PLAN is generated from the system definition, not hardcoded to "13": one
 * derived "show, don't ask" page per `derivedStats` entry, an ancestry step only if the
 * system has ancestries, a conditional spell step, etc. A different system produces a
 * different-length wizard automatically — the real proof of the data-driven architecture.
 */

export interface BuilderDraft {
  name: string;
  /** Rolled scores, locked as rolled (one-way gate; no rerolls). */
  coreScores: Record<string, number>;
  ancestryId?: string;
  /** Flexible-bonus selections: choice-bonus index → chosen stat ids. */
  choiceSelections: Record<number, string[]>;
  chosenSkillIds: string[];
  knownSpellIds: string[];
  equippedArmorId?: string;
  equippedWeaponId?: string;
  level: number;
}

export type BuilderAction =
  | { type: 'setName'; name: string }
  | { type: 'rollStat'; statId: string; value: number }
  | { type: 'chooseAncestry'; ancestryId: string }
  | { type: 'setChoiceSelection'; bonusIndex: number; statIds: string[] }
  | { type: 'toggleSkill'; skillId: string }
  | { type: 'toggleSpell'; spellId: string }
  | { type: 'setArmor'; armorId: string }
  | { type: 'setWeapon'; weaponId: string };

export function createInitialDraft(): BuilderDraft {
  return {
    name: '',
    coreScores: {},
    choiceSelections: {},
    chosenSkillIds: [],
    knownSpellIds: [],
    level: 1,
  };
}

// --- Derived helpers --------------------------------------------------------

export function findAncestry(
  system: SystemDefinition,
  draft: BuilderDraft,
): Ancestry | undefined {
  return system.ancestries.find((a) => a.id === draft.ancestryId);
}

/** Rolled scores plus ancestry bonuses (fixed + chosen) — the live, carried-forward stats. */
export function effectiveScores(
  system: SystemDefinition,
  draft: BuilderDraft,
): Record<string, number> {
  const scores: Record<string, number> = { ...draft.coreScores };
  const ancestry = findAncestry(system, draft);
  if (!ancestry) return scores;

  ancestry.bonuses.forEach((bonus, i) => {
    if (bonus.kind === 'fixed') {
      scores[bonus.stat] = (scores[bonus.stat] ?? 0) + bonus.amount;
    } else {
      for (const statId of draft.choiceSelections[i] ?? []) {
        scores[statId] = (scores[statId] ?? 0) + bonus.amount;
      }
    }
  });
  return scores;
}

/** Equipment field map for derived calc; undefined slot ⇒ DR/Speed show partial. */
export function equipmentContext(
  system: SystemDefinition,
  draft: BuilderDraft,
): Record<string, Record<string, number>> | undefined {
  if (!draft.equippedArmorId) return undefined;
  const armor = system.equipment.armor.find((a) => a.id === draft.equippedArmorId);
  if (!armor) return undefined;
  return { armor: { dr: armor.dr, speedPenalty: armor.speedPenalty } };
}

export interface SpellAccess {
  base: number;
  ancestryBonus: number;
  totalKnown: number;
  accessible: boolean;
}

/**
 * Whether the conditional spell step appears, and how many spells are known.
 * Known = knownCountExpr (Solryn: Arcana mod × 2) + ancestry bonus (Elf +3).
 * (The design doc's "+ level" wording would make the gate always true at level 1,
 * contradicting "non-casters skip"; we gate on known ≥ 1, the consistent intent.)
 */
export function spellAccess(
  system: SystemDefinition,
  draft: BuilderDraft,
): SpellAccess {
  const ctx = makeEvalContext(system, effectiveScores(system, draft));
  const base = Math.max(0, evaluate(system.creation.spellAccess.knownCountExpr, ctx));
  const granted =
    draft.ancestryId != null &&
    system.creation.spellAccess.grantedByAncestry.includes(draft.ancestryId);
  const ancestryBonus = granted ? system.creation.spellAccess.ancestryBonus : 0;
  const totalKnown = base + ancestryBonus;
  return { base, ancestryBonus, totalKnown, accessible: totalKnown >= 1 };
}

export function chosenInCategory(
  system: SystemDefinition,
  draft: BuilderDraft,
  categoryId: string,
): string[] {
  const inCat = new Set(
    system.skills.filter((s) => s.categoryId === categoryId).map((s) => s.id),
  );
  return draft.chosenSkillIds.filter((id) => inCat.has(id));
}

/** Weapons available at the gear step, filtered to the player's chosen weapon skills. */
export function allowedWeapons(
  system: SystemDefinition,
  draft: BuilderDraft,
): WeaponItem[] {
  const weaponSkillIds = new Set(chosenInCategory(system, draft, 'weapon'));
  return system.equipment.weapons.filter((w) => weaponSkillIds.has(w.weaponSkillId));
}

/** Is the chosen ancestry's flexible bonus fully and validly assigned? */
export function ancestryChoicesComplete(
  system: SystemDefinition,
  draft: BuilderDraft,
): boolean {
  const ancestry = findAncestry(system, draft);
  if (!ancestry) return false;
  return ancestry.bonuses.every((bonus, i) => {
    if (bonus.kind === 'fixed') return true;
    const picks = draft.choiceSelections[i] ?? [];
    if (picks.length !== bonus.count) return false;
    if (bonus.distinct !== false && new Set(picks).size !== picks.length) return false;
    if (bonus.from && !picks.every((p) => bonus.from!.includes(p))) return false;
    return true;
  });
}

// --- Step plan --------------------------------------------------------------

export type StepKind =
  | 'roll'
  | 'ancestry'
  | 'derived'
  | 'skills'
  | 'spells'
  | 'reputation'
  | 'gear';

export interface StepDescriptor {
  kind: StepKind;
  title: string;
  instruction: string;
  /** For 'derived' steps: which derived stat this page explains. */
  derivedId?: string;
}

export function buildStepPlan(
  system: SystemDefinition,
  draft: BuilderDraft,
): StepDescriptor[] {
  const steps: StepDescriptor[] = [];

  steps.push({
    kind: 'roll',
    title: 'Roll stats',
    instruction:
      'Roll each stat in order. Every roll locks the moment it lands — no rerolls, no rearranging.',
  });

  if (system.ancestries.length > 0) {
    steps.push({
      kind: 'ancestry',
      title: 'Choose race',
      instruction: 'Pick a race. Its bonuses apply to your rolled stats right away.',
    });
  }

  for (const ds of system.derivedStats) {
    steps.push({
      kind: 'derived',
      derivedId: ds.id,
      title: ds.name,
      instruction: `Here’s how your ${ds.name} is worked out — no input needed.`,
    });
  }

  if (system.skillCategories.length > 0) {
    steps.push({
      kind: 'skills',
      title: 'Skills',
      instruction: 'Choose your starting skills. Pick exactly the number shown.',
    });
  }

  if (spellAccess(system, draft).accessible) {
    steps.push({
      kind: 'spells',
      title: 'Spells',
      instruction: 'Choose the spells you know.',
    });
  }

  steps.push({
    kind: 'reputation',
    title: 'Reputation',
    instruction: `No choice here — everyone starts ${system.creation.startingReputation}.`,
  });

  steps.push({
    kind: 'gear',
    title: 'Starting gear',
    instruction: 'Pick armor and a weapon. This finalizes your DR and Speed.',
  });

  return steps;
}

/** Can the player advance from the given step? (`skillsSubIndex` only matters on skills.) */
export function canAdvanceStep(
  system: SystemDefinition,
  draft: BuilderDraft,
  step: StepDescriptor,
  skillsSubIndex: number,
): boolean {
  switch (step.kind) {
    case 'roll':
      return system.creation.statOrder.every(
        (id) => draft.coreScores[id] !== undefined,
      );
    case 'ancestry':
      return Boolean(draft.ancestryId) && ancestryChoicesComplete(system, draft);
    case 'skills': {
      const category = system.skillCategories[skillsSubIndex];
      if (!category) return false;
      return (
        chosenInCategory(system, draft, category.id).length ===
        category.chooseAtCreation
      );
    }
    case 'spells':
      return draft.knownSpellIds.length === spellAccess(system, draft).totalKnown;
    case 'gear':
      return (
        Boolean(draft.name.trim()) &&
        Boolean(draft.equippedArmorId) &&
        Boolean(draft.equippedWeaponId)
      );
    case 'derived':
    case 'reputation':
      return true;
  }
}

// --- Reducer ----------------------------------------------------------------

export function createReducer(system: SystemDefinition) {
  return function reducer(draft: BuilderDraft, action: BuilderAction): BuilderDraft {
    switch (action.type) {
      case 'setName':
        return { ...draft, name: action.name };

      case 'rollStat':
        // Lock on roll: never overwrite an already-rolled stat.
        if (draft.coreScores[action.statId] !== undefined) return draft;
        return {
          ...draft,
          coreScores: { ...draft.coreScores, [action.statId]: action.value },
        };

      case 'chooseAncestry':
        return { ...draft, ancestryId: action.ancestryId, choiceSelections: {} };

      case 'setChoiceSelection':
        return {
          ...draft,
          choiceSelections: {
            ...draft.choiceSelections,
            [action.bonusIndex]: action.statIds,
          },
        };

      case 'toggleSkill': {
        const skill = system.skills.find((s) => s.id === action.skillId);
        if (!skill) return draft;
        if (draft.chosenSkillIds.includes(action.skillId)) {
          return {
            ...draft,
            chosenSkillIds: draft.chosenSkillIds.filter((id) => id !== action.skillId),
          };
        }
        const category = system.skillCategories.find((c) => c.id === skill.categoryId);
        const limit = category?.chooseAtCreation ?? 0;
        if (chosenInCategory(system, draft, skill.categoryId).length >= limit) {
          return draft; // category full; no doubling
        }
        return { ...draft, chosenSkillIds: [...draft.chosenSkillIds, action.skillId] };
      }

      case 'toggleSpell': {
        if (draft.knownSpellIds.includes(action.spellId)) {
          return {
            ...draft,
            knownSpellIds: draft.knownSpellIds.filter((id) => id !== action.spellId),
          };
        }
        if (draft.knownSpellIds.length >= spellAccess(system, draft).totalKnown) {
          return draft;
        }
        return { ...draft, knownSpellIds: [...draft.knownSpellIds, action.spellId] };
      }

      case 'setArmor':
        return { ...draft, equippedArmorId: action.armorId };

      case 'setWeapon':
        return { ...draft, equippedWeaponId: action.weaponId };
    }
  };
}

// --- Finalize ---------------------------------------------------------------

/** Build the persisted Character (no id) from a completed draft. */
export function finalizeCharacter(
  system: SystemDefinition,
  draft: BuilderDraft,
  ids: { gameId: string; ownerUserId: string },
): Omit<Character, 'id'> {
  const scores = effectiveScores(system, draft);
  const derived = computeDerived(system, scores, equipmentContext(system, draft));

  const pools: Record<string, { current: number }> = {};
  for (const d of derived) {
    if (d.resourcePool) pools[d.id] = { current: d.value };
  }

  const skills: Record<string, CharacterSkillState> = {};
  for (const id of draft.chosenSkillIds) {
    skills[id] = { investedPoints: 1, realizedPoints: 1 };
  }

  // Choice bonuses recorded as stat → total amount (informational).
  const ancestryChoices: Record<string, number> = {};
  const ancestry = findAncestry(system, draft);
  ancestry?.bonuses.forEach((bonus, i) => {
    if (bonus.kind === 'choice') {
      for (const statId of draft.choiceSelections[i] ?? []) {
        ancestryChoices[statId] = (ancestryChoices[statId] ?? 0) + bonus.amount;
      }
    }
  });

  const loadedSpellId = draft.knownSpellIds.find(
    (id) => system.spells.find((s) => s.id === id)?.type === 'offensive',
  );

  return {
    gameId: ids.gameId,
    ownerUserId: ids.ownerUserId,
    systemId: system.id,
    name: draft.name.trim() || 'New Hero',
    buildComplete: true,
    definition: {
      ancestryId: draft.ancestryId ?? '',
      coreScores: scores,
      chosenSkillIds: draft.chosenSkillIds,
      knownSpellIds: draft.knownSpellIds,
      ...(Object.keys(ancestryChoices).length ? { ancestryChoices } : {}),
    },
    play: {
      level: draft.level,
      reputation: system.creation.startingReputation,
      pools,
      skills,
      equippedWeaponIds: draft.equippedWeaponId ? [draft.equippedWeaponId] : [],
      ...(draft.equippedArmorId ? { equippedArmorId: draft.equippedArmorId } : {}),
      ...(loadedSpellId ? { loadedSpellId } : {}),
    },
  };
}
