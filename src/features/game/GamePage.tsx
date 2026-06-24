import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { useValue } from '../../data/realtime';
import type { Game } from '../../data/types';
import { roleOf } from '../../permissions';
import { getSystem } from '../../systems/registry';
import { Button } from '../../components/ui/Button';
import { RoleBadge } from '../../components/ui/Badge';
import { GameSettingsModal } from './GameSettingsModal';
import styles from './GamePage.module.css';

export function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { value: game, loading } = useValue<Game>(
    gameId ? `games/${gameId}` : null,
  );
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return <div className={styles.center}>Loading game…</div>;
  }
  if (!game || !user) {
    return (
      <div className={styles.center}>
        <p>This game could not be found.</p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to lobby
        </Button>
      </div>
    );
  }

  const role = roleOf(game, user.uid);
  if (!role) {
    return (
      <div className={styles.center}>
        <p>You’re not a member of this game.</p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to lobby
        </Button>
      </div>
    );
  }

  const system = getSystem(game.systemId);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/')} aria-label="Back to lobby">
          ‹ Lobby
        </button>
        <div className={styles.titleBlock}>
          <span
            className={styles.glyph}
            style={{ color: game.systemColor }}
            aria-hidden="true"
          >
            {game.systemGlyph}
          </span>
          <span className={styles.gameName}>{game.name}</span>
          <span className={styles.systemLabel}>{game.systemName}</span>
        </div>
        <div className={styles.headerRight}>
          <RoleBadge role={role} />
          <Button variant="secondary" size="sm" onClick={() => setShowSettings(true)}>
            Settings
          </Button>
        </div>
      </header>

      <main className={styles.body}>
        {/* Role branch (§1): GM → GM screen; player → builder/sheet. Both are later phases. */}
        {role === 'gm' ? (
          <div className={styles.placeholder}>
            <h2>GM screen</h2>
            <p className={styles.muted}>
              The shared board, initiative tracker, dice log, chat, and map tools
              arrive in the board &amp; combat phases. The game shell, membership,
              and settings are live now.
            </p>
            <div className={styles.inviteBox}>
              Share this invite code with players:
              <code className={styles.inviteCode}>{game.inviteCode}</code>
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <h2>Your character</h2>
            <p className={styles.muted}>
              The 13-step guided builder and the play-mode character sheet arrive
              in the character phase. You’ve joined the game — your character will
              live here.
            </p>
          </div>
        )}

        {system && (
          <p className={styles.engineNote}>
            Running on the <strong>{system.name}</strong> system
            {system.tagline ? ` — ${system.tagline}` : ''}
          </p>
        )}
      </main>

      <GameSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        game={game}
        role={role}
        currentUid={user.uid}
        onExit={() => navigate('/')}
      />
    </div>
  );
}
