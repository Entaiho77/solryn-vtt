import type { SystemDefinition } from '../schema';
import type { CombatModeId } from '../schema';
import { rollDice, rollHighest, rollLowest, type RollResult, type Rng } from './dice';

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
  /** Flat add on top of the DAMAGE dice (Solryn weapon skill bonus). */
  bonus?: number;
  damageType?: string;
  /** d20 TO-HIT bonus (attack-roll-vs-ac only; ignored by auto-hit). */
  attackBonus?: number;
  /** Defender's Armor Class (attack-roll-vs-ac only; ignored by auto-hit). */
  targetAc?: number;
  /** Roll the d20 with advantage/disadvantage (attack-roll-vs-ac only). */
  advantage?: 'advantage' | 'disadvantage';
  /** Injectable RNG for deterministic tests. */
  rng?: Rng;
}

export interface AttackResolution {
  /** ABSENT for auto-hit (so the Solryn log line is unchanged); set by roll-to-hit modes. */
  hit?: boolean;
  /** The d20 to-hit total (incl. attackBonus) for roll-to-hit modes; absent for auto-hit. */
  attackRoll?: number;
  /** Damage dice faces (empty on a miss). */
  rolls: number[];
  modifier: number;
  /** Total damage including the flat bonus (0 on a miss). */
  damage: number;
  /** The exact log line. */
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

/** A signed term like "+4" / "-1" / "" (for 0). */
const sign = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `${n}` : '');

/** Roll a d20 face, honoring advantage/disadvantage. */
function rollD20Face(advantage: AttackInput['advantage'], rng?: Rng): number {
  if (advantage === 'advantage') return rollHighest('d20', 2, rng).best.total;
  if (advantage === 'disadvantage') return rollLowest('d20', 2, rng).worst.total;
  return rollDice('d20', rng).total;
}

/**
 * D&D 5e: roll d20 + attackBonus vs the target's AC. On a hit, roll damage; on a miss, no
 * damage. (Nat-20/nat-1 and crit damage are a deliberate follow-up — this is plain
 * total-vs-AC.) Solryn's autoHitVsDr is unaffected; the two resolvers are independent.
 */
const attackRollVsAc: CombatResolver = {
  resolveAttack({ label, dice, damageType, attackBonus = 0, targetAc = 10, advantage, rng }) {
    const face = rollD20Face(advantage, rng);
    const attackRoll = face + attackBonus;
    const advTag =
      advantage === 'advantage' ? ' (adv)' : advantage === 'disadvantage' ? ' (dis)' : '';
    const toHit = `1d20${sign(attackBonus)} = ${attackRoll}${advTag}`;
    const hit = attackRoll >= targetAc;

    if (!hit) {
      return {
        hit: false,
        attackRoll,
        rolls: [],
        modifier: 0,
        damage: 0,
        logText: `${label}: ${toHit} vs AC ${targetAc} — MISS`,
      };
    }
    const dmg = rollDice(dice, rng);
    const typeStr = damageType ? ` ${damageType}` : '';
    return {
      hit: true,
      attackRoll,
      rolls: dmg.rolls,
      modifier: dmg.modifier,
      damage: dmg.total,
      logText: `${label}: ${toHit} vs AC ${targetAc} — HIT, ${dmg.total}${typeStr} damage`,
    };
  },
};

const resolvers: Partial<Record<CombatModeId, CombatResolver>> = {
  'auto-hit-vs-dr': autoHitVsDr,
  'attack-roll-vs-ac': attackRollVsAc,
};

/** The combat resolver a system uses, selected by `modes.combat.id`. */
export function getCombatResolver(system: SystemDefinition): CombatResolver {
  const resolver = resolvers[system.modes.combat.id];
  if (!resolver) {
    throw new Error(`No combat resolver for mode: ${system.modes.combat.id}`);
  }
  return resolver;
}
