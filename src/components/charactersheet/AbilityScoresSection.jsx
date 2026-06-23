import { ABILITY_LABELS, ABILITY_ORDER, getModifier } from '../../utils/solrynCharacterRules.js'

const ABILITY_SHORT = {
  strength: 'STR',
  nimbleness: 'NIM',
  endurance: 'END',
  wisdom: 'WIS',
  intelligence: 'INT',
  arcana: 'ARC',
  luck: 'LCK',
}

export default function AbilityScoresSection({ sheetData }) {
  return (
    <div className="cs-section">
      <h4 className="cs-section-label">Ability Scores</h4>
      <div className="cs-ability-grid">
        {ABILITY_ORDER.map((ability) => {
          const score = sheetData[ability]
          const modifier = getModifier(score)
          return (
            <div key={ability} className="cs-ability-box" title={ABILITY_LABELS[ability]}>
              <span className="cs-ability-label">{ABILITY_SHORT[ability]}</span>
              <span className="cs-ability-score">{score}</span>
              <span className="cs-ability-modifier">{modifier >= 0 ? `+${modifier}` : modifier}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
