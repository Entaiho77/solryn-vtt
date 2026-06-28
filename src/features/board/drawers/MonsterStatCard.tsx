import type { SystemDefinition } from '../../../engine/schema';
import { rollDice } from '../../../engine/rules';
import { Button } from '../../../components/ui/Button';
import { describeRoll, useRollLog } from '../../rolllog/rollLog';
import s from './drawers.module.css';

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-2)',
};

/** First clean dice term in a free-text ability string (e.g. "...66 (12d10) lightning..."). */
function abilityDice(text: string): string | null {
  const m = /(\d+d\d+(?:\s*[+-]\s*\d+)?)/.exec(text);
  return m ? m[1].replace(/\s+/g, '') : null;
}

// Read straight off the Phase-1 attacks[] on the bestiary entry — board tokens only
// carry flat stats, so we look the creature up by name.
export function MonsterStatCard({
  system,
  name,
  creatureId,
}: {
  system: SystemDefinition;
  name: string;
  creatureId?: string;
}) {
  const { postRoll } = useRollLog();
  // Prefer the stable bestiary id; fall back to name match for tokens placed
  // before ids were stored (or built/custom tokens).
  const entry =
    (creatureId ? system.bestiary.find((b) => b.id === creatureId) : undefined) ??
    system.bestiary.find((b) => b.name === name);
  if (!entry) return <p className={s.hint}>No stat block found for “{name}”.</p>;

  const st = entry.stats;
  const post = (label: string, diceExpr: string, type?: string) =>
    postRoll(describeRoll(`${entry.name} — ${label}`, rollDice(diceExpr), { type }));

  return (
    <div className={s.section}>
      <span className={s.label}>{entry.name}</span>

      <div style={rowStyle}><span className={s.itemMeta}>HP</span><span>{st.hp ?? '—'}</span></div>
      <div style={rowStyle}><span className={s.itemMeta}>DR</span><span>{st.dr ?? '—'}</span></div>
      <div style={rowStyle}><span className={s.itemMeta}>Speed</span><span>{st.speed ?? '—'}</span></div>

      {entry.attacks && entry.attacks.length > 0 && (
        <>
          <span className={s.label}>Attacks</span>
          {entry.attacks.map((a, i) => (
            <div key={i} style={rowStyle}>
              <span className={s.itemName}>{a.name}</span>
              <span className={s.itemMeta}>
                {a.diceExpr} {a.damageType}
                {a.note ? ` (${a.note})` : ''}
              </span>
              <Button size="sm" onClick={() => post(a.name, a.diceExpr, a.damageType)}>
                Roll
              </Button>
            </div>
          ))}
        </>
      )}

      {entry.abilities && entry.abilities.length > 0 && (
        <>
          <span className={s.label}>Abilities</span>
          {entry.abilities.map((ab, i) => {
            const dice = abilityDice(ab);
            return (
              <div key={i} style={rowStyle}>
                <span className={s.hint} style={{ flex: 1 }}>{ab}</span>
                {dice && (
                  <Button size="sm" variant="secondary" onClick={() => post(ab.split(':')[0], dice)}>
                    Roll
                  </Button>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
