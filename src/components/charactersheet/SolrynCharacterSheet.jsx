import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../../firebase.js'
import { updateSheetField } from '../../services/sheetService.js'
import SheetHeader from './SheetHeader.jsx'
import AbilityScoresSection from './AbilityScoresSection.jsx'
import CombatStatsSection from './CombatStatsSection.jsx'
import AttacksSection from './AttacksSection.jsx'
import ResourcesSection from './ResourcesSection.jsx'
import ExpandableSection from './ExpandableSection.jsx'
import SkillsSection from './SkillsSection.jsx'
import SpellsSection from './SpellsSection.jsx'
import EquipmentSection from './EquipmentSection.jsx'
import StatusEffectsSection from './StatusEffectsSection.jsx'
import NotesSection from './NotesSection.jsx'
import './CharacterSheet.css'

export default function SolrynCharacterSheet({ roomId, token, isEditable, onRollDice, onRemoveStatusEffect }) {
  const [characterData, setCharacterData] = useState(null)
  const [expanded, setExpanded] = useState({
    skills: true,
    spells: false,
    equipment: false,
    statusEffects: false,
    notes: false,
  })

  useEffect(() => {
    const characterRef = ref(db, `rooms/${roomId}/characters/${token.characterId}`)
    return onValue(characterRef, (snapshot) => setCharacterData(snapshot.val()))
  }, [roomId, token.characterId])

  function toggleSection(section) {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  function handleUpdate(fieldId, value) {
    updateSheetField(roomId, token.id, { [fieldId]: value })
  }

  if (!characterData || !token.sheet) return <p className="cs-hint">Loading character sheet…</p>

  // Lazy-init fields missing on characters created before this feature.
  const sheetData = {
    'arcana-points-max': 0,
    'arcana-points': 0,
    'luck-points-max': 0,
    'luck-points': 0,
    notes: '',
    'equipped-weapons': [null, null, null],
    ...token.sheet,
  }

  return (
    <div className="character-sheet">
      <SheetHeader characterData={characterData} portrait={token.portrait} name={token.label} />
      <AbilityScoresSection sheetData={sheetData} />
      <CombatStatsSection sheetData={sheetData} onUpdate={handleUpdate} isEditable={isEditable} />
      <AttacksSection sheetData={sheetData} onRollDice={onRollDice} />
      <ResourcesSection sheetData={sheetData} onUpdate={handleUpdate} isEditable={isEditable} />

      <ExpandableSection header="Skills" isExpanded={expanded.skills} onToggle={() => toggleSection('skills')}>
        <SkillsSection characterData={characterData} />
      </ExpandableSection>
      <ExpandableSection header="Spells" isExpanded={expanded.spells} onToggle={() => toggleSection('spells')}>
        <SpellsSection characterData={characterData} />
      </ExpandableSection>
      <ExpandableSection
        header="Equipment"
        isExpanded={expanded.equipment}
        onToggle={() => toggleSection('equipment')}
      >
        <EquipmentSection characterData={characterData} />
      </ExpandableSection>
      <ExpandableSection
        header="Status Effects"
        isExpanded={expanded.statusEffects}
        onToggle={() => toggleSection('statusEffects')}
      >
        <StatusEffectsSection
          statusEffects={token.statusEffects}
          onRemove={onRemoveStatusEffect}
          isEditable={isEditable}
        />
      </ExpandableSection>
      <ExpandableSection header="Notes" isExpanded={expanded.notes} onToggle={() => toggleSection('notes')}>
        <NotesSection notes={sheetData.notes} onUpdate={handleUpdate} isEditable={isEditable} />
      </ExpandableSection>
    </div>
  )
}
