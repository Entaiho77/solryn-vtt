import './Drawer.css'

export default function Drawer({ side, title, open, onClose, children }) {
  return (
    <div className={`drawer drawer--${side} ${open ? 'drawer--open' : ''}`}>
      <div className="drawer-header">
        <h2>{title}</h2>
        <button className="drawer-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="drawer-body">{children}</div>
    </div>
  )
}
