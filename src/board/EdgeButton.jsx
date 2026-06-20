export default function EdgeButton({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      className={`edge-button ${active ? 'is-active' : ''}`}
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )
}
