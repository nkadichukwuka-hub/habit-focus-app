import { useState } from 'react'
import type { Task } from '../lib/types'
import InlineEdit from './InlineEdit'
import { formatMinutes } from './Stats'

interface Props {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  activeTaskId: string
  onPickTask: (id: string) => void
  onCelebrate: (x: number, y: number) => void
}

export default function Tasks({ tasks, setTasks, activeTaskId, onPickTask, onCelebrate }: Props) {
  const [name, setName] = useState('')
  const open = tasks.filter((t) => !t.completedAt)

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setTasks((ts) => [{ id: crypto.randomUUID(), name: trimmed, createdAt: Date.now() }, ...ts])
    setName('')
  }

  const complete = (id: string, e: React.MouseEvent<HTMLElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    onCelebrate(box.left + box.width / 2, box.top + box.height / 2)
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, completedAt: Date.now() } : t)))
  }

  const rename = (id: string, name: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, name: name.slice(0, 100) } : t)))

  const remove = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id))

  return (
    <section className="card tasks-card" aria-labelledby="tasks-h">
      <div className="card-head">
        <h2 id="tasks-h">Tasks</h2>
        {open.length > 0 && <span className="badge">{open.length} open</span>}
      </div>

      <form className="add" onSubmit={add}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a task, e.g. Finish landing page"
          maxLength={100}
          aria-label="New task name"
        />
        <button className="btn primary" type="submit">
          Add
        </button>
      </form>

      {open.length === 0 ? (
        <p className="empty">
          {tasks.length === 0 ? 'No tasks yet. Add one above.' : 'All clear. Nice work.'}
        </p>
      ) : (
        <ul className="habit-list">
          {open.map((t) => (
            <li key={t.id} className={t.id === activeTaskId ? 'task active' : 'task'}>
              <button className="check" onClick={(e) => complete(t.id, e)} aria-label={`Complete ${t.name}`} />
              <div className="task-main">
                <InlineEdit value={t.name} maxLength={100} className="habit-name" onSave={(n) => rename(t.id, n)} />
                {!!t.focusSessions && (
                  <span className="task-focus">
                    {formatMinutes(t.focusMinutes ?? 0)} · {t.focusSessions} session{t.focusSessions === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <button
                className="link"
                onClick={() => onPickTask(t.id === activeTaskId ? '' : t.id)}
                aria-pressed={t.id === activeTaskId}
              >
                {t.id === activeTaskId ? 'Focusing' : 'Focus'}
              </button>
              <button className="remove" onClick={() => remove(t.id)} aria-label={`Delete ${t.name}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
