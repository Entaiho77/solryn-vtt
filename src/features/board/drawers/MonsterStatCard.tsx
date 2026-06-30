import type { SystemDefinition } from '../../../engine/schema';
import type { Token } from '../../../data/types';
import { getCombatResolver } from '../../../engine/rules';
import { removeToken, updateToken } from '../../../data/board';
import { setCreatureArt, useCreatureArt } from '../../../data/creatures';
import { Button } from '../../../components/ui/Button';
import { TokenArtUpload } from '../../../components/ui/TokenArtUpload';
import { ResourceTracker } from '../../sheet/ResourceTracker';
import { useRollLog } from '../../rolllog/rollLog';
import s from './drawers.module.css';

const statRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-2)',
};
const interactiveRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-3)',
  paddingBlock: 'var(--space-1)',
};
// Name + dice on their own lines, free to wrap — no ellipsis truncation.
const nameCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 };
const nameText: React.CSSProperties = { fontWeight: 600, overflowWrap: 'anywhere' };
const abilityRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'var(--space-3)',
  paddingBlock: 'var(--space-1)',
};

/** First clean dice term in a free-text ability string (e.g. "...66 (12d10) lightning..."). */
function abilityDice(text: string): string | null {
  const m = /(\d+d\d+(?:\s*[+-]\s*\d+)?)/.exec(text);
  return m ? m[1].replace(/\s+/g, '') : null;
}

// The merged creature card: read-only stats + tappable attacks (off the Phase-1
// attacks[]), plus GM token controls. Looked up by id (fallback name). Rendered in a
// proper side panel (BoardShell.rightPanel) — its own title/close come from the drawer
// chrome, so this body has no header of its own.
export function MonsterStatCard({
  system,
  name,
  creatureId,
  token,
  gameId,
  uid,
  onClose,
}: {
  system: SystemDefinition;
  name: string;
  creatureId?: string;
  token?: Token;
  gameId?: string;
  /** Present in GM context → enables the bestiary token-art upload (per-GM global). */
  uid?: string;
  onClose?: () => void;
}) {
  const { postRoll } = useRollLog();
  const creatureArt = useCreatureArt(uid ?? null);
  const entry =
    (creatureId ? system.bestiary.find((b) => b.id === creatureId) : undefined) ??
    system.bestiary.find((b) => b.name === name);
  if (!entry) return <p className={s.hint}>No stat block found for “{name}”.</p>;

  const st = entry.stats;
  const resolver = getCombatResolver(system);
  const post = (label: string, diceExpr: string, type?: string) =>
    postRoll(
      resolver.resolveAttack({ label: `${entry.name} — ${label}`, dice: diceExpr, damageType: type }).logText,
    );
  const gmControls = token && gameId;

  return (
    <div className={s.section}>
      {/* Stats */}
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
        <div style={statRow}><span className={s.itemMeta}>HP</span><span>{st.hp ?? '—'}</span></div>
      )}
      <div style={statRow}><span className={s.itemMeta}>DR</span><span>{st.dr ?? '—'}</span></div>
      <div style={statRow}><span className={s.itemMeta}>Speed</span><span>{st.speed ?? '—'}</span></div>

      {uid && (
        <div>
          <span className={s.label}>Token art</span>
          <TokenArtUpload
            scope={uid}
            imageUrl={creatureArt[entry.id]}
            label="art"
            onChange={(url) => void setCreatureArt(uid, entry.id, url)}
            onClear={() => void setCreatureArt(uid, entry.id, null)}
          />
          <p className={s.hint} style={{ marginTop: 'var(--space-1)' }}>
            Applies to every {entry.name} token across your games.
          </p>
        </div>
      )}

      {entry.attacks && entry.attacks.length > 0 && (
        <div>
          <span className={s.label}>Attacks</span>
          {entry.attacks.map((a, i) => (
            <div key={i} style={interactiveRow}>
              <span style={nameCol}>
                <span style={nameText}>{a.name}</span>
                <span className={s.itemMeta}>
                  {a.diceExpr} {a.damageType}
                  {a.note ? ` · ${a.note}` : ''}
                </span>
              </span>
              <Button onClick={() => post(a.name, a.diceExpr, a.damageType)}>Roll</Button>
            </div>
          ))}
        </div>
      )}

      {entry.abilities && entry.abilities.length > 0 && (
        <div>
          <span className={s.label}>Abilities</span>
          {entry.abilities.map((ab, i) => {
            const dice = abilityDice(ab);
            return (
              <div key={i} style={abilityRow}>
                <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{ab}</span>
                {dice && (
                  <Button variant="secondary" onClick={() => post(ab.split(':')[0], dice)}>
                    Roll
                  </Button>
                )}
              </div>
            );
          })}
        </div>
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
