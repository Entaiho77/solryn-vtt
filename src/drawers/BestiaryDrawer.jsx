import Drawer from './Drawer.jsx'
import './BestiaryDrawer.css'

function emptyCreature() {
  return { id: `c${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: '', notes: '' }
}

export default function BestiaryDrawer({ open, onClose, isGm, bestiary, onSave }) {
  function addCreature() {
    onSave([...bestiary, emptyCreature()])
  }

  function updateCreature(index, patch) {
    onSave(bestiary.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  function removeCreature(index) {
    onSave(bestiary.filter((_, i) => i !== index))
  }

  return (
    <Drawer side="left" title="Bestiary" open={open} onClose={onClose}>
      {!isGm && <p className="bestiary-hint">Only the GM can view the bestiary.</p>}
      {isGm && (
        <>
          {bestiary.length === 0 && <p className="bestiary-hint">No creatures added yet.</p>}
          <ul className="bestiary-list">
            {bestiary.map((creature, i) => (
              <li key={creature.id} className="bestiary-entry">
                <input
                  placeholder="Creature name"
                  value={creature.name}
                  onChange={(e) => updateCreature(i, { name: e.target.value })}
                />
                <textarea
                  placeholder="Notes (stats, abilities, etc.)"
                  value={creature.notes}
                  onChange={(e) => updateCreature(i, { notes: e.target.value })}
                />
                <button onClick={() => removeCreature(i)} aria-label="Remove creature">
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button onClick={addCreature}>Add creature</button>
        </>
      )}
    </Drawer>
  )
}
