import type { Habit } from '../lib/types'
import { addDays, dayKey } from '../lib/dates'

interface Props {
  habits: Habit[]
}

const WEEKS = 12
const CELL = 30
const GAP = 6
const STEP = CELL + GAP
const LEFT = 34
const TOP = 22
const W = LEFT + WEEKS * STEP
const H = TOP + 7 * STEP
const ROW_LABELS: Record<number, string> = { 0: 'Mon', 2: 'Wed', 4: 'Fri' }

/** 0 = nothing done, 4 = every habit done. */
const level = (done: number, total: number) => {
  if (!total || !done) return 0
  const r = done / total
  return r >= 1 ? 4 : r > 0.66 ? 3 : r > 0.33 ? 2 : 1
}

export default function Heatmap({ habits }: Props) {
  const todayKey = dayKey()
  const now = new Date()
  const mondayOffset = (now.getDay() + 6) % 7 // days since Monday
  const start = addDays(now, -mondayOffset - (WEEKS - 1) * 7)

  const cells: { key: string; col: number; row: number; done: number; label: string }[] = []
  const months: { col: number; text: string }[] = []
  let activeDays = 0
  let perfectDays = 0

  for (let col = 0; col < WEEKS; col++) {
    for (let row = 0; row < 7; row++) {
      const d = addDays(start, col * 7 + row)
      const key = dayKey(d)
      if (key > todayKey) continue // future days stay empty
      const done = habits.filter((h) => h.completions.includes(key)).length
      if (done) activeDays++
      if (habits.length && done === habits.length) perfectDays++
      if (row === 0 && (col === 0 || d.getDate() <= 7)) {
        months.push({ col, text: d.toLocaleDateString(undefined, { month: 'short' }) })
      }
      cells.push({
        key,
        col,
        row,
        done,
        label: `${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}: ${done} of ${habits.length} habits`,
      })
    }
  }

  return (
    <section className="card heat-card" aria-labelledby="heat-h">
      <div className="card-head">
        <h2 id="heat-h">Consistency</h2>
        <span className="badge">Last {WEEKS} weeks</span>
      </div>

      {habits.length === 0 ? (
        <p className="empty">Add a habit and check it off. Your consistency map fills in here.</p>
      ) : (
        <>
          <p className="chart-summary">
            {activeDays} active {activeDays === 1 ? 'day' : 'days'} · {perfectDays} perfect{' '}
            {perfectDays === 1 ? 'day' : 'days'}
          </p>

          <svg className="heatmap" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Habit completion heatmap">
            {months.map((m) => (
              <text key={m.col} className="axis" x={LEFT + m.col * STEP} y={12}>
                {m.text}
              </text>
            ))}
            {Object.entries(ROW_LABELS).map(([row, text]) => (
              <text key={text} className="axis" x={0} y={TOP + Number(row) * STEP + CELL * 0.68}>
                {text}
              </text>
            ))}
            {cells.map((c) => (
              <rect
                key={c.key}
                className={`hm hm-${level(c.done, habits.length)}${c.key === todayKey ? ' today' : ''}`}
                x={LEFT + c.col * STEP}
                y={TOP + c.row * STEP}
                width={CELL}
                height={CELL}
                rx={7}
              >
                <title>{c.label}</title>
              </rect>
            ))}
          </svg>

          <div className="heat-legend" aria-hidden="true">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <i key={l} className={`hm-swatch hm-${l}`} />
            ))}
            <span>More</span>
          </div>
        </>
      )}
    </section>
  )
}
