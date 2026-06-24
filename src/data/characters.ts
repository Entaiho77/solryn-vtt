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
