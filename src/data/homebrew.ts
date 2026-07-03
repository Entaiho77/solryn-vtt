import type { BestiaryEntry } from '../engine/schema';
import { newKey, writeValue } from './realtime';

/**
 * Per-game homebrew monsters (Phase A). Stored at games/$gameId/homebrew/monsters/$monsterId —
 * part of the Game object, so they sync with the game subscription (no separate listener needed).
 * GM-authored (see the games/$gameId/homebrew write rule); players read them so the monsters can
 * appear on the board and in combat.
 *
 * The shape converts losslessly into a BestiaryEntry (homebrewToBestiaryEntry) so the board,
 * stat card, and combat resolver treat homebrew and SRD monsters identically — no special cases.
 */

export interface HomebrewAttack {
  name: string;
  /** d20 to-hit bonus. */
  toHit: number;
  /** Damage dice term (parseDice-compatible), e.g. "2d6+4". */
  damageDice: string;
  damageType: string;
}

/** A named text feature (trait / action / legendary action). */
export interface HomebrewFeature {
  name: string;
  description: string;
}

export interface HomebrewMonster {
  id: string;
  name: string;
  /** Tiny/Small/Medium/Large/Huge/Gargantuan. */
  size: string;
  /** beast, undead, humanoid, dragon, … (free-form but drawn from a fixed dropdown). */
  type: string;
  alignment: string;
  hp: number;
  ac: number;
  /** Walking speed in feet. */
  speed: number;
  /** Challenge rating label, e.g. "1/4", "1", "5". */
  cr: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  damageResistances: string[];
  damageImmunities: string[];
  damageVulnerabilities: string[];
  conditionImmunities: string[];
  /** Repeatable sections — object-keyed maps (never arrays), per the data convention. */
  attacks: Record<string, HomebrewAttack>;
  traits: Record<string, HomebrewFeature>;
  actions: Record<string, HomebrewFeature>;
  legendaryActions: Record<string, HomebrewFeature>;
  /** GM (game owner) uid that authored it. */
  createdBy: string;
}

/** Create or overwrite a homebrew monster (GM-only, enforced by the security rules). */
export async function saveHomebrewMonster(
  gameId: string,
  monster: Omit<HomebrewMonster, 'id'> & { id?: string },
): Promise<string> {
  const id = monster.id ?? newKey(`games/${gameId}/homebrew/monsters`);
  await writeValue(`games/${gameId}/homebrew/monsters/${id}`, { ...monster, id });
  return id;
}

/** Delete a homebrew monster. Already-spawned tokens keep their own stats (see the converter). */
export function deleteHomebrewMonster(gameId: string, id: string): Promise<void> {
  return writeValue(`games/${gameId}/homebrew/monsters/${id}`, null);
}

/** Homebrew monsters for a game as an array (from the game-synced object map). */
export function homebrewList(
  monsters: Record<string, HomebrewMonster> | undefined,
): HomebrewMonster[] {
  return Object.values(monsters ?? {}).sort((a, b) => a.name.localeCompare(b.name));
}

/** Numeric CR from a label, so homebrew feeds the XP/encounter math like SRD creatures. */
export function crToNumber(cr: string): number {
  const t = cr.trim();
  if (t.includes('/')) {
    const [n, d] = t.split('/').map(Number);
    return d ? n / d : 0;
  }
  const v = Number(t);
  return Number.isFinite(v) ? v : 0;
}

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/**
 * Convert a homebrew monster into the exact BestiaryEntry shape the SRD bestiary uses, so the
 * stat card and combat resolver read it with no branching:
 *  - `stats` carries ac/hp/speed/type/cr/abilities scores + resistance/immunity display strings.
 *  - `attacks[]` are the structured, rollable AttackEntry rows (diceExpr + attackBonus).
 *  - `abilities[]` are the traits/actions/legendary features as "Name: text" lines (legendary
 *    tagged "(Legendary)"), matching the SRD convention the stat card already parses.
 */
export function homebrewToBestiaryEntry(hb: HomebrewMonster): BestiaryEntry {
  const stats: Record<string, number | string> = {
    ac: hb.ac,
    hp: hb.hp,
    speed: `${hb.speed} ft.`,
    type: cap(hb.type),
    size: hb.size,
    alignment: hb.alignment,
    cr: crToNumber(hb.cr),
    crLabel: hb.cr,
    str: hb.str,
    dex: hb.dex,
    con: hb.con,
    int: hb.int,
    wis: hb.wis,
    cha: hb.cha,
  };
  // Guard with ?. — Firebase omits empty arrays, so these can read back as undefined.
  if (hb.damageResistances?.length) stats.resistances = hb.damageResistances.join(', ');
  if (hb.damageImmunities?.length) stats.immunities = hb.damageImmunities.join(', ');
  if (hb.damageVulnerabilities?.length) stats.vulnerabilities = hb.damageVulnerabilities.join(', ');
  if (hb.conditionImmunities?.length) stats.conditionImmunities = hb.conditionImmunities.join(', ');

  const attacks = Object.values(hb.attacks ?? {}).map((a) => ({
    name: a.name,
    diceExpr: a.damageDice,
    damageType: a.damageType,
    attackBonus: a.toHit,
  }));

  const abilities = [
    ...Object.values(hb.traits ?? {}).map((t) => `${t.name}: ${t.description}`),
    ...Object.values(hb.actions ?? {}).map((a) => `${a.name}: ${a.description}`),
    ...Object.values(hb.legendaryActions ?? {}).map((l) => `${l.name} (Legendary): ${l.description}`),
  ];

  return {
    id: hb.id,
    name: hb.name,
    category: 'creature',
    stats,
    ...(attacks.length ? { attacks } : {}),
    ...(abilities.length ? { abilities } : {}),
  };
}
