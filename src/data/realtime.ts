import {
  ref,
  onValue,
  set,
  update,
  push,
  get,
  type Unsubscribe,
} from 'firebase/database';
import { useEffect, useState } from 'react';
import { getDb, firebaseConfigured } from '../firebase/app';

/**
 * The ONE sync mechanism (Design Doc §4.12). Tokens, fog, HP, initiative, chat — all of
 * it is just "game state" riding these helpers. Realtime Database is the single source of
 * truth; every screen is a live, permission-filtered window. Own writes reflect locally
 * before the server acks (RTDB latency compensation), giving the optimistic local-first
 * feel; others' changes push in a fraction of a second.
 */

export function subscribe<T>(
  path: string,
  cb: (value: T | null) => void,
): Unsubscribe {
  return onValue(ref(getDb(), path), (snap) => cb(snap.val() as T | null));
}

export async function readValue<T>(path: string): Promise<T | null> {
  const snap = await get(ref(getDb(), path));
  return snap.val() as T | null;
}

export function writeValue<T>(path: string, value: T): Promise<void> {
  return set(ref(getDb(), path), value);
}

export function updateValue(
  path: string,
  partial: Record<string, unknown>,
): Promise<void> {
  return update(ref(getDb(), path), partial);
}

/**
 * Atomic multi-path update from the database root. Pass absolute paths as keys, e.g.
 * { '/games/abc/name': 'New', '/inviteCodes/XYZ': 'abc' }. Either all paths apply or none.
 */
export function multiUpdate(updates: Record<string, unknown>): Promise<void> {
  return update(ref(getDb()), updates);
}

/** Allocate a new push key for a list path (without writing yet). */
export function newKey(path: string): string {
  const k = push(ref(getDb(), path)).key;
  if (!k) throw new Error('Failed to allocate a database key');
  return k;
}

/** React hook: live value at a path. Pass null to disable. */
export function useValue<T>(path: string | null): {
  value: T | null;
  loading: boolean;
} {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path || !firebaseConfigured) {
      setValue(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onValue(ref(getDb(), path), (snap) => {
      setValue(snap.val() as T | null);
      setLoading(false);
    });
    return () => unsub();
  }, [path]);

  return { value, loading };
}
