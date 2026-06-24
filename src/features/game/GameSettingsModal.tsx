import { useEffect, useState } from 'react';
import type { Game, Role } from '../../data/types';
import {
  deleteGame,
  leaveGame,
  regenerateInviteCode,
  removeMember,
  updateGameName,
} from '../../data/games';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Avatar } from '../../components/ui/Avatar';
import { RoleBadge } from '../../components/ui/Badge';
import styles from './GameSettingsModal.module.css';

interface GameSettingsModalProps {
  open: boolean;
  onClose: () => void;
  game: Game;
  role: Role;
  currentUid: string;
  /** Called after the user leaves or the GM deletes — navigate back to the lobby. */
  onExit: () => void;
}

export function GameSettingsModal({
  open,
  onClose,
  game,
  role,
  currentUid,
  onExit,
}: GameSettingsModalProps) {
  const isGM = role === 'gm';
  const [name, setName] = useState(game.name);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  // Keep the editable name in sync if the live game updates elsewhere.
  useEffect(() => setName(game.name), [game.name]);

  const members = Object.entries(game.members ?? {});

  async function saveName() {
    if (name.trim() && name.trim() !== game.name) {
      await updateGameName(game.id, name);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard?.writeText(game.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable; ignore */
    }
  }

  async function regenerate() {
    setBusy(true);
    try {
      await regenerateInviteCode(game.id, game.inviteCode);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${game.name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteGame(game);
      onExit();
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    if (!confirm(`Leave "${game.name}"?`)) return;
    setBusy(true);
    try {
      await leaveGame(game.id, currentUid);
      onExit();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Game settings" width={520}>
      <div className={styles.body}>
        {/* Game name */}
        <section className={styles.section}>
          {isGM ? (
            <div className={styles.nameRow}>
              <div className={styles.nameField}>
                <TextField
                  label="Game name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => void saveName()}
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => void saveName()}
                disabled={!name.trim() || name.trim() === game.name}
              >
                Save
              </Button>
            </div>
          ) : (
            <Field label="Game name" value={game.name} />
          )}
        </section>

        {/* System (read-only, locked) */}
        <section className={styles.section}>
          <span className={styles.label}>System</span>
          <div className={styles.systemRow}>
            <span
              className={styles.systemGlyph}
              style={{ color: game.systemColor }}
              aria-hidden="true"
            >
              {game.systemGlyph}
            </span>
            <span className={styles.systemName}>{game.systemName}</span>
            <span className={styles.locked}>locked at creation</span>
          </div>
        </section>

        {/* Invite code (GM only controls) */}
        {isGM && (
          <section className={styles.section}>
            <span className={styles.label}>Invite code</span>
            <div className={styles.codeRow}>
              <code className={styles.code}>{game.inviteCode}</code>
              <Button variant="secondary" size="sm" onClick={() => void copyCode()}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void regenerate()}
                disabled={busy}
              >
                Regenerate
              </Button>
            </div>
            <p className={styles.hint}>
              Regenerating invalidates the old code — useful if it leaks or to stop
              new players from joining.
            </p>
          </section>
        )}

        {/* Members */}
        <section className={styles.section}>
          <span className={styles.label}>Members ({members.length})</span>
          <ul className={styles.members}>
            {members.map(([uid, m]) => (
              <li key={uid} className={styles.memberRow}>
                <Avatar name={m.displayName} size={28} />
                <span className={styles.memberName}>
                  {m.displayName}
                  {uid === currentUid && (
                    <span className={styles.you}> (you)</span>
                  )}
                </span>
                <RoleBadge role={m.role} />
                {isGM && uid !== currentUid && (
                  <button
                    className={styles.remove}
                    onClick={() => void removeMember(game.id, uid)}
                    title="Remove from game"
                    aria-label={`Remove ${m.displayName}`}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Danger zone */}
        <section className={styles.danger}>
          {isGM ? (
            <Button variant="danger" onClick={() => void handleDelete()} disabled={busy}>
              Delete this game
            </Button>
          ) : (
            <Button variant="danger" onClick={() => void handleLeave()} disabled={busy}>
              Leave game
            </Button>
          )}
        </section>
      </div>
    </Modal>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className={styles.label}>{label}</span>
      <div className={styles.readonly}>{value}</div>
    </div>
  );
}
