import { useState } from 'react'
import type { Habit } from '../lib/types'
import InlineEdit from './InlineEdit'
import { bestStreak, dayKey, lastDays, streak } from '../lib/dates'

interface Props {
  habits: Habit[]
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>
}

export default function Habits({ habits, setHabits }: Props) {
  const [name, setName] = useState('')
  const today = dayKey()
  const week = lastDays(7)

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setHabits((h) => [...h, { id: crypto.randomUUID(), name: trimmed, completions: [] }])
    setName('')
  }

  const toggle = (id: string, key: string) =>
    setHabits((hs) =>
      hs.map((h) =>
        h.id !== id
          ? h
          : {
              ...h,
              completions: h.completions.includes(key)
                ? h.completions.filter((d) => d !== key)
                : [...h.completions, key],
            },
      ),
    )

  const rename = (id: string, name: string) =>
    setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, name: name.slice(0, 60) } : h)))

  const remove = (id: string) => setHabits((hs) => hs.filter((h) => h.id !== id))

  const doneToday = habits.filter((h) => h.completions.includes(today)).length

  return (
    <section className="card habits-card" aria-labelledby="habits-h">
      <div className="card-head">
        <h2 id="habits-h">Daily habits</h2>
        {habits.length > 0 && (
          <span className={doneToday === habits.length ? 'badge ok' : 'badge'}>
            {doneToday}/{habits.length} today
          </span>
        )}
      </div>

      <form className="add" onSubmit={add}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a habit, e.g. Read 20 pages"
          maxLength={60}
          aria-label="New habit name"
        />
        <button className="btn primary" type="submit">
          Add
        </button>
      </form>

      {habits.length === 0 ? (
        <p className="empty">No habits yet. Add one above and check it off each day to build a streak.</p>
      ) : (
        <ul className="habit-list">
          {habits.map((h) => {
            const done = h.completions.includes(today)
            const current = streak(h.completions)
            const atRisk = !done && current > 0 // a live streak that today's check-in would extend
            return (
              <li key={h.id} className={done ? 'habit done' : 'habit'}>
                <button
                  className="check"
                  onClick={() => toggle(h.id, today)}
                  aria-pressed={done}
                  aria-label={`${done ? 'Unmark' : 'Mark'} ${h.name} for today`}
                >
                  {done && '✓'}
                </button>

                <div className="habit-main">
                  <InlineEdit value={h.name} maxLength={60} className="habit-name" onSave={(n) => rename(h.id, n)} />
                  <span className="habit-meta">
                    <span className={atRisk ? 'streak risk' : current > 0 ? 'streak hot' : 'streak'}>
                      🔥 {current}-day streak{atRisk && ' · at risk'}
                    </span>
                    <span className="best">best {bestStreak(h.completions)}</span>
                  </span>
                </div>

                <div className="week-dots" aria-hidden="true">
                  {week.map((d) => {
                    const key = dayKey(d)
                    return (
                      <button
                        key={key}
                        className={h.completions.includes(key) ? 'dot on' : 'dot'}
                        onClick={() => toggle(h.id, key)}
                        title={d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        tabIndex={-1}
                      />
                    )
                  })}
                </div>

                <button className="remove" onClick={() => remove(h.id)} aria-label={`Delete ${h.name}`}>
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
