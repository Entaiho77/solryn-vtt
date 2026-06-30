import type { SystemDefinition } from '../schema';
import type { CombatModeId } from '../schema';
import { rollDice, type RollResult, type Rng } from './dice';

/**
 * The combat-resolution seam. Every attack flows through a system-selected `CombatResolver`
 * (chosen by `modes.combat.id`) instead of inlining the roll at the call site. Today only
 * Solryn's `auto-hit-vs-dr` exists, wrapping the prior behavior exactly; a future
 * `attack-roll-vs-ac` slots in here without touching the call sites.
 */

/**
 * Canonical damage-roll string — the format reused by weapon, spell, and monster rolls so
 * the log reads uniformly. (Moved here from the roll-log UI so the engine resolver can
 * produce it; `rollLog.tsx` re-exports it for back-compat. Pure — no UI deps.)
 */
export function describeRoll(
  label: string,
  r: RollResult,
  opts: { bonus?: number; type?: string } = {},
): string {
  const bonus = opts.bonus ?? 0;
  const total = r.total + bonus;
  const m = r.modifier + bonus;
  const mStr = m ? ` ${m >= 0 ? '+' : '-'}${Math.abs(m)}` : '';
  const type = opts.type ? `${opts.type} ` : '';
  return `${label}: rolled ${r.rolls.join('+')}${mStr} = ${total} ${type}damage`;
}

export interface AttackInput {
  /** Log label, fully built by the caller (e.g. "Goblin — Scimitar"). */
  label: string;
  /** Damage dice notation (e.g. "1d8+2"). */
  dice: string;
  /** Flat add applied on top of the dice (e.g. weapon skill bonus). */
  bonus?: number;
  damageType?: string;
  /** Reserved for `attack-roll-vs-ac` (AC / saves); unused by auto-hit. */
  attacker?: unknown;
  target?: unknown;
  /** Injectable RNG for deterministic tests. */
  rng?: Rng;
}

export interface AttackResolution {
  /** ABSENT for auto-hit (so the Solryn log line is unchanged); set by roll-to-hit modes. */
  hit?: boolean;
  rolls: number[];
  modifier: number;
  /** Total damage including the flat bonus. */
  damage: number;
  /** The exact log line (today identical to the prior `describeRoll` output). */
  logText: string;
}

export interface CombatResolver {
  resolveAttack(input: AttackInput): AttackResolution;
}

/** Solryn: attacks auto-hit; roll damage, no to-hit. Wraps the prior inline behavior. */
const autoHitVsDr: CombatResolver = {
  resolveAttack({ label, dice, bonus = 0, damageType, rng }) {
    const r = rollDice(dice, rng);
    const logText = describeRoll(label, r, { bonus, type: damageType });
    return { rolls: r.rolls, modifier: r.modifier, damage: r.total + bonus, logText };
  },
};

const resolvers: Partial<Record<CombatModeId, CombatResolver>> = {
  'auto-hit-vs-dr': autoHitVsDr,
};

/** The combat resolver a system uses, selected by `modes.combat.id`. */
export function getCombatResolver(system: SystemDefinition): CombatResolver {
  const resolver = resolvers[system.modes.combat.id];
  if (!resolver) {
    throw new Error(`No combat resolver for mode: ${system.modes.combat.id}`);
  }
  return resolver;
}
