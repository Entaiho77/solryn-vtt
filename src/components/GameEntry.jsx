export default function GameEntry({ game, onResume, onDelete }) {
  const lastPlayed = new Date(game.lastPlayed).toLocaleDateString()

  return (
    <div className="game-entry">
      <div className="game-entry-info">
        <span className="game-entry-name">{game.gameName}</span>
        <span className="game-entry-meta">
          {game.system} &middot; Last played {lastPlayed}
        </span>
      </div>
      <div className="game-entry-actions">
        <button type="button" className="dialog-button primary" onClick={() => onResume(game)}>
          Resume
        </button>
        <button type="button" className="dialog-button" onClick={() => onDelete(game)}>
          Delete
        </button>
      </div>
    </div>
  )
}
