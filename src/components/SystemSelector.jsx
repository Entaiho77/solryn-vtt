const SYSTEMS = ['D&D 5e', 'Pathfinder 2e', 'Call of Cthulhu', 'Generic / Custom']

export default function SystemSelector({ value, onChange }) {
  return (
    <label className="system-selector">
      Game System
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {SYSTEMS.map((system) => (
          <option key={system} value={system}>
            {system}
          </option>
        ))}
      </select>
    </label>
  )
}
