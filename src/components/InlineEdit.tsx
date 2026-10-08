import { useRef, useState } from 'react'

interface Props {
  value: string
  maxLength: number
  onSave: (next: string) => void
  /** Class for the name text, so each list keeps its own styling. */
  className?: string
}

/** A name that turns into a text field on ✎ click or double-click. Enter/blur save, Escape cancels. */
export default function InlineEdit({ value, maxLength, onSave, className }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const cancelled = useRef(false)

  const start = () => {
    cancelled.current = false
    setDraft(value)
    setEditing(true)
  }

  const finish = () => {
    if (cancelled.current) return
    const next = draft.trim()
    if (next && next !== value) onSave(next)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        className="inline-input"
        value={draft}
        maxLength={maxLength}
        aria-label={`Edit ${value}`}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={finish}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            cancelled.current = true
            setEditing(false)
          }
        }}
      />
    )
  }

  return (
    <div className="name-row">
      <span className={className} onDoubleClick={start}>
        {value}
      </span>
      <button className="edit" onClick={start} aria-label={`Rename ${value}`} title="Rename">
        ✎
      </button>
    </div>
  )
}
