import { useEffect, useState } from 'react';
import type { Character, CharacterPlayState, CharacterSkillState } from './types';
import {
  multiUpdate,
  newKey,
  subscribe,
  updateValue,
  writeValue,
} from './realtime';
import { firebaseConfigured } from '../firebase/app';

/**
 * Character data layer. One character per player per game; the
 * gameCharacters/{gameId}/{uid} index lets a game look up "my character" cheaply.
 * A character splits immutable `definition` (built once) from mutable `play` state.
 */

export async function createCharacter(
  character: Omit<Character, 'id'> & { id?: string },
): Promise<Character> {
  const id = character.id ?? newKey('characters');
  const full: Character = { ...character, id };
  await multiUpdate({
    [`/characters/${id}`]: full,
    [`/gameCharacters/${full.gameId}/${full.ownerUserId}`]: id,
  });
  return full;
}

/** Patch the mutable play-state (HP/pools, equipped, skills, etc.). */
export function updateCharacterPlay(
  characterId: string,
  patch: Partial<CharacterPlayState>,
): Promise<void> {
  return updateValue(`characters/${characterId}/play`, patch as Record<string, unknown>);
}

// --- Fine-grained play-state writes (the live subscription reflects them back) ---

export function setPoolCurrent(
  characterId: string,
  poolId: string,
  current: number,
): Promise<void> {
  return writeValue(`characters/${characterId}/play/pools/${poolId}/current`, current);
}

/** Set the remaining slot count for one spell level (5e). Object-keyed under play.spellSlots. */
export function setSpellSlot(
  characterId: string,
  slotLevel: number,
  current: number,
): Promise<void> {
  return writeValue(`characters/${characterId}/play/spellSlots/${slotLevel}`, current);
}

/** Recover all slots to their maxima (long rest). Writes the whole object at once. */
export function restoreSpellSlots(
  characterId: string,
  maxSlots: Record<number, number>,
): Promise<void> {
  return writeValue(`characters/${characterId}/play/spellSlots`, maxSlots);
}

export function setSkillState(
  characterId: string,
  skillId: string,
  state: CharacterSkillState,
): Promise<void> {
  return writeValue(`characters/${characterId}/play/skills/${skillId}`, state);
}

export function setUnspentSkillPoints(
  characterId: string,
  n: number,
): Promise<void> {
  return writeValue(`characters/${characterId}/play/unspentSkillPoints`, n);
}

export function setLoadedSpell(
  characterId: string,
  spellId: string,
): Promise<void> {
  return writeValue(`characters/${characterId}/play/loadedSpellId`, spellId);
}

/** Apply a completed level-up: new core scores, level, refreshed pools, +skill points. */
export function applyLevelUp(
  characterId: string,
  data: {
    coreScores: Record<string, number>;
    level: number;
    pools: Record<string, { current: number }>;
    unspentSkillPoints: number;
  },
): Promise<void> {
  return multiUpdate({
    [`/characters/${characterId}/definition/coreScores`]: data.coreScores,
    [`/characters/${characterId}/play/level`]: data.level,
    [`/characters/${characterId}/play/pools`]: data.pools,
    [`/characters/${characterId}/play/unspentSkillPoints`]: data.unspentSkillPoints,
  });
}

/** Set (or clear) a character's round token art. */
export function setCharacterImage(
  characterId: string,
  imageUrl: string | null,
): Promise<void> {
  return writeValue(`characters/${characterId}/imageUrl`, imageUrl);
}

/**
 * Live characterId → art-URL map for every character in a game, so the board can resolve
 * art for any player's token (not just the viewer's own). Subscribes to the game's
 * character index, then to each character's `imageUrl`.
 */
export function useGameCharacterArt(gameId: string | null): Record<string, string> {
  const [ids, setIds] = useState<string[]>([]);
  const [art, setArt] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!gameId || !firebaseConfigured) {
      setIds([]);
      return;
    }
    return subscribe<Record<string, string>>(`gameCharacters/${gameId}`, (val) =>
      setIds(val ? Object.values(val) : []),
    );
  }, [gameId]);

  useEffect(() => {
    if (!firebaseConfigured || ids.length === 0) {
      setArt({});
      return;
    }
    const unsubs = ids.map((id) =>
      subscribe<string>(`characters/${id}/imageUrl`, (url) =>
        setArt((prev) => {
          if (url) return { ...prev, [id]: url };
          if (!(id in prev)) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        }),
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, [ids.join(',')]);

  return art;
}

/** Live "my character" for a game (or null if none yet). */
export function useGameCharacter(
  gameId: string | null,
  uid: string | null,
): { character: Character | null; loading: boolean } {
  // undefined = index still resolving; null = no character; string = id
  const [charId, setCharId] = useState<string | null | undefined>(undefined);
  const [character, setCharacter] = useState<Character | null>(null);
  const [charLoading, setCharLoading] = useState(false);

  useEffect(() => {
    if (!gameId || !uid || !firebaseConfigured) {
      setCharId(null);
      return;
    }
    setCharId(undefined);
    return subscribe<string>(`gameCharacters/${gameId}/${uid}`, (v) =>
      setCharId(v ?? null),
    );
  }, [gameId, uid]);

  useEffect(() => {
    if (charId === undefined) return; // index still resolving
    if (!charId) {
      setCharacter(null);
      setCharLoading(false);
      return;
    }
    setCharLoading(true);
    return subscribe<Character>(`characters/${charId}`, (c) => {
      setCharacter(c);
      setCharLoading(false);
    });
  }, [charId]);

  return { character, loading: charId === undefined || charLoading };
}
