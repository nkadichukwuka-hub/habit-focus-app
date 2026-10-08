import { useState } from 'react'
import { LIMITS, type Settings } from '../lib/settings'

type NumKey = keyof typeof LIMITS

const FIELDS: { key: NumKey; label: string }[] = [
  { key: 'focusMin', label: 'Focus (min)' },
  { key: 'shortMin', label: 'Short break (min)' },
  { key: 'longMin', label: 'Long break (min)' },
  { key: 'goalMin', label: 'Daily goal (min)' },
]

interface FieldProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  disabled: boolean
  onCommit: (v: number) => void
}

/** Keeps a text draft while typing, so the field can be cleared; commits a clamped number on blur or Enter. */
function NumberField({ id, label, value, min, max, disabled, onCommit }: FieldProps) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    const n = parseInt(draft ?? '', 10)
    if (Number.isFinite(n)) onCommit(Math.min(max, Math.max(min, n)))
    setDraft(null)
  }

  return (
    <label className="field" htmlFor={id}>
      {label}
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft ?? value}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
    </label>
  )
}

interface Props {
  settings: Settings
  onChange: (next: Settings) => void
  /** Lengths can only change while the timer is idle. */
  locked: boolean
}

export default function TimerSettings({ settings, onChange, locked }: Props) {
  return (
    <div className="settings-panel" id="timer-settings">
      <div className="fields">
        {FIELDS.map((f) => {
          const lengthLocked = locked && f.key !== 'goalMin'
          return (
            <NumberField
              key={f.key}
              id={`set-${f.key}`}
              label={f.label}
              value={settings[f.key]}
              min={LIMITS[f.key].min}
              max={LIMITS[f.key].max}
              disabled={lengthLocked}
              onCommit={(v) => onChange({ ...settings, [f.key]: v })}
            />
          )
        })}
      </div>
      {locked && <p className="settings-hint">Reset the timer to change session lengths.</p>}
    </div>
  )
}
