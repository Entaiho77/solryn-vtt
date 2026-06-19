import { useState } from 'react'
import Drawer from './Drawer.jsx'
import { rollDiceExpression } from '../utils/diceRoller.js'
import './DiceDrawer.css'

const QUICK_ROLLS = ['d20', '2d6', 'd6', 'd4', 'd8', 'd10', 'd12', 'd100']

export default function DiceDrawer({ open, onClose, diceLog, uid, onRoll }) {
  const [expression, setExpression] = useState('d20')
  const [error, setError] = useState(null)

  function roll(expr) {
    const result = rollDiceExpression(expr)
    if (!result) {
      setError(`Can't parse "${expr}" — try something like 2d6+3`)
      return
    }
    setError(null)
    onRoll(result)
  }

  const entries = Object.entries(diceLog).sort(
    ([, a], [, b]) => (b.rolledAt ?? 0) - (a.rolledAt ?? 0),
  )

  return (
    <Drawer side="left" title="Dice" open={open} onClose={onClose}>
      <div className="dice-quick-rolls">
        {QUICK_ROLLS.map((q) => (
          <button key={q} onClick={() => roll(q)}>
            {q}
          </button>
        ))}
      </div>

      <form
        className="dice-form"
        onSubmit={(e) => {
          e.preventDefault()
          roll(expression)
        }}
      >
        <input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="2d6+3"
        />
        <button type="submit">Roll</button>
      </form>
      {error && <p className="dice-error">{error}</p>}

      <ul className="dice-log">
        {entries.map(([id, entry]) => (
          <li key={id} className={entry.uid === uid ? 'is-mine' : ''}>
            <span className="dice-log-expr">{entry.expression}</span>
            <span className="dice-log-rolls">[{entry.rolls.join(', ')}]</span>
            {entry.modifier ? (
              <span className="dice-log-mod">
                {entry.modifier > 0 ? '+' : ''}
                {entry.modifier}
              </span>
            ) : null}
            <span className="dice-log-total">= {entry.total}</span>
          </li>
        ))}
      </ul>
    </Drawer>
  )
}
