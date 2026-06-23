import { useState } from 'react'
import { rollDiceExpression } from '../../utils/diceRoller.js'
import { getModifier } from '../../utils/solrynCharacterRules.js'

export default function AttacksSection({ sheetData, onRollDice }) {
  const [lastResult, setLastResult] = useState(null)
  const weapons = sheetData['equipped-weapons'] ?? [null, null, null]

  function handleRoll(weapon) {
    const rolled = rollDiceExpression(weapon.damage)
    if (!rolled) return

    const strMod = getModifier(sheetData.strength)
    const nimMod = getModifier(sheetData.nimbleness)
    const abilityModifier = Math.max(strMod, nimMod)
    const abilityName = strMod >= nimMod ? 'Strength' : 'Nimbleness'
    const total = rolled.total + abilityModifier

    onRollDice?.({
      expression: `${weapon.damage} (${weapon.name})`,
      rolls: rolled.rolls,
      modifier: rolled.modifier + abilityModifier,
      total,
    })

    setLastResult(
      `Rolled ${weapon.damage}: ${rolled.total} + ${abilityModifier} (${abilityName}) = ${total} damage`,
    )
  }

  return (
    <div className="cs-section">
      <h4 className="cs-section-label">Attacks</h4>
      <div className="cs-attacks-list">
        {weapons.map((weapon, i) =>
          weapon ? (
            <button key={i} className="cs-weapon-card" onClick={() => handleRoll(weapon)}>
              <span className="cs-weapon-name">{weapon.name}</span>
              <span className="cs-weapon-damage">
                {weapon.damage} {weapon.type}
              </span>
              {weapon.skill && <span className="cs-weapon-skill">Skill: {weapon.skill}</span>}
            </button>
          ) : (
            <div key={i} className="cs-weapon-card cs-weapon-card-empty">
              (Empty — weapon swapping coming soon)
            </div>
          ),
        )}
      </div>
      {lastResult && <p className="cs-roll-result">{lastResult}</p>}
    </div>
  )
}
