import { useState } from 'react'
import { ABILITY_ORDER, ABILITY_LABELS, getModifier, rollAbilityScore } from '../../utils/solrynCharacterRules.js'

export default function AbilityScoreStep({ onComplete }) {
  const [scores, setScores] = useState({})

  const rolledCount = Object.keys(scores).length
  const nextAbility = ABILITY_ORDER[rolledCount]
  const allRolled = rolledCount === ABILITY_ORDER.length

  function rollNext() {
    if (!nextAbility) return
    setScores((prev) => ({ ...prev, [nextAbility]: rollAbilityScore() }))
  }

  function rollAll() {
    const result = { ...scores }
    for (const ability of ABILITY_ORDER) {
      if (result[ability] === undefined) result[ability] = rollAbilityScore()
    }
    setScores(result)
  }

  return (
    <div className="character-builder-step">
      <h3>Step 1: Ability Scores</h3>
      <p className="cb-hint">Roll 2d4 for each ability score, in order. Rolls are fixed once shown.</p>

      {ABILITY_ORDER.map((ability) => (
        <div className="cb-ability-row" key={ability}>
          <span>{ABILITY_LABELS[ability]}</span>
          {scores[ability] !== undefined ? (
            <span className="cb-ability-result">
              {scores[ability]} ({getModifier(scores[ability]) >= 0 ? '+' : ''}
              {getModifier(scores[ability])} modifier)
            </span>
          ) : (
            <span className="cb-hint">waiting</span>
          )}
        </div>
      ))}

      <div className="cb-actions">
        <span className="character-builder-progress">{rolledCount} of {ABILITY_ORDER.length} rolled</span>
        <div>
          {!allRolled && <button onClick={rollNext}>Roll {ABILITY_LABELS[nextAbility]}</button>}
          {!allRolled && <button onClick={rollAll}>Roll all</button>}
          <button disabled={!allRolled} onClick={() => onComplete({ abilityScores: scores })}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
