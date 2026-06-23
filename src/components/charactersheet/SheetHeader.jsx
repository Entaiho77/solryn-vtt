export default function SheetHeader({ characterData, portrait, name }) {
  return (
    <div className="cs-header">
      <div className="cs-portrait">
        {portrait ? <img src={portrait} alt="" /> : <span className="cs-portrait-placeholder">?</span>}
      </div>
      <div className="cs-header-info">
        <h3 className="cs-character-name">{name}</h3>
        <p className="cs-character-subline">{characterData.race} &middot; Level 1</p>
      </div>
    </div>
  )
}
