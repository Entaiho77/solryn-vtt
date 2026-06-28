import type { SystemDefinition } from '../../../engine/schema';
import type { Token } from '../../../data/types';
import { rollDice } from '../../../engine/rules';
import { removeToken, updateToken } from '../../../data/board';
import { Button } from '../../../components/ui/Button';
import { ResourceTracker } from '../../sheet/ResourceTracker';
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

// The merged creature card: read-only stats + tappable attacks (off the Phase-1
// attacks[]), plus the GM token controls (Hide/Defeat/Remove) when a token is
// supplied. Board tokens carry only flat stats, so the entry is looked up by id
// (fallback name). Without a token (e.g. opened from the Initiative drawer) the
// HP tracker and controls are simply omitted.
export function MonsterStatCard({
  system,
  name,
  creatureId,
  token,
  gameId,
  onClose,
}: {
  system: SystemDefinition;
  name: string;
  creatureId?: string;
  token?: Token;
  gameId?: string;
  onClose?: () => void;
}) {
  const { postRoll } = useRollLog();
  const entry =
    (creatureId ? system.bestiary.find((b) => b.id === creatureId) : undefined) ??
    system.bestiary.find((b) => b.name === name);
  if (!entry) return <p className={s.hint}>No stat block found for “{name}”.</p>;

  const st = entry.stats;
  const post = (label: string, diceExpr: string, type?: string) =>
    postRoll(describeRoll(`${entry.name} — ${label}`, rollDice(diceExpr), { type }));
  const gmControls = token && gameId;

  return (
    <div className={s.section}>
      <div style={rowStyle}>
        <span className={s.label}>{entry.name}</span>
        {onClose && (
          <button type="button" className={s.place} onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
      </div>

      {token?.hp ? (
        <ResourceTracker
          label="HP"
          current={token.hp.current}
          max={token.hp.max}
          onChange={(n) =>
            gameId && void updateToken(gameId, token.id, { hp: { current: n, max: token.hp!.max } })
          }
        />
      ) : (
        <div style={rowStyle}><span className={s.itemMeta}>HP</span><span>{st.hp ?? '—'}</span></div>
      )}
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

      {gmControls && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void updateToken(gameId, token.id, { visible: token.visible === false })}
          >
            {token.visible === false ? 'Reveal' : 'Hide'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void updateToken(gameId, token.id, { defeated: !token.defeated })}
          >
            {token.defeated ? 'Revive' : 'Defeat'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              void removeToken(gameId, token.id);
              onClose?.();
            }}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
