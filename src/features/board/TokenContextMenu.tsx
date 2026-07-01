import { useEffect } from 'react';
import type { Token } from '../../data/types';
import { removeToken } from '../../data/board';
import styles from './TokenContextMenu.module.css';

/**
 * GM right-click menu for board tokens. Positioned at the cursor; dismisses on click-away
 * (the backdrop) or Escape. Only offers token-level cleanup — "Remove token" deletes the
 * board token alone (games/{gameId}/tokens/{tokenId}); a player's character, membership, and
 * game link are untouched, so they can rejoin. Rendered by BoardScreen for the GM only.
 */
export function TokenContextMenu({
  token,
  x,
  y,
  gameId,
  onClose,
}: {
  token: Token;
  x: number;
  y: number;
  gameId: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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
        <button className={styles.item} role="menuitem" onClick={remove}>
          Remove token
        </button>
        {token.kind === 'character' && (
          <p className={styles.hint}>
            Removes the token only — the player keeps their character and can rejoin.
          </p>
        )}
      </div>
    </>
  );
}
