import { useEffect } from 'react';
import type { Token } from '../../data/types';
import { removeToken } from '../../data/board';
import styles from './TokenContextMenu.module.css';

/**
 * Right-click menu for board tokens. Positioned at the cursor; dismisses on click-away (the
 * backdrop) or Escape. It sets the attack target and (for the GM) removes tokens — both
 * WITHOUT changing selection, so the attacker's card stays open while you target a defender.
 *
 * - "Set as target" (character/creature, for systems with target-vs-defense combat) points attacks
 *   at this token; its defense (5e AC / Solryn DR) is read from the stat block. Toggling clears it.
 * - "Remove token" (GM only) deletes just games/{gameId}/tokens/{tokenId}; a player's
 *   character, membership, and game link are untouched, so they can rejoin.
 */
export function TokenContextMenu({
  token,
  x,
  y,
  gameId,
  targetingEnabled,
  isTarget,
  onSetTarget,
  canRemove,
  onClose,
}: {
  token: Token;
  x: number;
  y: number;
  gameId: string;
  /** Whether this system's combat uses targeting (5e AC / Solryn DR) → offer "Set as target". */
  targetingEnabled: boolean;
  /** Whether this token is already the current target (toggles the label to "Clear target"). */
  isTarget: boolean;
  /** Set/clear this token as the attack target (does not change selection). */
  onSetTarget: () => void;
  /** GM → offer "Remove token". */
  canRemove: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Only attackable tokens can be targeted (traps/party have no AC to hit).
  const canTarget = targetingEnabled && (token.kind === 'character' || token.kind === 'creature');

  const setTarget = () => {
    onSetTarget();
    onClose();
  };
  const remove = () => {
    void removeToken(gameId, token.id);
    onClose();
  };

  // Keep the menu on-screen when the cursor is near the right/bottom edge.
  const left = Math.min(x, window.innerWidth - 248);
  const top = Math.min(y, window.innerHeight - 120);

  return (
    <>
      <div
        className={styles.backdrop}
        onMouseDown={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div className={styles.menu} style={{ left, top }} role="menu">
        <div className={styles.header}>{token.name}</div>
        {canTarget && (
          <button className={styles.item} role="menuitem" onClick={setTarget}>
            {isTarget ? 'Clear target' : 'Set as target'}
          </button>
        )}
        {canRemove && (
          <button className={styles.item} role="menuitem" onClick={remove}>
            Remove token
          </button>
        )}
        {canRemove && token.kind === 'character' && (
          <p className={styles.hint}>
            Remove takes the token only — the player keeps their character and can rejoin.
          </p>
        )}
      </div>
    </>
  );
}
