/**
 * Firebase data model. Three top-level collections: `users`, `games`, `characters`
 * (Design Doc §2, Build Brief §1.2). Role lives on game MEMBERSHIP, not on the user —
 * the same person can GM one game and play another.
 *
 * Realtime Database favors maps over arrays, so members/tokens/etc. are keyed objects.
 */

export type Role = 'gm' | 'player';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL?: string | null;
  createdAt: number;
}

export interface GameMember {
  role: Role;
  /** Denormalized for display on the board/lobby without an extra user lookup. */
  displayName: string;
  joinedAt: number;
}

/**
 * A game. System identity is captured at creation and READ-ONLY thereafter.
 * Board state (maps/tokens/fog/initiative/chat) is added in Phases D–E; the fields are
 * declared optional here so the one sync mechanism covers all of it later.
 */
export interface Game {
  id: string;
  name: string;
  systemId: string;
  systemName: string;
  systemGlyph: string;
  systemColor: string;
  inviteCode: string;
  createdBy: string;
  createdAt: number;
  members: Record<string, GameMember>;

  // --- Board state (Phase D) ---
  activeMapId?: string;
  maps?: Record<string, MapDef>;
  tokens?: Record<string, Token>;

  // --- Combat & social (Phase E) ---
  initiative?: InitiativeState;
  chat?: Record<string, unknown>;
  /** Party level the GM has granted up to; a character can level while below it. */
  levelGrant?: number;
}

/** One entry in the initiative order. */
export interface Combatant {
  id: string;
  name: string;
  kind: 'character' | 'creature';
  initiative: number;
  /** Tiebreaker within equal initiative (characters already beat creatures). */
  tieBreak: number;
  tokenId?: string;
  ownerUserId?: string;
  characterId?: string;
}

export interface InitiativeState {
  active: boolean;
  round: number;
  turnIndex: number;
  order: Combatant[];
}

/** A board map. The image is placed at the top-left and never stretched; a fixed grid
 * overlays at `gridSize` px. Real-world scale (from the map type) is metadata for a
 * future distance readout. */
export interface MapDef {
  id: string;
  name: string;
  /** Map-type id from system data (sets the real-world scale). */
  typeId: string;
  /** Image as a data URL (MVP; Firebase Storage is the production path). */
  imageUrl: string;
  width: number;
  height: number;
  /** Pixels per grid square. */
  gridSize: number;
  gridVisible: boolean;
  /** For the "custom" map type: GM-defined square scale. */
  customSquare?: { value: number; unit: string };
  /** Fogged squares, keyed "col,row". */
  fog?: Record<string, true>;
}

export type TokenKind = 'character' | 'creature' | 'trap';

export interface Token {
  id: string;
  mapId: string;
  kind: TokenKind;
  name: string;
  col: number;
  row: number;
  color?: string;
  imageUrl?: string;
  /** false = hidden token (GM sees it dimmed; players don't render it). */
  visible?: boolean;
  /** Character tokens: the controlling player + linked character. */
  ownerUserId?: string;
  characterId?: string;
  /** Creature/trap backing stat block (HP/DR/damage, or trap fields). */
  stats?: Record<string, number | string>;
  /** Creature current/max HP (GM-tracked). */
  hp?: { current: number; max: number };
  /** Creature defeated (grayed in place during combat). */
  defeated?: boolean;
  /** Trap lifecycle: hidden → revealed → sprung (GM-arbitrated). */
  trapState?: 'hidden' | 'revealed' | 'sprung';
}

/**
 * A character: one per player per game. Split into an immutable DEFINITION (built once,
 * respects the one-way creation gates) and a mutable PLAY-STATE. `buildComplete` flips
 * build→play permanently at "Finish character".
 */
export interface CharacterSkillState {
  /** Points placed (editable anywhere, e.g. on level-up). */
  investedPoints: number;
  /** Points realized through in-town training (drive the active bonus). */
  realizedPoints: number;
}

export interface CharacterDefinition {
  ancestryId: string;
  /** Stat bonuses chosen for flexible-bonus ancestries (stat id → amount). */
  ancestryChoices?: Record<string, number>;
  /** Rolled core scores, locked at creation (one-way gate). */
  coreScores: Record<string, number>;
  chosenSkillIds: string[];
  knownSpellIds: string[];
}

export interface CharacterPlayState {
  level: number;
  reputation: string;
  /** Resource pools by derived-stat id (e.g. hp, arcanaPoints, luckPoints). */
  pools: Record<string, { current: number }>;
  /** Skill points granted (by level-up) but not yet placed. */
  unspentSkillPoints?: number;
  equippedArmorId?: string;
  equippedWeaponIds: string[];
  loadedSpellId?: string;
  /** Per-skill invested/realized points (skill id → state). */
  skills: Record<string, CharacterSkillState>;
}

export interface Character {
  id: string;
  gameId: string;
  ownerUserId: string;
  systemId: string;
  name: string;
  buildComplete: boolean;
  definition: CharacterDefinition;
  play: CharacterPlayState;
}

/** Lightweight game summary for the lobby list. */
export interface GameSummary {
  id: string;
  name: string;
  systemName: string;
  systemGlyph: string;
  systemColor: string;
  memberCount: number;
  role: Role;
}
