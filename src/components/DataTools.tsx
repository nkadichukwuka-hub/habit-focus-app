import { useRef, useState } from 'react'
import { downloadBackup, parseBackup, resetAll, restoreBackup } from '../lib/backup'

export default function DataTools() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  const onExport = () => {
    downloadBackup()
    setMessage({ text: 'Backup downloaded.' })
  }

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again
    if (!file) return
    try {
      const backup = parseBackup(await file.text())
      const summary = `${backup.habits.length} habits, ${backup.tasks.length} tasks`
      if (!window.confirm(`Import ${summary}? This replaces everything currently in the app.`)) return
      restoreBackup(backup)
      window.location.reload()
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Import failed.', error: true })
    }
  }

  const onReset = () => {
    if (!window.confirm('Delete all habits, tasks and focus history? Export a backup first if you might want it back.')) return
    resetAll()
    window.location.reload()
  }

  return (
    <section className="data-tools" aria-label="Your data">
      <div className="data-actions">
        <button className="btn ghost small" onClick={onExport}>
          Export data
        </button>
        <button className="btn ghost small" onClick={() => fileRef.current?.click()}>
          Import data
        </button>
        <button className="btn ghost small danger" onClick={onReset}>
          Reset all
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
      </div>
      <p className={message?.error ? 'data-msg error' : 'data-msg'} role="status">
        {message?.text}
      </p>
    </section>
  )
}
