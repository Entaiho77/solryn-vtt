export default function CombatStatsSection({ sheetData, onUpdate, isEditable }) {
  const maxHp = sheetData['max-hp']

  function handleHpChange(value) {
    const n = Number(value)
    if (Number.isNaN(n)) return
    onUpdate('hp', Math.min(Math.max(n, 0), maxHp))
  }

  function handleDrChange(value) {
    const n = Number(value)
    if (Number.isNaN(n)) return
    onUpdate('dr', Math.max(n, 0))
  }

  return (
    <div className="cs-section">
      <h4 className="cs-section-label">Combat Stats</h4>
      <div className="cs-combat-grid">
        <label className="cs-stat-field">
          <span>HP</span>
          <div className="cs-stat-value-row">
            <input
              type="number"
              value={sheetData.hp}
              disabled={!isEditable}
              onChange={(e) => handleHpChange(e.target.value)}
            />
            <span className="cs-stat-max">/ {maxHp}</span>
          </div>
        </label>
        <label className="cs-stat-field">
          <span>DR</span>
          <input
            type="number"
            value={sheetData.dr}
            disabled={!isEditable}
            onChange={(e) => handleDrChange(e.target.value)}
          />
        </label>
        <div className="cs-stat-field">
          <span>Speed</span>
          <div className="cs-stat-readonly">{sheetData.speed} ft</div>
        </div>
      </div>
    </div>
  )
}
