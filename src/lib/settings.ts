export interface Settings {
  focusMin: number
  shortMin: number
  longMin: number
  goalMin: number // daily focus goal
  sound: boolean
}

export const DEFAULT_SETTINGS: Settings = { focusMin: 25, shortMin: 5, longMin: 15, goalMin: 100, sound: true }

/** Allowed range for each numeric setting. */
export const LIMITS = {
  focusMin: { min: 1, max: 120 },
  shortMin: { min: 1, max: 60 },
  longMin: { min: 1, max: 90 },
  goalMin: { min: 10, max: 600 },
} as const

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(v)))

/** Fills gaps and clamps values, so old or hand-edited data can never break the timer. */
export function sanitizeSettings(raw: unknown): Settings {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  const num = (key: keyof typeof LIMITS) => {
    const v = r[key]
    const { min, max } = LIMITS[key]
    return typeof v === 'number' && Number.isFinite(v) ? clamp(v, min, max) : DEFAULT_SETTINGS[key]
  }
  return {
    focusMin: num('focusMin'),
    shortMin: num('shortMin'),
    longMin: num('longMin'),
    goalMin: num('goalMin'),
    sound: typeof r.sound === 'boolean' ? r.sound : DEFAULT_SETTINGS.sound,
  }
}
