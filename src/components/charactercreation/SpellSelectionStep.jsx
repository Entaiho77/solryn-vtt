import { useEffect, useState } from 'react'
import { solrynApi } from '../../services/solrynAPI.js'
import { calculateSpellsKnown, getModifier } from '../../utils/solrynCharacterRules.js'

export default function SpellSelectionStep({ abilityScores, race, onBack, onComplete }) {
  const [spells, setSpells] = useState(null)
  const [selectedSpells, setSelectedSpells] = useState([])

  useEffect(() => {
    solrynApi.fetchList('spells').then((data) => setSpells(data.spells ?? data))
  }, [])

  const arcanaMod = getModifier(abilityScores.arcana)
  const spellsKnown = calculateSpellsKnown(abilityScores)
  const isElf = race === 'Elf'
  const bonusSpells = isElf && spells ? spells.filter((s) => !s.damage).slice(0, 3).map((s) => s.name) : []

  function toggleSpell(name) {
    setSelectedSpells((prev) => {
      if (prev.includes(name)) return prev.filter((s) => s !== name)
      if (prev.length >= spellsKnown) return prev
      return [...prev, name]
    })
  }

  return (
    <div className="character-builder-step">
      <h3>Step 6: Spells</h3>
      <div className="cb-calc-block">
        {`Spells Known\n= (Arcana Modifier × 2) + 1\n= (${arcanaMod} × 2) + 1\n= ${spellsKnown} total spells`}
      </div>
      {isElf && (
        <p className="cb-hint">
          You are an Elf — you automatically know 3 bonus non-damaging spells: {bonusSpells.join(', ')}.
        </p>
      )}
      <p className="cb-hint">Selected: {selectedSpells.length}/{spellsKnown}</p>

      {!spells && <p className="cb-hint">Loading spells…</p>}
      {spells && (
        <div className="cb-checkbox-list" style={{ maxHeight: 280 }}>
          {spells.map((spell) => (
            <label key={spell.id}>
              <input
                type="checkbox"
                checked={selectedSpells.includes(spell.name)}
                onChange={() => toggleSpell(spell.name)}
              />
              {spell.name} {spell.damage ? `(${spell.damage} ${spell.damageType})` : '(non-damaging)'}
            </label>
          ))}
        </div>
      )}

      <div className="cb-actions">
        <button onClick={onBack}>Back</button>
        <button
          disabled={selectedSpells.length !== spellsKnown}
          onClick={() => onComplete({ spellsKnown, spells: selectedSpells, bonusSpells })}
        >
          Next
        </button>
      </div>
    </div>
  )
}
