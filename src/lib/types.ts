export interface Habit {
  id: string
  name: string
  completions: string[] // YYYY-MM-DD
}

export interface FocusDay {
  minutes: number
  sessions: number
}

export type FocusLog = Record<string, FocusDay>

export interface Task {
  id: string
  name: string
  createdAt: number // epoch ms
  completedAt?: number // epoch ms, set when done
  focusMinutes?: number // focus time credited via the timer
  focusSessions?: number
}
