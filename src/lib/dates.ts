export const dayKey = (d: Date = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const addDays = (d: Date, n: number) => {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

/** Last `n` days ending today, oldest first. */
export const lastDays = (n: number) =>
  Array.from({ length: n }, (_, i) => addDays(new Date(), i - (n - 1)))

export const weekdayShort = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: 'short' })

/** Consecutive completed days ending today (or yesterday if today is not done yet). */
export function streak(completions: string[]) {
  const done = new Set(completions)
  let cursor = new Date()
  if (!done.has(dayKey(cursor))) cursor = addDays(cursor, -1)
  let count = 0
  while (done.has(dayKey(cursor))) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}

export function bestStreak(completions: string[]) {
  const sorted = [...new Set(completions)].sort()
  let best = 0
  let run = 0
  let prev: Date | null = null
  for (const key of sorted) {
    const [y, m, d] = key.split('-').map(Number)
    run = prev && dayKey(addDays(prev, 1)) === key ? run + 1 : 1
    best = Math.max(best, run)
    prev = new Date(y, m - 1, d)
  }
  return best
}
