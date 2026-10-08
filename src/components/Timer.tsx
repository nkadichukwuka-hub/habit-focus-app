import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../lib/storage'
import type { Task } from '../lib/types'
import type { Settings } from '../lib/settings'
import GoalRing from './GoalRing'
import TimerSettings from './TimerSettings'

type Mode = 'focus' | 'short' | 'long'

const LABELS: Record<Mode, string> = { focus: 'Focus', short: 'Short break', long: 'Long break' }
const MODE_ORDER: Mode[] = ['focus', 'short', 'long']
const MINUTES_KEY = { focus: 'focusMin', short: 'shortMin', long: 'longMin' } as const

const RADIUS = 110
const CIRC = 2 * Math.PI * RADIUS

function beep() {
  try {
    const ctx = new AudioContext()
    ;[0, 0.25, 0.5].forEach((t) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.22)
    })
  } catch {
    /* audio blocked: silent completion is fine */
  }
}

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

interface Props {
  tasks: Task[]
  activeTaskId: string
  onPickTask: (id: string) => void
  onSessionComplete: (minutes: number) => void
  todayMinutes: number
  todaySessions: number
  settings: Settings
  onSettings: (next: Settings) => void
}

export default function Timer({
  tasks,
  activeTaskId,
  onPickTask,
  onSessionComplete,
  todayMinutes,
  todaySessions,
  settings,
  onSettings,
}: Props) {
  const [mode, setMode] = useState<Mode>('focus')
  const minutesFor = (md: Mode) => settings[MINUTES_KEY[md]]
  const [total, setTotal] = useState(settings.focusMin * 60_000)
  const [remaining, setRemaining] = useState(total)
  const [running, setRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [cycle, setCycle] = useLocalStorage('hf:cycle', 0) // focus sessions since last long break
  const endAt = useRef(0)
  const remainingRef = useRef(remaining)
  remainingRef.current = remaining

  const idle = !running && remaining === total

  const switchMode = useCallback(
    (next: Mode) => {
      const ms = settings[MINUTES_KEY[next]] * 60_000
      setMode(next)
      setRunning(false)
      setTotal(ms)
      setRemaining(ms)
    },
    [settings],
  )

  // A length changed while the timer is untouched: show the new length straight away.
  const currentMinutes = minutesFor(mode)
  useEffect(() => {
    if (idle && total !== currentMinutes * 60_000) {
      setTotal(currentMinutes * 60_000)
      setRemaining(currentMinutes * 60_000)
    }
  }, [currentMinutes, idle, total])

  const finish = useCallback(
    (counts: boolean) => {
      if (mode === 'focus') {
        if (counts) {
          if (settings.sound) beep()
          onSessionComplete(settings.focusMin)
          const next = cycle + 1
          setCycle(next >= 4 ? 0 : next)
          switchMode(next >= 4 ? 'long' : 'short')
        } else {
          switchMode('short')
        }
      } else {
        if (counts && settings.sound) beep()
        switchMode('focus')
      }
    },
    [mode, cycle, settings, onSessionComplete, setCycle, switchMode],
  )

  useEffect(() => {
    if (!running) return
    endAt.current = Date.now() + remainingRef.current
    const id = setInterval(() => {
      const left = endAt.current - Date.now()
      if (left <= 0) {
        clearInterval(id)
        finish(true)
      } else {
        setRemaining(left)
      }
    }, 250)
    return () => clearInterval(id)
  }, [running, finish])

  useEffect(() => {
    document.title = running ? `${fmt(remaining)} · ${LABELS[mode]}` : 'Habit & Focus Dashboard'
    return () => {
      document.title = 'Habit & Focus Dashboard'
    }
  }, [running, remaining, mode])

  // Keyboard shortcuts. The handler is kept in a ref so the listener is attached only once.
  const actions = {
    toggle: () => setRunning((r) => !r),
    reset: () => switchMode(mode),
    skip: () => finish(false),
    pick: (m: Mode) => switchMode(m),
  }
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, [contenteditable="true"]')) return
      const a = actionsRef.current
      if (e.code === 'Space') {
        // Space on a focused button should still press that button.
        if (el.closest('button, a')) return
        e.preventDefault()
        a.toggle()
      } else if (e.key === 'r' || e.key === 'R') a.reset()
      else if (e.key === 's' || e.key === 'S') a.skip()
      else if (e.key >= '1' && e.key <= '3') a.pick(MODE_ORDER[Number(e.key) - 1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const progress = 1 - remaining / total

  return (
    <section className="card timer-card" aria-labelledby="timer-h">
      <div className="card-head">
        <h2 id="timer-h">Focus timer</h2>
        <div className="head-actions">
          <button
            className="icon-btn small"
            onClick={() => onSettings({ ...settings, sound: !settings.sound })}
            aria-pressed={settings.sound}
            aria-label={settings.sound ? 'Mute end-of-session sound' : 'Turn on end-of-session sound'}
            title={settings.sound ? 'Sound on' : 'Sound off'}
          >
            {settings.sound ? '🔔' : '🔕'}
          </button>
          <button
            className="icon-btn small"
            onClick={() => setShowSettings((s) => !s)}
            aria-expanded={showSettings}
            aria-controls="timer-settings"
            aria-label="Timer settings"
            title="Timer settings"
          >
            ⚙
          </button>
        </div>
      </div>

      {showSettings && <TimerSettings settings={settings} onChange={onSettings} locked={!idle} />}

      <div className="tabs" role="tablist">
        {MODE_ORDER.map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            className={mode === m ? 'tab active' : 'tab'}
            onClick={() => switchMode(m)}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>

      <label className="task-picker">
        Working on
        <select value={activeTaskId} onChange={(e) => onPickTask(e.target.value)}>
          <option value="">No task (general focus)</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <div className="dial">
        <svg viewBox="0 0 250 250" aria-hidden="true">
          <circle className="dial-track" cx="125" cy="125" r={RADIUS} />
          <circle
            className="dial-bar"
            cx="125"
            cy="125"
            r={RADIUS}
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
          />
        </svg>
        <div className="dial-text" role="timer" aria-live="off">
          <span className="time">{fmt(remaining)}</span>
          <span className="mode-label">{LABELS[mode]}</span>
        </div>
      </div>

      <div className="controls">
        <button className="btn primary" onClick={actions.toggle}>
          {running ? 'Pause' : remaining < total ? 'Resume' : 'Start'}
        </button>
        <button className="btn" onClick={actions.reset}>
          Reset
        </button>
        <button className="btn" onClick={actions.skip} title="Skip to the next phase (not logged)">
          Skip
        </button>
      </div>

      <p className="shortcuts" aria-hidden="true">
        <kbd>Space</kbd> start/pause · <kbd>R</kbd> reset · <kbd>S</kbd> skip · <kbd>1</kbd>
        <kbd>2</kbd>
        <kbd>3</kbd> mode
      </p>

      <div className="cycle" aria-label={`${cycle} of 4 focus sessions before a long break`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < cycle ? 'pip on' : 'pip'} />
        ))}
      </div>

      <GoalRing minutes={todayMinutes} goal={settings.goalMin} />

      <dl className="stats">
        <div>
          <dt>Focused today</dt>
          <dd>{todayMinutes} min</dd>
        </div>
        <div>
          <dt>Sessions</dt>
          <dd>{todaySessions}</dd>
        </div>
      </dl>
    </section>
  )
}
