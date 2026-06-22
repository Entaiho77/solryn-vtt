import { useEffect, useState } from 'react'
import { solrynApi } from '../../services/solrynAPI.js'
import { ABILITY_LABELS, ABILITY_ORDER, getModifier } from '../../utils/solrynCharacterRules.js'

function bonusChoices(bonus) {
  if (bonus.stat === 'any') return ABILITY_ORDER
  if (bonus.stat.includes('-or-')) return bonus.stat.split('-or-')
  return null
}

export default function RaceSelectionStep({ abilityScores, onBack, onComplete }) {
  const [races, setRaces] = useState(null)
  const [error, setError] = useState(null)
  const [selectedRace, setSelectedRace] = useState(null)
  const [choices, setChoices] = useState({}) // bonus index -> chosen stat

  useEffect(() => {
    solrynApi
      .fetchList('races')
      .then((data) => setRaces(data.races ?? data))
      .catch((e) => setError(e.message))
  }, [])

  function selectRace(race) {
    setSelectedRace(race)
    setChoices({})
  }

  function computeFinalScores() {
    if (!selectedRace) return abilityScores
    const result = { ...abilityScores }
    selectedRace.bonuses.forEach((bonus, i) => {
      const choiceOptions = bonusChoices(bonus)
      const stat = choiceOptions ? choices[i] : bonus.stat
      if (stat && result[stat] !== undefined) result[stat] += bonus.value
    })
    return result
  }

  const finalScores = computeFinalScores()
  const readyToChoose = selectedRace
    ? selectedRace.bonuses.every((bonus, i) => !bonusChoices(bonus) || choices[i])
    : false

  return (
    <div className="character-builder-step">
      <h3>Step 2: Race Selection</h3>
      {!races && !error && <p className="cb-hint">Loading races…</p>}
      {error && <p className="cb-hint">Failed to load races: {error}</p>}
      <div className="cb-grid">
        {races?.map((race) => (
          <button
            key={race.id}
            className={`cb-card ${selectedRace?.id === race.id ? 'is-selected' : ''}`}
            onClick={() => selectRace(race)}
          >
            <h4>{race.name}</h4>
            <p>
              {race.bonuses
                .map((b) => `+${b.value} ${b.stat === 'any' ? '(any stat)' : b.stat}`)
                .join(', ')}
            </p>
            {race.advantages.slice(0, 2).map((a) => (
              <p key={a}>• {a}</p>
            ))}
            <p>Weakness: {race.weakness}</p>
          </button>
        ))}
      </div>

      {selectedRace && (
        <>
          {selectedRace.bonuses.map((bonus, i) => {
            const options = bonusChoices(bonus)
            if (!options) return null
            return (
              <label key={i} className="cb-hint" style={{ display: 'block', marginTop: '0.5rem' }}>
                Choose stat for +{bonus.value} bonus ({bonus.note ?? bonus.stat}):{' '}
                <select value={choices[i] ?? ''} onChange={(e) => setChoices((c) => ({ ...c, [i]: e.target.value }))}>
                  <option value="" disabled>
                    Select…
                  </option>
                  {options.map((stat) => (
                    <option key={stat} value={stat}>
                      {ABILITY_LABELS[stat]}
                    </option>
                  ))}
                </select>
              </label>
            )
          })}

          <div className="cb-calc-block" style={{ marginTop: '0.75rem' }}>
            {ABILITY_ORDER.map((ability) => (
              <div key={ability}>
                {ABILITY_LABELS[ability]}: {abilityScores[ability]} ({getModifier(abilityScores[ability])>=0?'+':''}{getModifier(abilityScores[ability])}) →{' '}
                {finalScores[ability]} ({getModifier(finalScores[ability])>=0?'+':''}{getModifier(finalScores[ability])})
              </div>
            ))}
          </div>
        </>
      )}

      <div className="cb-actions">
        <button onClick={onBack}>Back</button>
        <button
          disabled={!selectedRace || !readyToChoose}
          onClick={() => onComplete({ race: selectedRace.name, abilityScores: finalScores })}
        >
          Next
        </button>
      </div>
    </div>
  )
}
