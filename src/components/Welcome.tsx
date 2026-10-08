interface Props {
  onAddExamples: () => void
  onDismiss: () => void
}

export default function Welcome({ onAddExamples, onDismiss }: Props) {
  return (
    <section className="card welcome" aria-labelledby="welcome-h">
      <div className="welcome-text">
        <h2 id="welcome-h">Welcome to Habit &amp; Focus</h2>
        <p>
          Build streaks with daily habits, plan tasks, and run focus sessions on the timer. Everything stays in your
          browser: no account, no sign-up.
        </p>
      </div>
      <div className="welcome-actions">
        <button className="btn primary" onClick={onAddExamples}>
          Add example habits &amp; tasks
        </button>
        <button className="btn ghost" onClick={onDismiss}>
          Start blank
        </button>
      </div>
    </section>
  )
}
