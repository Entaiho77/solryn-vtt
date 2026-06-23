import { useEffect, useState } from 'react'
import { solrynApi } from '../../services/solrynAPI.js'

export default function SpellsSection({ characterData }) {
  const [spellData, setSpellData] = useState(null)
  const spellNames = characterData.spells ?? []
  const bonusSpells = characterData.bonusSpells ?? []
  const allNames = [...spellNames, ...bonusSpells]

  useEffect(() => {
    solrynApi.fetchList('spells').then(setSpellData).catch(() => setSpellData([]))
  }, [])

  return (
    <div className="cs-spells">
      <p className="cs-spells-count">{allNames.length} spells known</p>
      {allNames.map((name) => {
        const meta = spellData?.find((s) => s.name === name)
        return (
          <p key={name}>
            + {name} {meta?.damage ? `(${meta.damage} ${meta.damageType}, ${meta.range})` : '(utility)'}
          </p>
        )
      })}
    </div>
  )
}
