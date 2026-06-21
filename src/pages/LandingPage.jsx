import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase.js'
import { signUp, logIn, logOut } from '../services/firebaseAuth.js'
import {
  getLastSystem,
  setLastSystem,
  createGame,
  loadPreviousGames,
  touchLastPlayed,
  deleteGame,
} from '../services/gameService.js'
import { roomShareLink } from '../sync/roomId.js'
import LoginForm from '../components/LoginForm.jsx'
import SystemSelector from '../components/SystemSelector.jsx'
import PreviousGamesList from '../components/PreviousGamesList.jsx'
import '../styles/landingPage.css'

function goToRoom(roomCode) {
  window.location.href = roomShareLink(roomCode)
}

export default function LandingPage() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [gameName, setGameName] = useState('')
  const [system, setSystem] = useState('D&D 5e')
  const [games, setGames] = useState([])
  const [createError, setCreateError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u && !u.isAnonymous ? u : null)
      setAuthChecked(true)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) return
    getLastSystem(user.uid).then((saved) => {
      if (saved) setSystem(saved)
    })
    loadPreviousGames(user.uid).then(setGames)
  }, [user])

  function handleLogin(email, password) {
    setAuthError(null)
    logIn(email, password).catch((err) => setAuthError(err.message))
  }

  function handleSignUp(email, password) {
    setAuthError(null)
    signUp(email, password).catch((err) => setAuthError(err.message))
  }

  async function handleCreateGame() {
    if (!gameName.trim()) {
      setCreateError('Enter a game name.')
      return
    }
    setCreateError(null)
    const roomCode = await createGame(user.uid, { gameName: gameName.trim(), system })
    await setLastSystem(user.uid, system)
    goToRoom(roomCode)
  }

  async function handleResume(game) {
    await touchLastPlayed(user.uid, game.roomCode)
    goToRoom(game.roomCode)
  }

  async function handleDelete(game) {
    await deleteGame(user.uid, game.roomCode)
    setGames((gs) => gs.filter((g) => g.roomCode !== game.roomCode))
  }

  if (!authChecked) return null

  if (!user) {
    return (
      <div className="landing-page">
        <div className="landing-card">
          <h1>Tabletop</h1>
          <LoginForm onLogin={handleLogin} onSignUp={handleSignUp} error={authError} />
        </div>
      </div>
    )
  }

  return (
    <div className="landing-page">
      <div className="landing-card">
        <div className="landing-header">
          <h1>Tabletop</h1>
          <button type="button" className="dialog-button" onClick={logOut}>
            Log Out
          </button>
        </div>

        <section className="new-game-section">
          <h2>New Game</h2>
          <label className="game-name-label">
            Game Name
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="e.g. Curse of Strahd"
            />
          </label>
          <SystemSelector value={system} onChange={setSystem} />
          {createError && <p className="login-error">{createError}</p>}
          <button type="button" className="dialog-button primary" onClick={handleCreateGame}>
            Create Game
          </button>
        </section>

        <section className="previous-games-section">
          <h2>Previous Games</h2>
          <PreviousGamesList games={games} onResume={handleResume} onDelete={handleDelete} />
        </section>
      </div>
    </div>
  )
}
