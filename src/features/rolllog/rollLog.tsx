import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { RollResult } from '../../engine/rules';
import s from '../board/drawers/drawers.module.css';

// Shared roll log: one client-side store every roll source posts to (character
// attacks, the free-form dice drawer, the monster card). Per-game, in-memory.
// (Table-wide realtime sync would be a follow-up — this just unifies the sources.)

export interface RollEntry {
  id: string;
  text: string;
  at: number;
}

interface RollLogValue {
  entries: RollEntry[];
  postRoll: (text: string) => void;
  clear: () => void;
}

const RollLogContext = createContext<RollLogValue | null>(null);

let seq = 0;

export function RollLogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<RollEntry[]>([]);
  const postRoll = useCallback((text: string) => {
    setEntries((prev) =>
      [{ id: `r${++seq}`, text, at: Date.now() }, ...prev].slice(0, 50),
    );
  }, []);
  const clear = useCallback(() => setEntries([]), []);
  return (
    <RollLogContext.Provider value={{ entries, postRoll, clear }}>
      {children}
    </RollLogContext.Provider>
  );
}

export function useRollLog(): RollLogValue {
  const ctx = useContext(RollLogContext);
  if (!ctx) throw new Error('useRollLog must be used within a RollLogProvider');
  return ctx;
}

/**
 * Canonical damage-roll string — the format reused by weapon, spell, and monster
 * rolls so the log reads uniformly. (Mirrors the original AttacksSection.rollWeapon
 * string, with the dice modifier surfaced in the signed term.)
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

/** The shared log window. Drop it anywhere inside a RollLogProvider. */
export function RollLog() {
  const { entries, clear } = useRollLog();
  if (entries.length === 0) {
    return <p className={s.hint}>No rolls yet. Attacks, dice, and monster rolls land here.</p>;
  }
  return (
    <div className={s.section}>
      <div className={s.list}>
        {entries.map((e) => (
          <div
            key={e.id}
            className={s.preview}
            // Match the stat panel's body text exactly: it inherits body's
            // font-family: var(--font-sans) and font-size: var(--text-base) (1rem).
            style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)' }}
          >
            {e.text}
          </div>
        ))}
      </div>
      <button type="button" className={s.place} onClick={clear} style={{ alignSelf: 'flex-start' }}>
        Clear log
      </button>
    </div>
  );
}
