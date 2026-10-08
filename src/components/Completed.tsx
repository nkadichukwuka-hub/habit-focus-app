import type { FocusLog, Habit, Task } from '../lib/types'
import { dayKey } from '../lib/dates'
import { formatMinutes } from './Stats'

interface Props {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  habits: Habit[]
  focusLog: FocusLog
}

const DAYS_SHOWN = 14

function dayLabel(key: string) {
  if (key === dayKey()) return 'Today'
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function Completed({ tasks, setTasks, habits, focusLog }: Props) {
  const done = tasks
    .filter((t) => t.completedAt)
    .sort((a, b) => b.completedAt! - a.completedAt!)

  const byDay = new Map<string, Task[]>()
  done.forEach((t) => {
    const key = dayKey(new Date(t.completedAt!))
    byDay.set(key, [...(byDay.get(key) ?? []), t])
  })
  const days = [...byDay.keys()].slice(0, DAYS_SHOWN)

  const reopen = (id: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, completedAt: undefined } : t)))

  const clear = () => {
    if (window.confirm('Clear all completed tasks? This cannot be undone.')) {
      setTasks((ts) => ts.filter((t) => !t.completedAt))
    }
  }

  return (
    <section className="card completed-card" aria-labelledby="completed-h">
      <div className="card-head">
        <h2 id="completed-h">Completed work</h2>
        {done.length > 0 && (
          <button className="btn ghost small" onClick={clear}>
            Clear
          </button>
        )}
      </div>

      {days.length === 0 ? (
        <p className="empty">Finished tasks show up here, grouped by day.</p>
      ) : (
        <div className="log">
          {days.map((key) => {
            const focus = focusLog[key]
            const habitsDone = habits.filter((h) => h.completions.includes(key)).length
            const extras = [
              focus?.minutes ? `${formatMinutes(focus.minutes)} focus` : '',
              habitsDone ? `${habitsDone} habit${habitsDone === 1 ? '' : 's'}` : '',
            ].filter(Boolean)
            return (
              <div key={key} className="log-day">
                <div className="log-head">
                  <strong>{dayLabel(key)}</strong>
                  <span>{[`${byDay.get(key)!.length} done`, ...extras].join(' · ')}</span>
                </div>
                <ul>
                  {byDay.get(key)!.map((t) => (
                    <li key={t.id}>
                      <span className="log-tick" aria-hidden="true">✓</span>
                      <span className="log-name">{t.name}</span>
                      {!!t.focusSessions && (
                        <span className="log-focus">
                          {formatMinutes(t.focusMinutes ?? 0)} · {t.focusSessions}×
                        </span>
                      )}
                      <button className="link" onClick={() => reopen(t.id)}>
                        Reopen
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
