import { useState } from 'react'
import type { FocusLog, Habit } from '../lib/types'
import { dayKey, lastDays, weekdayShort } from '../lib/dates'

type Metric = 'habits' | 'focus'

interface Props {
  habits: Habit[]
  focusLog: FocusLog
}

const W = 560
const H = 220
const PAD = { top: 16, right: 12, bottom: 30, left: 36 }

export default function WeekChart({ habits, focusLog }: Props) {
  const [metric, setMetric] = useState<Metric>('habits')
  const days = lastDays(7)

  const data = days.map((d) => {
    const key = dayKey(d)
    const done = habits.filter((h) => h.completions.includes(key)).length
    return {
      key,
      label: weekdayShort(d),
      isToday: key === dayKey(),
      value:
        metric === 'habits'
          ? habits.length
            ? Math.round((done / habits.length) * 100)
            : 0
          : focusLog[key]?.minutes ?? 0,
      detail:
        metric === 'habits'
          ? `${done} of ${habits.length} habits`
          : `${focusLog[key]?.minutes ?? 0} min, ${focusLog[key]?.sessions ?? 0} sessions`,
    }
  })

  const rawMax = Math.max(...data.map((d) => d.value))
  const max = metric === 'habits' ? 100 : Math.max(60, Math.ceil(rawMax / 30) * 30)
  const unit = metric === 'habits' ? '%' : 'm'
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const slot = innerW / data.length
  const barW = Math.min(44, slot * 0.6)
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t))

  const total = data.reduce((s, d) => s + d.value, 0)
  const summary =
    metric === 'habits'
      ? `${Math.round(total / data.length)}% average completion`
      : `${total} min focused this week`

  return (
    <section className="card chart-card" aria-labelledby="chart-h">
      <div className="card-head">
        <h2 id="chart-h">This week</h2>
        <div className="tabs small" role="tablist">
          <button
            role="tab"
            aria-selected={metric === 'habits'}
            className={metric === 'habits' ? 'tab active' : 'tab'}
            onClick={() => setMetric('habits')}
          >
            Habits
          </button>
          <button
            role="tab"
            aria-selected={metric === 'focus'}
            className={metric === 'focus' ? 'tab active' : 'tab'}
            onClick={() => setMetric('focus')}
          >
            Focus
          </button>
        </div>
      </div>
      <p className="chart-summary">{summary}</p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart"
        role="img"
        aria-label={`Bar chart, last 7 days. ${summary}.`}
      >
        {ticks.map((t) => {
          const y = PAD.top + innerH - (t / max) * innerH
          return (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} className="grid-line" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="axis">
                {t}
                {unit}
              </text>
            </g>
          )
        })}

        {data.map((d, i) => {
          const h = (d.value / max) * innerH
          const x = PAD.left + slot * i + (slot - barW) / 2
          const y = PAD.top + innerH - h
          return (
            <g key={d.key} className="bar-group">
              <rect
                x={x}
                y={d.value ? y : PAD.top + innerH - 2}
                width={barW}
                height={d.value ? h : 2}
                rx={6}
                className={d.isToday ? 'bar today' : 'bar'}
              />
              {d.value > 0 && (
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" className="bar-value">
                  {d.value}
                  {unit}
                </text>
              )}
              <text
                x={x + barW / 2}
                y={H - 10}
                textAnchor="middle"
                className={d.isToday ? 'axis today-label' : 'axis'}
              >
                {d.label}
              </text>
              <title>
                {d.label}: {d.detail}
              </title>
            </g>
          )
        })}
      </svg>
    </section>
  )
}
