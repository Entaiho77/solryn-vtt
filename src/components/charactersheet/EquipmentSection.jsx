export default function EquipmentSection({ characterData }) {
  const gear = characterData.gear ?? {}

  return (
    <div className="cs-equipment">
      {gear.armor && (
        <div className="cs-equipment-group">
          <h5>Armor</h5>
          <p>
            {gear.armor.name} (DR {gear.armor.dr}{gear.armor.speedPenalty ? `, -${gear.armor.speedPenalty} ft` : ''})
          </p>
        </div>
      )}
      {gear.weapon && (
        <div className="cs-equipment-group">
          <h5>Starting Weapon</h5>
          <p>
            {gear.weapon.name} ({gear.weapon.damage} {gear.weapon.damageType})
          </p>
        </div>
      )}
      {gear.toolset && (
        <div className="cs-equipment-group">
          <h5>Toolset</h5>
          <p>{gear.toolset.name}</p>
        </div>
      )}
      {gear.backpack?.length > 0 && (
        <div className="cs-equipment-group">
          <h5>Backpack</h5>
          <p className="cs-backpack-list">{gear.backpack.join(', ')}</p>
        </div>
      )}
    </div>
  )
}
