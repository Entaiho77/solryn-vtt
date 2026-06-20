import { useRef, useState } from 'react'
import './Toolbar.css'

const TOKEN_COLORS = ['#5b8cff', '#ff5b6e', '#4cd97b', '#ffc24c', '#c45bff']

export default function Toolbar({
  onLoadMap,
  onAddToken,
  roomLink,
  presenceCount,
  connected,
  isGm,
  onToggleDice,
  onToggleTurn,
  onToggleSheet,
  onToggleFog,
  themeToggle,
}) {
  const fileInputRef = useRef(null)
  const [copied, setCopied] = useState(false)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => onLoadMap(img)
    img.src = URL.createObjectURL(file)
    e.target.value = ''
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(roomLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        {isGm && (
          <button onClick={() => fileInputRef.current.click()}>Load map</button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
        <button
          onClick={() =>
            onAddToken(TOKEN_COLORS[Math.floor(Math.random() * TOKEN_COLORS.length)])
          }
        >
          Add token
        </button>
        <button onClick={onToggleDice}>Dice</button>
        <button onClick={onToggleSheet}>Sheet</button>
        <button onClick={onToggleTurn}>Turn order</button>
        {isGm && <button onClick={onToggleFog}>Fog</button>}
        <button onClick={handleCopyLink}>
          {copied ? 'Link copied!' : 'Copy room link'}
        </button>
      </div>
      <div className="toolbar-group">
        {themeToggle}
        <span className="role-pill">{isGm ? 'GM' : 'Player'}</span>
        <span className={`presence-pill ${connected ? 'is-connected' : 'is-disconnected'}`}>
          {connected ? `● ${presenceCount} connected` : '○ reconnecting…'}
        </span>
      </div>
    </div>
  )
}
