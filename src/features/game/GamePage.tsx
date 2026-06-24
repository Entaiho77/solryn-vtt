import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { useValue } from '../../data/realtime';
import { createCharacter, useGameCharacter } from '../../data/characters';
import type { Game } from '../../data/types';
import { roleOf } from '../../permissions';
import { getSystem } from '../../systems/registry';
import { Button } from '../../components/ui/Button';
import { RoleBadge } from '../../components/ui/Badge';
import { GameSettingsModal } from './GameSettingsModal';
import { CharacterBuilder } from '../builder/CharacterBuilder';
import { CharacterReady } from '../sheet/CharacterReady';
import styles from './GamePage.module.css';

export function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { value: game, loading } = useValue<Game>(
    gameId ? `games/${gameId}` : null,
  );
  const { character, loading: charLoading } = useGameCharacter(
    gameId ?? null,
    user?.uid ?? null,
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

  function renderPlayer() {
    if (!system) {
      return <p className={styles.muted}>Unknown system “{game!.systemId}”.</p>;
    }
    if (charLoading) {
      return <p className={styles.muted}>Loading your character…</p>;
    }
    if (!character || !character.buildComplete) {
      return (
        <CharacterBuilder
          system={system}
          gameId={game!.id}
          ownerUserId={user!.uid}
          onFinish={async (c) => {
            await createCharacter(c);
          }}
        />
      );
    }
    return <CharacterReady system={system} character={character} />;
  }

  const isBuilding = role === 'player' && !charLoading && !character;
  const flow = role === 'player'; // player content manages its own layout

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/')} aria-label="Back to lobby">
          ‹ Lobby
        </button>
        <div className={styles.titleBlock}>
          <span className={styles.glyph} style={{ color: game.systemColor }} aria-hidden="true">
            {game.systemGlyph}
          </span>
          <span className={styles.gameName}>{game.name}</span>
          <span className={styles.systemLabel}>{game.systemName}</span>
        </div>
        <div className={styles.headerRight}>
          <RoleBadge role={role} />
          {!isBuilding && (
            <Button variant="secondary" size="sm" onClick={() => setShowSettings(true)}>
              Settings
            </Button>
          )}
        </div>
      </header>

      <main className={flow ? styles.bodyFlow : styles.body}>
        {role === 'gm' ? (
          <div className={styles.placeholder}>
            <h2>GM screen</h2>
            <p className={styles.muted}>
              The shared board, initiative tracker, dice log, chat, and map tools arrive
              in the board &amp; combat phases. The game shell, membership, and settings
              are live now.
            </p>
            <div className={styles.inviteBox}>
              Share this invite code with players:
              <code className={styles.inviteCode}>{game.inviteCode}</code>
            </div>
          </div>
        ) : (
          renderPlayer()
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
