import Drawer from './Drawer.jsx'
import './FogDrawer.css'

export default function FogDrawer({
  open,
  onClose,
  fog,
  brushActive,
  onToggleEnabled,
  onToggleBrush,
  onClear,
}) {
  const enabled = fog?.enabled ?? false

  return (
    <Drawer side="right" title="Fog of war" open={open} onClose={onClose}>
      <label className="fog-toggle">
        <input type="checkbox" checked={enabled} onChange={(e) => onToggleEnabled(e.target.checked)} />
        Fog enabled
      </label>

      {enabled && (
        <>
          <button
            className={brushActive ? 'is-active' : ''}
            onClick={() => onToggleBrush(!brushActive)}
          >
            {brushActive ? 'Stop revealing' : 'Reveal/hide cells'}
          </button>
          {brushActive && (
            <p className="fog-hint">
              Click and drag on the board to toggle cells between hidden and revealed.
            </p>
          )}
          <button onClick={onClear}>Hide everything again</button>
        </>
      )}
    </Drawer>
  )
}
