'use client'

import { useEffect, useState } from 'react'

type Props = {
  missionName: string
  finalXp: number
  finalHearts: number
  finalMana: number
  onClose: () => void
}

/**
 * Pantalla de victoria que se muestra cuando el alumno completa
 * todos los nodos de una misión. Incluye animación de confeti y
 * lista de recompensas finales aplicadas.
 */
export default function MissionVictoryOverlay({
  missionName,
  finalXp,
  finalHearts,
  finalMana,
  onClose,
}: Props) {
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; delay: number; color: string }>
  >([])

  useEffect(() => {
    // Generar 60 piezas de confeti
    const colors = ['#B88A3C', '#E8C84B', '#C24617', '#7CD876', '#A8DFE6']
    const pieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2.5,
      color: colors[i % colors.length],
    }))
    setConfetti(pieces)
  }, [])

  return (
    <div className="victory-overlay" role="dialog" aria-modal="true">
      {/* Confeti */}
      <div className="victory-confetti" aria-hidden="true">
        {confetti.map((p) => (
          <span
            key={p.id}
            className="victory-confetti-piece"
            style={{
              left: `${p.x}%`,
              animationDelay: `${p.delay}s`,
              backgroundColor: p.color,
            }}
          />
        ))}
      </div>

      <div className="victory-card">
        <div className="victory-eyebrow">★ Misioa amaituta ★</div>
        <h2 className="victory-title">{missionName}</h2>
        <p className="victory-text">
          Helburu guztiak osatu dituzu. Mariren eskualdean zure izena geratuko da.
        </p>

        <div className="victory-rewards">
          <h3>Amaierako sariak</h3>
          <ul>
            {finalXp > 0 && (
              <li>
                <span className="victory-reward-icon">⚡</span>
                <span className="victory-reward-amount">+{finalXp}</span>
                <span className="victory-reward-label">XP</span>
              </li>
            )}
            {finalHearts > 0 && (
              <li>
                <span className="victory-reward-icon">❤</span>
                <span className="victory-reward-amount">+{finalHearts}</span>
                <span className="victory-reward-label">Bihotzak</span>
              </li>
            )}
            {finalMana > 0 && (
              <li>
                <span className="victory-reward-icon">🔮</span>
                <span className="victory-reward-amount">+{finalMana}</span>
                <span className="victory-reward-label">Mana</span>
              </li>
            )}
            {finalXp === 0 && finalHearts === 0 && finalMana === 0 && (
              <li className="victory-no-rewards">
                Errekonozimendu hutsa (irakasleak amaierako saririk ez du jarri)
              </li>
            )}
          </ul>
        </div>

        <button
          type="button"
          className="victory-continue-btn"
          onClick={onClose}
        >
          Jarraitu →
        </button>
      </div>
    </div>
  )
}
