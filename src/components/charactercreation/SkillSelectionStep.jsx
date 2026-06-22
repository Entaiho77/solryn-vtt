import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_SOLRYN_API_URL || 'http://localhost:3000'

function toggle(list, id, max) {
  if (list.includes(id)) return list.filter((s) => s !== id)
  if (list.length >= max) return list
  return [...list, id]
}

export default function SkillSelectionStep({ onBack, onComplete }) {
  const [skillData, setSkillData] = useState(null)
  const [baseSkills, setBaseSkills] = useState([])
  const [weaponSkills, setWeaponSkills] = useState([])
  const [craftingSkill, setCraftingSkill] = useState(null)

  useEffect(() => {
    fetch(`${BASE_URL}/api/skills`)
      .then((res) => res.json())
      .then(setSkillData)
  }, [])

  const isComplete = baseSkills.length === 3 && weaponSkills.length === 3 && !!craftingSkill

  return (
    <div className="character-builder-step">
      <h3>Step 5: Skills Selection</h3>
      {!skillData && <p className="cb-hint">Loading skills…</p>}

      {skillData && (
        <>
          <div className="cb-skill-section">
            <strong>Base Skills (select 3)</strong> — {baseSkills.length}/3 selected
            <div className="cb-checkbox-list">
              {skillData.baseSkills.map((skill) => (
                <label key={skill.id}>
                  <input
                    type="checkbox"
                    checked={baseSkills.includes(skill.id)}
                    onChange={() => setBaseSkills((prev) => toggle(prev, skill.id, 3))}
                  />
                  {skill.name}
                </label>
              ))}
            </div>
          </div>

          <div className="cb-skill-section">
            <strong>Weapon Skills (select 3)</strong> — {weaponSkills.length}/3 selected
            <div className="cb-checkbox-list">
              {skillData.weaponSkills.map((skill) => (
                <label key={skill.id}>
                  <input
                    type="checkbox"
                    checked={weaponSkills.includes(skill.id)}
                    onChange={() => setWeaponSkills((prev) => toggle(prev, skill.id, 3))}
                  />
                  {skill.name}
                </label>
              ))}
            </div>
          </div>

          <div className="cb-skill-section">
            <strong>Crafting/Trade Skill (select 1)</strong> — {craftingSkill ? 1 : 0}/1 selected
            <div className="cb-checkbox-list">
              {skillData.craftingSkills.map((skill) => (
                <label key={skill.id}>
                  <input
                    type="radio"
                    name="craftingSkill"
                    checked={craftingSkill === skill.id}
                    onChange={() => setCraftingSkill(skill.id)}
                  />
                  {skill.name}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="cb-actions">
        <button onClick={onBack}>Back</button>
        <button
          disabled={!isComplete}
          onClick={() => {
            const craftingSkillName = skillData.craftingSkills.find((s) => s.id === craftingSkill)?.name
            const baseNames = skillData.baseSkills.filter((s) => baseSkills.includes(s.id)).map((s) => s.name)
            const weaponNames = skillData.weaponSkills.filter((s) => weaponSkills.includes(s.id)).map((s) => s.name)
            onComplete({
              skills: { base: baseNames, weapon: weaponNames, crafting: craftingSkillName },
              skillIds: { base: baseSkills, weapon: weaponSkills, crafting: craftingSkill },
            })
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}
