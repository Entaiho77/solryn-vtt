import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { joinGameByCode, useUserGames } from '../../data/games';
import type { Game } from '../../data/types';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { GameRow } from './GameRow';
import { CreateGameModal } from './CreateGameModal';
import styles from './LobbyPage.module.css';

export function LobbyPage() {
  const { user, displayName, signOut } = useAuth();
  const navigate = useNavigate();
  const uid = user?.uid ?? null;
  const { games, loading } = useUserGames(uid);

  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  function openGame(game: Game) {
    navigate(`/game/${game.id}`);
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    if (!user || !code.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const game = await joinGameByCode(code, { uid: user.uid, displayName });
      setCode('');
      navigate(`/game/${game.id}`);
    } catch (err) {
      setJoinError((err as Error).message);
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandGlyph} aria-hidden="true">
            ✶
          </span>
          Solryn VTT
        </div>
        <div className={styles.user}>
          <Avatar name={displayName} />
          <span className={styles.userName}>{displayName}</span>
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.sectionHead}>
          <h1 className={styles.h1}>Your games</h1>
          <Button onClick={() => setShowCreate(true)}>+ Create game</Button>
        </div>

        {loading ? (
          <p className={styles.muted}>Loading your games…</p>
        ) : games.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No games yet</p>
            <p className={styles.muted}>
              Create a game to run as GM, or join one with an invite code below.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {uid &&
              games.map((g) => (
                <GameRow key={g.id} game={g} uid={uid} onOpen={openGame} />
              ))}
          </div>
        )}

        <form className={styles.joinRow} onSubmit={handleJoin}>
          <div className={styles.joinField}>
            <TextField
              label="Join a game"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter invite code (e.g. SVLT-7K2P)"
              error={joinError || undefined}
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            disabled={joining || !code.trim()}
          >
            {joining ? 'Joining…' : 'Join'}
          </Button>
        </form>
      </main>

      <CreateGameModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={openGame}
      />
    </div>
  );
}
