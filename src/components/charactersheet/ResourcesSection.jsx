function ResourceField({ label, current, max, fieldId, onUpdate, isEditable }) {
  function handleChange(value) {
    const n = Number(value)
    if (Number.isNaN(n)) return
    onUpdate(fieldId, Math.min(Math.max(n, 0), max))
  }

  return (
    <label className="cs-resource-field">
      <span>{label}</span>
      <div className="cs-stat-value-row">
        <input type="number" value={current} disabled={!isEditable} onChange={(e) => handleChange(e.target.value)} />
        <span className="cs-stat-max">/ {max}</span>
      </div>
    </label>
  )
}

export default function ResourcesSection({ sheetData, onUpdate, isEditable }) {
  return (
    <div className="cs-section">
      <h4 className="cs-section-label">Resources</h4>
      <div className="cs-resources-grid">
        <ResourceField
          label="Arcana Points"
          current={sheetData['arcana-points']}
          max={sheetData['arcana-points-max']}
          fieldId="arcana-points"
          onUpdate={onUpdate}
          isEditable={isEditable}
        />
        <ResourceField
          label="Luck Points"
          current={sheetData['luck-points']}
          max={sheetData['luck-points-max']}
          fieldId="luck-points"
          onUpdate={onUpdate}
          isEditable={isEditable}
        />
      </div>
    </div>
  )
}
