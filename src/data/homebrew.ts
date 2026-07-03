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
  /** Homebrew-equipment ids carried as loot (object-keyed set — never an array). Distributed to
   *  players from a spawned instance's stat card (Phase B1). */
  loot?: Record<string, true>;
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

// --- Homebrew equipment (Phase B1) ------------------------------------------

export type EquipmentCategory = 'weapon' | 'armor' | 'tool' | 'other';
export type WeaponRange = 'melee' | 'ranged';
export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield';

/** GM-authored equipment, stored at games/$gameId/homebrew/equipment/$id. Weapon/armor fields are
 *  present only for those categories; Phase B2 turns them into mechanical effects. */
export interface HomebrewEquipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  description: string;
  weight?: number;
  value?: string;
  // --- weapon ---
  damageDice?: string;
  damageType?: string;
  weaponRange?: WeaponRange;
  /** finesse | versatile | thrown | ranged | two-handed | light | heavy | loading. */
  properties?: string[];
  versatileDamageDice?: string;
  // --- armor ---
  armorType?: ArmorType;
  baseAc?: number;
  stealthDisadvantage?: boolean;
}

/** A looted item on a character (characters/$id/inventory/$itemId) — a full snapshot of the
 *  equipment at loot time (so it survives edits/deletes of the source), plus an equipped flag. */
export interface InventoryItem extends Omit<HomebrewEquipment, 'id'> {
  /** Inventory-record id (distinct from the source equipment id). */
  id: string;
  /** Source homebrew-equipment id it was looted from (reference only; data is snapshotted). */
  equipmentId: string;
  equipped: boolean;
}

/** Drop undefined-valued keys — Firebase set() rejects objects containing undefined. */
function pruneUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** Create or overwrite a homebrew equipment item (GM-only, enforced by the security rules). */
export async function saveHomebrewEquipment(
  gameId: string,
  equipment: Omit<HomebrewEquipment, 'id'> & { id?: string },
): Promise<string> {
  const id = equipment.id ?? newKey(`games/${gameId}/homebrew/equipment`);
  await writeValue(`games/${gameId}/homebrew/equipment/${id}`, pruneUndefined({ ...equipment, id }));
  return id;
}

export function deleteHomebrewEquipment(gameId: string, id: string): Promise<void> {
  return writeValue(`games/${gameId}/homebrew/equipment/${id}`, null);
}

/** Homebrew equipment for a game as a sorted array (from the game-synced object map). */
export function equipmentList(
  equipment: Record<string, HomebrewEquipment> | undefined,
): HomebrewEquipment[] {
  return Object.values(equipment ?? {}).sort((a, b) => a.name.localeCompare(b.name));
}

/** Snapshot an equipment item into an inventory record (minus the record id, added on write). */
export function equipmentToInventoryItem(
  equip: HomebrewEquipment,
): Omit<InventoryItem, 'id'> {
  const { id, ...rest } = equip;
  return pruneUndefined({ ...rest, equipmentId: id, equipped: false });
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
