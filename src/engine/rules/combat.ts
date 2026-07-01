import type { SystemDefinition } from '../schema';
import type { CombatModeId } from '../schema';
import { parseDice, rollDice, rollHighest, rollLowest, type RollResult, type Rng } from './dice';

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
  /** Extra damage dice added on a hit (e.g. Rogue Sneak Attack); doubled on a crit like the
   *  weapon dice. Rolled and shown separately. */
  bonusDamage?: { dice: string; label: string };
  /** Injectable RNG for deterministic tests. */
  rng?: Rng;
}

export interface AttackResolution {
  /** ABSENT for auto-hit (so the Solryn log line is unchanged); set by roll-to-hit modes. */
  hit?: boolean;
  /** True on a natural-20 critical hit (doubled damage dice). */
  crit?: boolean;
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

/** Crit damage: double the DICE (count ×2), add the flat modifier once (standard 5e). */
function rollCritDamage(dice: string, rng?: Rng): RollResult {
  const p = parseDice(dice);
  if (!p) return rollDice(dice, rng);
  const doubled = `${p.count * 2}d${p.sides}${p.modifier ? sign(p.modifier) : ''}`;
  return rollDice(doubled, rng);
}

/**
 * D&D 5e: roll d20 + attackBonus vs the target's AC. The RAW natural die (the kept die under
 * advantage/disadvantage) decides crits: natural 20 → auto-hit + doubled damage dice; natural
 * 1 → auto-miss. Otherwise total ≥ AC hits. Solryn's autoHitVsDr is unaffected.
 */
const attackRollVsAc: CombatResolver = {
  resolveAttack({ label, dice, damageType, attackBonus = 0, targetAc = 10, advantage, bonusDamage, rng }) {
    const face = rollD20Face(advantage, rng); // raw natural value of the kept die
    const attackRoll = face + attackBonus;
    const advTag =
      advantage === 'advantage' ? ' (adv)' : advantage === 'disadvantage' ? ' (dis)' : '';
    const toHit = `1d20${sign(attackBonus)} = ${attackRoll}${advTag}`;
    const typeStr = damageType ? ` ${damageType}` : '';

    // Natural 1 → automatic miss, regardless of AC.
    if (face === 1) {
      return { hit: false, attackRoll, rolls: [], modifier: 0, damage: 0, logText: `${label}: natural 1 — MISS` };
    }
    const crit = face === 20; // natural 20 → automatic hit + crit
    const hit = crit || attackRoll >= targetAc;

    if (!hit) {
      return { hit: false, attackRoll, rolls: [], modifier: 0, damage: 0, logText: `${label}: ${toHit} vs AC ${targetAc} — MISS` };
    }
    const dmg = crit ? rollCritDamage(dice, rng) : rollDice(dice, rng);
    // Bonus damage dice (Sneak Attack) also double on a crit, per 5e.
    const bonus = bonusDamage ? (crit ? rollCritDamage(bonusDamage.dice, rng) : rollDice(bonusDamage.dice, rng)) : null;
    const total = dmg.total + (bonus?.total ?? 0);
    const head = crit ? 'natural 20 — CRIT' : `${toHit} vs AC ${targetAc} — HIT`;
    // Individual dice + modifier, e.g. [3,4] +2 → "3+4+2" (empty modifier for 0), matching the
    // describeRoll breakdown style. Only crits show this; a normal hit stays total-only.
    const breakdown = (r: RollResult) => `${r.rolls.join('+')}${sign(r.modifier)}`;
    const dmgText = crit
      ? bonus
        ? `${breakdown(dmg)}${typeStr} + ${breakdown(bonus)} ${bonusDamage!.label} = ${total} damage`
        : `${breakdown(dmg)} = ${total}${typeStr} damage`
      : bonus
        ? `${dmg.total}${typeStr} + ${bonus.total} ${bonusDamage!.label} = ${total} damage`
        : `${total}${typeStr} damage`;
    return {
      hit: true,
      crit,
      attackRoll,
      rolls: dmg.rolls,
      modifier: dmg.modifier,
      damage: total,
      logText: `${label}: ${head}, ${dmgText}`,
    };
  },
};

// --- Roll-vs-DC (saving throws & ability/skill checks) ----------------------
// The sibling of attackRollVsAc: d20 + modifier vs a Difficulty Class → success/failure.
// One primitive for both saves and checks (they differ only in the label). Universal —
// not tied to a combat mode — so it's a plain function, not part of CombatResolver. 5e-only
// in practice (Solryn has no saves); Solryn never calls it.

export interface CheckInput {
  /** Fully-built label, e.g. "Adult Red Dragon — DEX save" or "Goblin — Stealth check". */
  label: string;
  /** Save/check bonus added to the d20. */
  modifier?: number;
  /** Difficulty Class to meet or beat. */
  dc?: number;
  advantage?: 'advantage' | 'disadvantage';
  rng?: Rng;
}

export interface CheckResolution {
  success: boolean;
  /** d20 + modifier total. */
  roll: number;
  modifier: number;
  dc: number;
  logText: string;
}

export function resolveCheck({
  label,
  modifier = 0,
  dc = 10,
  advantage,
  rng,
}: CheckInput): CheckResolution {
  const face = rollD20Face(advantage, rng);
  const roll = face + modifier;
  const advTag =
    advantage === 'advantage' ? ' (adv)' : advantage === 'disadvantage' ? ' (dis)' : '';
  const success = roll >= dc;
  return {
    success,
    roll,
    modifier,
    dc,
    logText: `${label}: 1d20${sign(modifier)} = ${roll}${advTag} vs DC ${dc} — ${success ? 'SUCCESS' : 'FAIL'}`,
  };
}

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
