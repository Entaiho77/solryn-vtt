import GameEntry from './GameEntry.jsx'

export default function PreviousGamesList({ games, onResume, onDelete }) {
  if (games.length === 0) {
    return <p className="previous-games-empty">No previous games yet — create one above.</p>
  }

  return (
    <div className="previous-games-list">
      {games.map((game) => (
        <GameEntry key={game.roomCode} game={game} onResume={onResume} onDelete={onDelete} />
      ))}
    </div>
  )
}
