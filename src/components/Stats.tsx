import type { FocusLog, Habit, Task } from '../lib/types'
import { bestStreak, dayKey, streak } from '../lib/dates'

interface Props {
  habits: Habit[]
  focusLog: FocusLog
  tasks: Task[]
}

export const formatMinutes = (m: number) =>
  m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ''}`.trim()

/** Every day the user did something: a habit, a focus session or a finished task. */
export function activityDays(habits: Habit[], focusLog: FocusLog, tasks: Task[]) {
  const days = new Set<string>()
  habits.forEach((h) => h.completions.forEach((d) => days.add(d)))
  Object.entries(focusLog).forEach(([d, v]) => v.sessions > 0 && days.add(d))
  tasks.forEach((t) => t.completedAt && days.add(dayKey(new Date(t.completedAt))))
  return [...days]
}

export default function Stats({ habits, focusLog, tasks }: Props) {
  const days = activityDays(habits, focusLog, tasks)
  const current = streak(days)
  const tasksDone = tasks.filter((t) => t.completedAt).length
  const totalMinutes = Object.values(focusLog).reduce((sum, d) => sum + d.minutes, 0)

  const items = [
    { label: 'Active streak', value: `🔥 ${current}`, hint: current === 1 ? 'day' : 'days', hot: current > 0 },
    { label: 'Best streak', value: String(bestStreak(days)), hint: 'days' },
    { label: 'Tasks completed', value: String(tasksDone), hint: 'all time' },
    { label: 'Total focus', value: formatMinutes(totalMinutes), hint: 'all time' },
  ]

  return (
    <section className="overview" aria-label="Overall stats">
      {items.map((s) => (
        <div key={s.label} className="stat">
          <span className="stat-label">{s.label}</span>
          <span className={s.hot ? 'stat-value hot' : 'stat-value'}>{s.value}</span>
          <span className="stat-hint">{s.hint}</span>
        </div>
      ))}
    </section>
  )
}
