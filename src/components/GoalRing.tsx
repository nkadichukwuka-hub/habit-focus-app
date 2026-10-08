interface Props {
  minutes: number
  goal: number
}

const R = 26
const C = 2 * Math.PI * R

export default function GoalRing({ minutes, goal }: Props) {
  const pct = Math.min(1, minutes / goal)
  const reached = minutes >= goal

  return (
    <div className={reached ? 'goal reached' : 'goal'}>
      <svg viewBox="0 0 64 64" className="goal-ring" role="img" aria-label={`${Math.round(pct * 100)}% of daily focus goal`}>
        <circle className="goal-track" cx="32" cy="32" r={R} />
        <circle className="goal-bar" cx="32" cy="32" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
        <text x="32" y="36" textAnchor="middle" className="goal-pct">
          {reached ? '✓' : `${Math.round(pct * 100)}%`}
        </text>
      </svg>
      <div className="goal-text">
        <strong>{reached ? 'Daily goal reached' : 'Daily focus goal'}</strong>
        <span>
          {minutes} / {goal} min
        </span>
      </div>
    </div>
  )
}
