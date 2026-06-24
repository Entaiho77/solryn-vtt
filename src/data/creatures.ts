import { useEffect, useState } from 'react';
import { newKey, subscribe, writeValue } from './realtime';
import { firebaseConfigured } from '../firebase/app';

/** A GM's saved custom creature/trap, reusable across their games (per §4.11). */
export interface SavedCreature {
  id: string;
  name: string;
  category: 'creature' | 'trap';
  stats: Record<string, number | string>;
}

export async function saveCreature(
  uid: string,
  creature: Omit<SavedCreature, 'id'>,
): Promise<string> {
  const id = newKey(`users/${uid}/creatures`);
  await writeValue(`users/${uid}/creatures/${id}`, { ...creature, id });
  return id;
}

export function deleteCreature(uid: string, id: string): Promise<void> {
  return writeValue(`users/${uid}/creatures/${id}`, null);
}

export function useMyCreatures(uid: string | null): SavedCreature[] {
  const [list, setList] = useState<SavedCreature[]>([]);
  useEffect(() => {
    if (!uid || !firebaseConfigured) {
      setList([]);
      return;
    }
    return subscribe<Record<string, SavedCreature>>(
      `users/${uid}/creatures`,
      (val) => setList(val ? Object.values(val) : []),
    );
  }, [uid]);
  return list;
}
