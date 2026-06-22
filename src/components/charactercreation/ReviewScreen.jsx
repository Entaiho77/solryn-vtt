import { useState } from 'react'
import { ABILITY_LABELS, ABILITY_ORDER, getModifier } from '../../utils/solrynCharacterRules.js'

const STEP_LABELS = {
  1: 'Ability Scores',
  2: 'Race',
  3: 'HP / DR',
  4: 'Speed',
  5: 'Skills',
  6: 'Spells',
  7: 'Gear',
}

export default function ReviewScreen({ characterData, onBack, onConfirm, saving }) {
  const [showStepPicker, setShowStepPicker] = useState(false)
  const { abilityScores, race, hp, finalDR, finalSpeed, skills, spells, bonusSpells, gear } = characterData

  return (
    <div className="character-builder-step">
      <h3>Review &amp; Confirm</h3>

      <div className="cb-review-section">
        <h4>Ability Scores</h4>
        {ABILITY_ORDER.map((ability) => (
          <div key={ability}>
            {ABILITY_LABELS[ability]}: {abilityScores[ability]} ({getModifier(abilityScores[ability]) >= 0 ? '+' : ''}
            {getModifier(abilityScores[ability])})
          </div>
        ))}
      </div>

      <div className="cb-review-section">
        <h4>Race</h4>
        <div>{race}</div>
      </div>

      <div className="cb-review-section">
        <h4>Hit Points, Damage Reduction &amp; Speed</h4>
        <div>HP: {hp}</div>
        <div>DR: {finalDR}</div>
        <div>Speed: {finalSpeed} ft</div>
      </div>

      <div className="cb-review-section">
        <h4>Skills</h4>
        <div>Base: {skills.base.join(', ')}</div>
        <div>Weapon: {skills.weapon.join(', ')}</div>
        <div>Crafting: {skills.crafting}</div>
      </div>

      <div className="cb-review-section">
        <h4>Spells</h4>
        {bonusSpells?.length > 0 && <div>Bonus (Elf): {bonusSpells.join(', ')}</div>}
        <div>{spells.length} selected: {spells.join(', ')}</div>
      </div>

      <div className="cb-review-section">
        <h4>Starting Gear</h4>
        <div>Armor: {gear.armor?.name}</div>
        <div>Weapon: {gear.weapon?.name} ({gear.weapon?.damage} {gear.weapon?.damageType})</div>
        <div>Toolset: {gear.toolset?.name}</div>
        <div className="cb-hint">Backpack: {gear.backpack?.join(', ')}</div>
      </div>

      <div className="cb-actions">
        <div>
          <button onClick={() => setShowStepPicker((s) => !s)}>← Back to Edit</button>
          {showStepPicker && (
            <div className="cb-step-picker">
              {Object.entries(STEP_LABELS).map(([step, label]) => (
                <button key={step} onClick={() => onBack(Number(step))}>
                  {step}: {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button disabled={saving} onClick={onConfirm}>
          {saving ? 'Creating…' : 'Confirm & Create →'}
        </button>
      </div>
    </div>
  )
}
