import { useEffect, useRef, useState } from 'react'

export default function NotesSection({ notes, onUpdate, isEditable }) {
  const [localNotes, setLocalNotes] = useState(notes ?? '')
  const debounceRef = useRef(null)

  useEffect(() => {
    setLocalNotes(notes ?? '')
  }, [notes])

  function handleChange(value) {
    setLocalNotes(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onUpdate('notes', value), 1500)
  }

  return (
    <textarea
      className="cs-notes"
      value={localNotes}
      disabled={!isEditable}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Notes about your character…"
    />
  )
}
