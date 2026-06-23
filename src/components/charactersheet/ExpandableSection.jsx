export default function ExpandableSection({ header, isExpanded, onToggle, children }) {
  return (
    <div className="cs-expandable">
      <button className="cs-expandable-header" onClick={onToggle}>
        <span>{header}</span>
        <span className={`cs-chevron ${isExpanded ? 'is-expanded' : ''}`} aria-hidden="true">
          ▸
        </span>
      </button>
      {isExpanded && <div className="cs-expandable-content">{children}</div>}
    </div>
  )
}
