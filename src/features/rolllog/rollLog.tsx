import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { RollResult } from '../../engine/rules';
import { clearRollLog, postRollEntry, trimRollLog, type RollEntry } from '../../data/rollLog';
import s from '../board/drawers/drawers.module.css';

// Shared roll log: every roll source (character attacks, the free-form dice drawer, the
// monster card) posts here, and it syncs table-wide via Firebase (games/{id}/rollLog).
// `postRoll(text)` keeps its simple signature; the provider attaches the roller's identity
// and writes to the DB. Entries come live from game state, so all clients see every roll.

export type { RollEntry };

interface RollLogValue {
  entries: RollEntry[];
  postRoll: (text: string) => void;
  clear: () => void;
  /** GM-only: the Clear button is hidden otherwise. */
  canClear: boolean;
}

const RollLogContext = createContext<RollLogValue | null>(null);

/** How many entries to render (the DB keeps up to CAP=100; we show the newest slice). */
const RENDER_LIMIT = 50;

export function RollLogProvider({
  gameId,
  uid,
  displayName,
  log,
  canClear,
  children,
}: {
  gameId: string;
  uid: string;
  displayName: string;
  log?: Record<string, RollEntry>;
  canClear: boolean;
  children: ReactNode;
}) {
  // Newest-first by push key (chronological, clock-skew-proof), limited for render.
  const entries = useMemo(
    () =>
      Object.values(log ?? {})
        .sort((a, b) => (a.id < b.id ? 1 : a.id > b.id ? -1 : 0))
        .slice(0, RENDER_LIMIT),
    [log],
  );

  const postRoll = useCallback(
    (text: string) => {
      void postRollEntry(gameId, { text, at: Date.now(), byUid: uid, by: displayName }).then(
        () => trimRollLog(gameId, log),
      );
    },
    [gameId, uid, displayName, log],
  );

  const clear = useCallback(() => {
    if (canClear) void clearRollLog(gameId);
  }, [gameId, canClear]);

  return (
    <RollLogContext.Provider value={{ entries, postRoll, clear, canClear }}>
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
  const { entries, clear, canClear } = useRollLog();
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
            // font-family: var(--font-sans), font-size: var(--text-base) (1rem),
            // and color: var(--text-primary) (.preview otherwise renders muted).
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
            }}
          >
            {e.by ? <strong>{e.by} — </strong> : null}
            {e.text}
          </div>
        ))}
      </div>
      {canClear && (
        <button type="button" className={s.place} onClick={clear} style={{ alignSelf: 'flex-start' }}>
          Clear log
        </button>
      )}
    </div>
  );
}
