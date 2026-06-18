import { useTheme } from './ThemeContext.jsx'
import './ThemeToggle.css'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
      {theme === 'dark' ? '🌙 Dark' : '📜 Parchment'}
    </button>
  )
}
