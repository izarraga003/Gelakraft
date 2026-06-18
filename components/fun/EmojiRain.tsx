'use client'

import { useState, useRef, type ReactNode } from 'react'

/**
 * Pequeño easter egg interactivo: al hacer click en este elemento, "llueven"
 * unos cuantos emojis cayendo desde el punto del click. Pensado para botones,
 * iconos o partes decorativas que se sienta natural pulsar.
 *
 * Mitología vasca: hartza, sugaar, mari, lamia, jentila, sorgina, lainoak...
 */

const POOL_DEFAULT = [
  '🌙', '🔥', '🌊', '⚡', '✨', '🐻', '🐺', '🦉', '🌟', '🎲', '🪄', '🏔️',
]

type Props = {
  children: ReactNode
  emojis?: string[]
  count?: number
  /** className extra para el wrapper */
  className?: string
}

type Drop = {
  id: number
  emoji: string
  x: number
  y: number
  driftX: number
  rotation: number
  scale: number
}

let _idCounter = 0

export default function EmojiRain({
  children,
  emojis = POOL_DEFAULT,
  count = 14,
  className,
}: Props) {
  const wrapRef = useRef<HTMLSpanElement | null>(null)
  const [drops, setDrops] = useState<Drop[]>([])

  function spawn(e: React.MouseEvent) {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newDrops: Drop[] = []
    for (let i = 0; i < count; i++) {
      newDrops.push({
        id: ++_idCounter,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 10,
        driftX: (Math.random() - 0.5) * 220,
        rotation: (Math.random() - 0.5) * 540,
        scale: 0.85 + Math.random() * 0.9,
      })
    }
    setDrops((prev) => [...prev, ...newDrops])

    // Limpiar tras la animación
    const ids = newDrops.map((d) => d.id)
    window.setTimeout(() => {
      setDrops((prev) => prev.filter((d) => !ids.includes(d.id)))
    }, 1600)
  }

  return (
    <span
      ref={wrapRef}
      className={`emoji-rain-wrap ${className ?? ''}`}
      onClick={spawn}
    >
      {children}
      {drops.length > 0 && (
        <span className="emoji-rain-layer" aria-hidden="true">
          {drops.map((d) => (
            <span
              key={d.id}
              className="emoji-rain-drop"
              style={
                {
                  left: `${d.x}px`,
                  top: `${d.y}px`,
                  '--drift-x': `${d.driftX}px`,
                  '--rot': `${d.rotation}deg`,
                  '--scale': d.scale,
                } as React.CSSProperties
              }
            >
              {d.emoji}
            </span>
          ))}
        </span>
      )}
    </span>
  )
}
