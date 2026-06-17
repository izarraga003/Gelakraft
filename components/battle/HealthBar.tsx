'use client'

import { useEffect, useState } from 'react'

type HealthBarProps = {
  label: string
  current: number
  max: number
  /** Color de la barra: 'enemy' (rojo) o 'ally' (dorado/azul) */
  variant: 'enemy' | 'ally'
}

/**
 * Barra de HP animada. Cuando `current` cambia, anima la transición.
 */
export default function HealthBar({
  label,
  current,
  max,
  variant,
}: HealthBarProps) {
  const [displayed, setDisplayed] = useState(current)
  const [recentChange, setRecentChange] = useState<number | null>(null)

  useEffect(() => {
    if (current !== displayed) {
      setRecentChange(current - displayed)
      setDisplayed(current)
      const t = setTimeout(() => setRecentChange(null), 900)
      return () => clearTimeout(t)
    }
  }, [current, displayed])

  const pct = Math.max(0, Math.min(100, (displayed / max) * 100))

  return (
    <div className={`hp-bar hp-${variant}`}>
      <div className="hp-bar-label">
        <span className="hp-bar-name">{label}</span>
        <span className="hp-bar-numbers">
          {displayed} / {max}
        </span>
      </div>
      <div className="hp-bar-track">
        <div className="hp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {recentChange !== null && recentChange !== 0 && (
        <span
          key={recentChange + Date.now()}
          className={`hp-bar-delta ${recentChange < 0 ? 'hp-delta-down' : 'hp-delta-up'}`}
        >
          {recentChange > 0 ? '+' : ''}
          {recentChange}
        </span>
      )}
    </div>
  )
}
