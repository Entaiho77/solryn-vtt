import type { SystemDefinition } from '../../engine/schema';
import type { Character, Role, Token } from '../../data/types';
import { removeToken, updateToken } from '../../data/board';
import { canSeeMonsterStats, tokenVisibility } from '../../permissions';
import { ResourceTracker } from '../sheet/ResourceTracker';
import { Button } from '../../components/ui/Button';
import styles from './TokenCard.module.css';

/** Floating card for a tapped token (§4.4), honoring the visibility matrix. */
export function TokenCard({
  token,
  role,
  uid,
  gameId,
  viewerCharacter,
  onClose,
}: {
  token: Token;
  system: SystemDefinition;
  role: Role;
  uid: string;
  gameId: string;
  viewerCharacter?: Character;
  onClose: () => void;
}) {
  const view = tokenVisibility(token, uid, role);
  const isGM = role === 'gm';
  const isCreature = token.kind !== 'character';

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.name}>{token.name}</span>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      {isCreature ? (
        canSeeMonsterStats(role) ? (
          <div className={styles.body}>
            {token.hp && (
              <ResourceTracker
                label="HP"
                current={token.hp.current}
                max={token.hp.max}
                onChange={(n) =>
                  void updateToken(gameId, token.id, {
                    hp: { current: n, max: token.hp!.max },
                  })
                }
              />
            )}
            <div className={styles.stats}>
              {token.stats?.dr != null && <span>DR {String(token.stats.dr)}</span>}
              {token.stats?.damage != null && <span>Dmg {String(token.stats.damage)}</span>}
              {token.stats?.detectionDC != null && (
                <span>Spot DC {String(token.stats.detectionDC)}</span>
              )}
            </div>
            {isGM && (
              <div className={styles.actions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    void updateToken(gameId, token.id, { visible: token.visible === false })
                  }
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
                    onClose();
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Players: monsters stay mysterious — name + image only.
          <p className={styles.muted}>A creature. Its details are hidden.</p>
        )
      ) : (
        <div className={styles.body}>
          {token.characterId === viewerCharacter?.id && viewerCharacter ? (
            <p className={styles.muted}>
              Your character — manage HP and more in the quick-view on the right.
            </p>
          ) : (
            <p className={styles.muted}>
              {view === 'full' ? 'Player character (read-only).' : 'Another player’s character.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
