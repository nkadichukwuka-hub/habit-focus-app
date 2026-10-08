import { useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from './lib/storage'
import type { FocusLog, Habit, Task } from './lib/types'
import { dayKey } from './lib/dates'
import { DEFAULT_SETTINGS, sanitizeSettings, type Settings } from './lib/settings'
import Timer from './components/Timer'
import Habits from './components/Habits'
import WeekChart from './components/WeekChart'
import Stats from './components/Stats'
import Tasks from './components/Tasks'
import Completed from './components/Completed'
import Heatmap from './components/Heatmap'
import DataTools from './components/DataTools'
import Welcome from './components/Welcome'
import Confetti, { type Burst } from './components/Confetti'

type Theme = 'dark' | 'light'

const EXAMPLE_HABITS = ['Read 20 pages', 'Drink 2L of water', '10-minute walk']
const EXAMPLE_TASKS = ['Plan your week', 'Try a focus session on the timer']

export default function App() {
  const [theme, setTheme] = useLocalStorage<Theme>('hf:theme', 'dark')
  const [habits, setHabits] = useLocalStorage<Habit[]>('hf:habits', [])
  const [tasks, setTasks] = useLocalStorage<Task[]>('hf:tasks', [])
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string>('hf:activeTask', '')
  const [rawSettings, setSettings] = useLocalStorage<Settings>('hf:settings', DEFAULT_SETTINGS)
  const settings = sanitizeSettings(rawSettings)
  const [onboarded, setOnboarded] = useLocalStorage<boolean>('hf:onboarded', false)
  const [focusLog, setFocusLog] = useLocalStorage<FocusLog>('hf:focus', {})

  const [bursts, setBursts] = useState<Burst[]>([])
  const celebrate = useCallback((x: number, y: number) => {
    // users who ask for reduced motion get no confetti
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setBursts((b) => [...b, { id: Date.now() + Math.random(), x, y }])
  }, [])
  const endBurst = useCallback((id: number) => setBursts((b) => b.filter((x) => x.id !== id)), [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0e0a07' : '#f7f1e5')
  }, [theme])

  // only an open task can be the focus target; a completed or deleted one falls back to none
  const activeTask = tasks.find((t) => t.id === activeTaskId && !t.completedAt)

  const logFocus = (minutes: number) => {
    if (activeTask) {
      setTasks((ts) =>
        ts.map((t) =>
          t.id === activeTask.id
            ? { ...t, focusMinutes: (t.focusMinutes ?? 0) + minutes, focusSessions: (t.focusSessions ?? 0) + 1 }
            : t,
        ),
      )
    }
    setFocusLog((log) => {
      const key = dayKey()
      const day = log[key] ?? { minutes: 0, sessions: 0 }
      return { ...log, [key]: { minutes: day.minutes + minutes, sessions: day.sessions + 1 } }
    })
  }

  // Only a brand-new, completely empty app gets the welcome card.
  const isEmpty = habits.length === 0 && tasks.length === 0 && Object.keys(focusLog).length === 0
  const addExamples = () => {
    setHabits(EXAMPLE_HABITS.map((name) => ({ id: crypto.randomUUID(), name, completions: [] })))
    setTasks(EXAMPLE_TASKS.map((name) => ({ id: crypto.randomUUID(), name, createdAt: Date.now() })))
    setOnboarded(true)
  }

  const today = focusLog[dayKey()] ?? { minutes: 0, sessions: 0 }

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Habit &amp; Focus</p>
          <h1>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h1>
        </div>
        <button
          className="icon-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>

      {!onboarded && isEmpty && <Welcome onAddExamples={addExamples} onDismiss={() => setOnboarded(true)} />}

      <Stats habits={habits} focusLog={focusLog} tasks={tasks} />

      <main className="grid">
        <Timer tasks={tasks.filter((t) => !t.completedAt)} activeTaskId={activeTask?.id ?? ''} onPickTask={setActiveTaskId} onSessionComplete={logFocus} todayMinutes={today.minutes} todaySessions={today.sessions} settings={settings} onSettings={setSettings} />
        <Habits habits={habits} setHabits={setHabits} />
        <Tasks tasks={tasks} setTasks={setTasks} activeTaskId={activeTask?.id ?? ''} onPickTask={setActiveTaskId} onCelebrate={celebrate} />
        <Completed tasks={tasks} setTasks={setTasks} habits={habits} focusLog={focusLog} />
        <WeekChart habits={habits} focusLog={focusLog} />
        <Heatmap habits={habits} />
      </main>

      <DataTools />

      <Confetti bursts={bursts} onDone={endBurst} />

      <footer className="footer">Everything is saved in your browser. No account, no backend.</footer>
    </div>
  )
}
