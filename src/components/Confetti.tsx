import { useEffect } from 'react'

export interface Burst {
  id: number
  x: number
  y: number
}

const COUNT = 22
const COLORS = ['#d4a94f', '#f3e9d2', '#e8c875', '#b88a2a']
const LIFETIME_MS = 1100

/** Cheap pseudo-random so a burst looks the same on every render. */
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

interface Props {
  bursts: Burst[]
  onDone: (id: number) => void
}

export default function Confetti({ bursts, onDone }: Props) {
  useEffect(() => {
    const timers = bursts.map((b) => setTimeout(() => onDone(b.id), LIFETIME_MS))
    return () => timers.forEach(clearTimeout)
  }, [bursts, onDone])

  return (
    <div className="confetti" aria-hidden="true">
      {bursts.map((b) =>
        Array.from({ length: COUNT }, (_, i) => {
          const angle = (i / COUNT) * Math.PI * 2 + rand(b.id + i) * 0.6
          const dist = 60 + rand(b.id * 3 + i) * 80
          return (
            <span
              key={`${b.id}-${i}`}
              className="piece"
              style={
                {
                  left: b.x,
                  top: b.y,
                  background: COLORS[i % COLORS.length],
                  '--dx': `${Math.cos(angle) * dist}px`,
                  '--dy': `${Math.sin(angle) * dist - 30}px`,
                  '--rot': `${rand(b.id + i * 7) * 720 - 360}deg`,
                } as React.CSSProperties
              }
            />
          )
        }),
      )}
    </div>
  )
}
