import './EdgeButtonTabs.css'

export default function EdgeButtonTabs({ side, children }) {
  return <div className={`edge-button-tab edge-button-tab--${side}`}>{children}</div>
}
