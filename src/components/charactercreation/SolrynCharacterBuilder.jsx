import { useState } from 'react'
import AbilityScoreStep from './AbilityScoreStep.jsx'
import RaceSelectionStep from './RaceSelectionStep.jsx'
import HPAndDRStep from './HPAndDRStep.jsx'
import MovementSpeedStep from './MovementSpeedStep.jsx'
import SkillSelectionStep from './SkillSelectionStep.jsx'
import SpellSelectionStep from './SpellSelectionStep.jsx'
import StartingGearStep from './StartingGearStep.jsx'
import ReviewScreen from './ReviewScreen.jsx'
import { createSolrynCharacter } from '../../services/characterService.js'
import './CharacterBuilder.css'

export default function SolrynCharacterBuilder({ roomId, uid, onClose, onCreated }) {
  const [step, setStep] = useState(1)
  const [characterData, setCharacterData] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleStepComplete(stepData) {
    setCharacterData((prev) => ({ ...prev, ...stepData }))
    setStep((s) => s + 1)
  }

  async function handleConfirm() {
    setSaving(true)
    setError(null)
    try {
      const result = await createSolrynCharacter(roomId, uid, characterData)
      onCreated?.(result)
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="character-builder-overlay">
      <div className="character-builder-modal">
        <h2>Create Solryn Character</h2>

        {step === 1 && <AbilityScoreStep onComplete={handleStepComplete} />}
        {step === 2 && (
          <RaceSelectionStep
            abilityScores={characterData.abilityScores}
            onBack={() => setStep(1)}
            onComplete={handleStepComplete}
          />
        )}
        {step === 3 && (
          <HPAndDRStep
            abilityScores={characterData.abilityScores}
            onBack={() => setStep(2)}
            onComplete={handleStepComplete}
          />
        )}
        {step === 4 && (
          <MovementSpeedStep
            abilityScores={characterData.abilityScores}
            onBack={() => setStep(3)}
            onComplete={handleStepComplete}
          />
        )}
        {step === 5 && <SkillSelectionStep onBack={() => setStep(4)} onComplete={handleStepComplete} />}
        {step === 6 && (
          <SpellSelectionStep
            abilityScores={characterData.abilityScores}
            race={characterData.race}
            onBack={() => setStep(5)}
            onComplete={handleStepComplete}
          />
        )}
        {step === 7 && (
          <StartingGearStep
            abilityScores={characterData.abilityScores}
            drBase={characterData.drBase}
            baseSpeed={characterData.baseSpeed}
            skillIds={characterData.skillIds}
            skills={characterData.skills}
            onBack={() => setStep(6)}
            onComplete={handleStepComplete}
          />
        )}
        {step === 8 && (
          <ReviewScreen
            characterData={characterData}
            onBack={(targetStep) => setStep(targetStep)}
            onConfirm={handleConfirm}
            saving={saving}
          />
        )}

        {error && <p className="cb-hint" style={{ color: '#ff5b6e' }}>Failed to create character: {error}</p>}

        <button onClick={onClose} style={{ alignSelf: 'flex-start' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
