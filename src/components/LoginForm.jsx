import { useState } from 'react'

export default function LoginForm({ onLogin, onSignUp, error }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (mode === 'login') {
      onLogin(email, password)
    } else {
      onSignUp(email, password)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>{mode === 'login' ? 'GM Login' : 'Create GM Account'}</h2>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </label>
      {error && <p className="login-error">{error}</p>}
      <button type="submit" className="dialog-button primary">
        {mode === 'login' ? 'Log In' : 'Sign Up'}
      </button>
      <button
        type="button"
        className="login-switch-mode"
        onClick={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}
      >
        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
      </button>
    </form>
  )
}
