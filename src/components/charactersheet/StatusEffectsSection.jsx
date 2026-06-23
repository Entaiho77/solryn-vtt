export default function StatusEffectsSection({ statusEffects, onRemove, isEditable }) {
  const effects = statusEffects ?? []

  if (effects.length === 0) {
    return (
      <div className="cs-status-effects">
        <p className="cs-hint">No active status effects</p>
      </div>
    )
  }

  return (
    <div className="cs-status-effects">
      {effects.map((effect) => (
        <div key={effect.id} className="cs-status-effect">
          <span className="cs-status-swatch" style={{ background: effect.color }} />
          <span>{effect.name}</span>
          {isEditable && (
            <button onClick={() => onRemove(effect.id)} aria-label="Remove status effect">
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
