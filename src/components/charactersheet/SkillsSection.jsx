export default function SkillsSection({ characterData }) {
  const skills = characterData.skills ?? { base: [], weapon: [], crafting: null }

  return (
    <div className="cs-skills">
      <div className="cs-skills-group">
        <h5>Base Skills</h5>
        {skills.base.map((name) => (
          <p key={name}>+ {name}</p>
        ))}
      </div>
      <div className="cs-skills-group">
        <h5>Weapon Skills</h5>
        {skills.weapon.map((name) => (
          <p key={name}>+ {name}</p>
        ))}
      </div>
      <div className="cs-skills-group">
        <h5>Crafting</h5>
        <p>+ {skills.crafting}</p>
      </div>
    </div>
  )
}
