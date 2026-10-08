import type { FocusLog, Habit, Task } from './types'
import { dayKey } from './dates'
import { sanitizeSettings, type Settings } from './settings'

const APP = 'habit-focus-dashboard'
const VERSION = 1

/** localStorage keys that make up the user's data (theme is a preference, left alone). */
const KEYS = { habits: 'hf:habits', focus: 'hf:focus', tasks: 'hf:tasks', cycle: 'hf:cycle', active: 'hf:activeTask', settings: 'hf:settings', onboarded: 'hf:onboarded' }

export interface Backup {
  app: typeof APP
  version: number
  exportedAt: string
  habits: Habit[]
  focus: FocusLog
  tasks: Task[]
  settings: Settings
}

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export const buildBackup = (): Backup => ({
  app: APP,
  version: VERSION,
  exportedAt: new Date().toISOString(),
  habits: read<Habit[]>(KEYS.habits, []),
  focus: read<FocusLog>(KEYS.focus, {}),
  tasks: read<Task[]>(KEYS.tasks, []),
  settings: sanitizeSettings(read<unknown>(KEYS.settings, {})),
})

export function downloadBackup() {
  const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `habit-focus-backup-${dayKey()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const isStr = (v: unknown): v is string => typeof v === 'string'
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const DAY = /^\d{4}-\d{2}-\d{2}$/

/** Parses and sanitises a backup file. Throws an Error with a user-readable message. */
export function parseBackup(text: string): Backup {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (!isObj(data) || data.app !== APP) throw new Error('That is not a Habit & Focus backup file.')
  if (!isNum(data.version) || data.version > VERSION) throw new Error('This backup is from a newer version of the app.')
  if (!Array.isArray(data.habits) || !isObj(data.focus) || !Array.isArray(data.tasks)) {
    throw new Error('The backup file is missing data.')
  }

  const habits: Habit[] = data.habits.filter(isObj).flatMap((h) =>
    isStr(h.id) && isStr(h.name) && Array.isArray(h.completions)
      ? [{ id: h.id, name: h.name.slice(0, 60), completions: h.completions.filter((d): d is string => isStr(d) && DAY.test(d)) }]
      : [],
  )

  const focus: FocusLog = {}
  for (const [day, v] of Object.entries(data.focus)) {
    if (DAY.test(day) && isObj(v) && isNum(v.minutes) && isNum(v.sessions)) {
      focus[day] = { minutes: v.minutes, sessions: v.sessions }
    }
  }

  const tasks: Task[] = data.tasks.filter(isObj).flatMap((t) =>
    isStr(t.id) && isStr(t.name) && isNum(t.createdAt)
      ? [
          {
            id: t.id,
            name: t.name.slice(0, 100),
            createdAt: t.createdAt,
            ...(isNum(t.completedAt) && { completedAt: t.completedAt }),
            ...(isNum(t.focusMinutes) && { focusMinutes: t.focusMinutes }),
            ...(isNum(t.focusSessions) && { focusSessions: t.focusSessions }),
          },
        ]
      : [],
  )

  return { app: APP, version: VERSION, exportedAt: isStr(data.exportedAt) ? data.exportedAt : '', habits, focus, tasks, settings: sanitizeSettings(data.settings) }
}

/** Replaces all stored data. Callers reload the page afterwards so every component re-reads storage. */
export function restoreBackup(b: Backup) {
  localStorage.setItem(KEYS.habits, JSON.stringify(b.habits))
  localStorage.setItem(KEYS.focus, JSON.stringify(b.focus))
  localStorage.setItem(KEYS.tasks, JSON.stringify(b.tasks))
  localStorage.setItem(KEYS.settings, JSON.stringify(b.settings))
  localStorage.setItem(KEYS.onboarded, 'true')
  localStorage.removeItem(KEYS.cycle)
  localStorage.removeItem(KEYS.active)
}

export function resetAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
