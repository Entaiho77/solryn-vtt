import { useState } from 'react'
import Drawer from './Drawer.jsx'
import './TurnDrawer.css'

export default function TurnDrawer({
  open,
  onClose,
  isGm,
  tokens,
  turn,
  onSetOrder,
  onAdvance,
  onClear,
}) {
  const order = turn?.order ?? []
  const currentIndex = turn?.currentIndex ?? 0
  const [selected, setSelected] = useState([])

  function toggleSelected(tokenId) {
    setSelected((prev) =>
      prev.includes(tokenId) ? prev.filter((id) => id !== tokenId) : [...prev, tokenId],
    )
  }

  function startCombat() {
    if (selected.length) onSetOrder(selected)
  }

  const tokensById = new Map(tokens.map((t) => [t.id, t]))

  return (
    <Drawer side="right" title="Turn order" open={open} onClose={onClose}>
      {order.length > 0 ? (
        <>
          <ol className="turn-order">
            {order.map((tokenId, i) => {
              const token = tokensById.get(tokenId)
              return (
                <li key={tokenId} className={i === currentIndex ? 'is-current' : ''}>
                  <span
                    className="turn-order-swatch"
                    style={{ background: token?.color ?? '#888' }}
                  />
                  {token ? `Token ${i + 1}` : 'Removed token'}
                  {i === currentIndex && <span className="turn-order-tag">now</span>}
                </li>
              )
            })}
          </ol>
          {isGm && (
            <div className="turn-controls">
              <button onClick={onAdvance}>Next turn</button>
              <button onClick={onClear}>End combat</button>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="turn-empty">No combat in progress.</p>
          {isGm && (
            <>
              <p className="turn-hint">Pick tokens to set the initiative order:</p>
              <ul className="turn-picker">
                {tokens.map((t) => (
                  <li key={t.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selected.includes(t.id)}
                        onChange={() => toggleSelected(t.id)}
                      />
                      <span className="turn-order-swatch" style={{ background: t.color }} />
                      Token
                    </label>
                  </li>
                ))}
              </ul>
              <button onClick={startCombat} disabled={!selected.length}>
                Start combat
              </button>
            </>
          )}
        </>
      )}
    </Drawer>
  )
}
