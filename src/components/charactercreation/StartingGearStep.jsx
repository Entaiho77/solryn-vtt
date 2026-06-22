import { useEffect, useState } from 'react'
import { solrynApi } from '../../services/solrynAPI.js'
import { getWeaponsForSkills } from '../../utils/solrynCharacterRules.js'

const BACKPACK_ITEMS = [
  '50 ft rope',
  '3 days rations',
  'cook set',
  'tinderbox',
  'bedroll',
  'tarp',
  'lantern',
  'oil',
  'torches',
  '3 Healing Potions (1d4 each)',
]

export default function StartingGearStep({ abilityScores, drBase, baseSpeed, skillIds, skills, onBack, onComplete }) {
  const [equipment, setEquipment] = useState(null)
  const [selectedArmor, setSelectedArmor] = useState(null)
  const [selectedWeapon, setSelectedWeapon] = useState(null)

  useEffect(() => {
    solrynApi.fetchList('equipment').then(setEquipment)
  }, [])

  const armorOptions = equipment ? equipment.filter((e) => e.category === 'Armor' && e.speedPenalty <= 5) : []
  const weaponOptions = equipment
    ? getWeaponsForSkills(equipment.filter((e) => e.category === 'Weapon'), skillIds.weapon)
    : []

  const finalDR = (selectedArmor?.dr ?? 0) + drBase
  const finalSpeed = baseSpeed - (selectedArmor?.speedPenalty ?? 0)
  const toolsetName = `${skills.crafting} Tools`

  return (
    <div className="character-builder-step">
      <h3>Step 7: Starting Gear</h3>
      {!equipment && <p className="cb-hint">Loading equipment…</p>}

      {equipment && (
        <>
          <div className="cb-skill-section">
            <strong>Armor (choose one — Light or Medium)</strong>
            <div className="cb-checkbox-list">
              {armorOptions.map((armor) => (
                <label key={armor.id}>
                  <input
                    type="radio"
                    name="armor"
                    checked={selectedArmor?.id === armor.id}
                    onChange={() => setSelectedArmor(armor)}
                  />
                  {armor.name} (DR {armor.dr}{armor.speedPenalty ? `, -${armor.speedPenalty} ft` : ''})
                </label>
              ))}
            </div>
          </div>

          <div className="cb-skill-section">
            <strong>Weapon (choose one — matches your weapon skills)</strong>
            <div className="cb-checkbox-list">
              {weaponOptions.map((weapon) => (
                <label key={weapon.id}>
                  <input
                    type="radio"
                    name="weapon"
                    checked={selectedWeapon?.id === weapon.id}
                    onChange={() => setSelectedWeapon(weapon)}
                  />
                  {weapon.name} ({weapon.damage} {weapon.damageType})
                </label>
              ))}
            </div>
          </div>

          <div className="cb-skill-section">
            <strong>Toolset (auto-selected)</strong>
            <p>{toolsetName}</p>
          </div>

          <div className="cb-skill-section">
            <strong>Backpack (auto-included)</strong>
            <p className="cb-hint">{BACKPACK_ITEMS.join(', ')}</p>
          </div>

          <div className="cb-calc-block">
            {`Final Damage Reduction\n= ${selectedArmor?.dr ?? 0} (${selectedArmor?.name ?? 'no armor'}) + ${drBase} (Nimbleness + Endurance)\n= ${finalDR} DR\n\nFinal Movement Speed\n= ${baseSpeed} ft base${selectedArmor?.speedPenalty ? ` - ${selectedArmor.speedPenalty} ft (${selectedArmor.name})` : ' (no penalty)'}\n= ${finalSpeed} ft`}
          </div>
        </>
      )}

      <div className="cb-actions">
        <button onClick={onBack}>Back</button>
        <button
          disabled={!selectedArmor || !selectedWeapon}
          onClick={() =>
            onComplete({
              gear: {
                armor: selectedArmor,
                weapon: selectedWeapon,
                toolset: { id: skillIds.crafting, name: toolsetName },
                backpack: BACKPACK_ITEMS,
              },
              finalDR,
              finalSpeed,
            })
          }
        >
          Next
        </button>
      </div>
    </div>
  )
}
