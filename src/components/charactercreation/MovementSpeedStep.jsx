import { calculateBaseSpeed, getModifier } from '../../utils/solrynCharacterRules.js'

export default function MovementSpeedStep({ abilityScores, onBack, onComplete }) {
  const strMod = getModifier(abilityScores.strength)
  const endMod = getModifier(abilityScores.endurance)
  const baseSpeed = calculateBaseSpeed(abilityScores)

  return (
    <div className="character-builder-step">
      <h3>Step 4: Movement Speed</h3>
      <div className="cb-calc-block">
        {`Movement Speed (Base)\n= 10 + ((Strength Modifier + Endurance Modifier) × 5)\n= 10 + ((${strMod} + ${endMod}) × 5)\n= 10 + ${(strMod + endMod) * 5}\n= ${baseSpeed} ft`}
      </div>
      <p className="cb-hint">Speed will be reduced if you select medium or heavy armor in Step 7.</p>
      <div className="cb-actions">
        <button onClick={onBack}>Back</button>
        <button onClick={() => onComplete({ baseSpeed })}>Next</button>
      </div>
    </div>
  )
}
