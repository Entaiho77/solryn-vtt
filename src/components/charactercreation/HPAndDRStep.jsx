import { calculateDrBase, calculateHp, getModifier } from '../../utils/solrynCharacterRules.js'

export default function HPAndDRStep({ abilityScores, onBack, onComplete }) {
  const endMod = getModifier(abilityScores.endurance)
  const nimMod = getModifier(abilityScores.nimbleness)
  const hp = calculateHp(abilityScores)
  const drBase = calculateDrBase(abilityScores)

  return (
    <div className="character-builder-step">
      <h3>Step 3: Hit Points &amp; Damage Reduction</h3>
      <div className="cb-calc-block">
        {`Hit Points (HP)\n= Endurance + Endurance Modifier\n= ${abilityScores.endurance} + ${endMod}\n= ${hp} HP\n\nDamage Reduction (DR) — Base (armor not selected yet)\n= 0 (armor) + ${nimMod} (Nimbleness) + ${endMod} (Endurance)\n= ${drBase} DR base`}
      </div>
      <p className="cb-hint">DR will increase when you select armor in Step 7.</p>
      <div className="cb-actions">
        <button onClick={onBack}>Back</button>
        <button onClick={() => onComplete({ hp, drBase })}>Next</button>
      </div>
    </div>
  )
}
