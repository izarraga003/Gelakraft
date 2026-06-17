'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { playToolSound } from './sounds'

const PRESETS_SECONDS = [60, 120, 180, 300, 600, 900, 1200, 1800] // 1, 2, 3, 5, 10, 15, 20, 30 min

type Phase = 'setup' | 'running' | 'paused' | 'finished'

type KontaketaProps = {
  classroomId: string
  classroomName: string
}

function formatTime(totalSeconds: number): { mm: string; ss: string } {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = Math.floor(s / 60).toString().padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return { mm, ss }
}

export default function Kontaketa({ classroomId, classroomName }: KontaketaProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [muted, setMuted] = useState(false)
  const [customMin, setCustomMin] = useState(5)
  const [customSec, setCustomSec] = useState(0)

  const tickedRef = useRef(false)

  // Loop de cuenta atrás
  useEffect(() => {
    if (phase !== 'running') return

    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          // Termina
          if (!muted) playToolSound('alarm')
          setPhase('finished')
          return 0
        }
        if (r <= 6 && !muted) playToolSound('tick')
        return r - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, muted])

  function startWith(seconds: number) {
    setTotalSeconds(seconds)
    setRemaining(seconds)
    setPhase('running')
  }

  function startCustom() {
    const total = customMin * 60 + customSec
    if (total <= 0) return
    startWith(total)
  }

  function togglePause() {
    if (phase === 'running') setPhase('paused')
    else if (phase === 'paused') setPhase('running')
  }

  function adjustTime(delta: number) {
    if (phase === 'finished') {
      setRemaining(Math.max(0, delta))
      setPhase('paused')
      return
    }
    setRemaining((r) => Math.max(0, r + delta))
  }

  function resetToSetup() {
    setPhase('setup')
    setRemaining(0)
    setTotalSeconds(0)
  }

  function handleExit() {
    router.push(`/panela/ikasgela/${classroomId}`)
  }

  // ====================== SETUP SCREEN ======================
  if (phase === 'setup') {
    return (
      <div className="tool-screen tool-setup-screen">
        <header className="tool-header">
          <div className="tool-classroom-name">{classroomName}</div>
          <div className="tool-title-mini">Atzerako kontaketa</div>
          <div className="tool-header-actions">
            <button
              type="button"
              className="tool-icon-btn"
              onClick={handleExit}
              title="Atera"
            >
              ✕
            </button>
          </div>
        </header>

        <main className="tool-setup-main">
          <h1 className="tool-setup-title">Aukeratu denbora.</h1>

          <div className="tool-presets-grid">
            {PRESETS_SECONDS.map((s) => {
              const min = s / 60
              return (
                <button
                  key={s}
                  type="button"
                  className="tool-preset-btn"
                  onClick={() => startWith(s)}
                >
                  <span className="tool-preset-value">{min}</span>
                  <span className="tool-preset-unit">min</span>
                </button>
              )
            })}
          </div>

          <div className="tool-custom-section">
            <div className="tool-custom-label">edo aukeratu zehatza:</div>
            <div className="tool-custom-inputs">
              <div className="tool-custom-field">
                <button
                  type="button"
                  className="tool-numeric-btn"
                  onClick={() => setCustomMin((m) => Math.max(0, m - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  className="tool-custom-input"
                  value={customMin}
                  min={0}
                  max={99}
                  onChange={(e) =>
                    setCustomMin(Math.max(0, Math.min(99, parseInt(e.target.value || '0', 10))))
                  }
                />
                <button
                  type="button"
                  className="tool-numeric-btn"
                  onClick={() => setCustomMin((m) => Math.min(99, m + 1))}
                >
                  +
                </button>
                <span className="tool-custom-unit">min</span>
              </div>
              <span className="tool-custom-sep">:</span>
              <div className="tool-custom-field">
                <button
                  type="button"
                  className="tool-numeric-btn"
                  onClick={() => setCustomSec((s) => Math.max(0, s - 5))}
                >
                  −
                </button>
                <input
                  type="number"
                  className="tool-custom-input"
                  value={customSec.toString().padStart(2, '0')}
                  min={0}
                  max={59}
                  onChange={(e) =>
                    setCustomSec(Math.max(0, Math.min(59, parseInt(e.target.value || '0', 10))))
                  }
                />
                <button
                  type="button"
                  className="tool-numeric-btn"
                  onClick={() => setCustomSec((s) => Math.min(59, s + 5))}
                >
                  +
                </button>
                <span className="tool-custom-unit">seg</span>
              </div>
              <button
                type="button"
                className="btn-primary tool-custom-start"
                onClick={startCustom}
                disabled={customMin === 0 && customSec === 0}
              >
                Hasi
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ====================== RUNNING / PAUSED / FINISHED ======================
  const { mm, ss } = formatTime(remaining)
  const isUrgent = remaining > 0 && remaining <= 10
  const isFinished = phase === 'finished'

  return (
    <div
      className={`tool-screen tool-countdown-screen ${
        isUrgent ? 'tool-countdown-urgent' : ''
      } ${isFinished ? 'tool-countdown-finished' : ''}`}
    >
      <header className="tool-header">
        <div className="tool-classroom-name">{classroomName}</div>
        <div className="tool-title-mini">Atzerako kontaketa</div>
        <div className="tool-header-actions">
          <button
            type="button"
            className="tool-icon-btn"
            onClick={() => setMuted((m) => !m)}
            title={muted ? 'Aktibatu soinua' : 'Isildu'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            className="tool-icon-btn"
            onClick={handleExit}
            title="Atera"
          >
            ✕
          </button>
        </div>
      </header>

      <main className="tool-countdown-main">
        <div className="tool-countdown-display">
          <span className="tool-countdown-num">{mm}</span>
          <span className="tool-countdown-sep">:</span>
          <span className="tool-countdown-num">{ss}</span>
        </div>

        {isFinished && (
          <div className="tool-countdown-finished-text">Denbora amaitu da.</div>
        )}
      </main>

      <footer className="tool-controls">
        <button
          type="button"
          className="tool-control-btn tool-control-secondary"
          onClick={() => adjustTime(-30)}
          disabled={isFinished && remaining === 0}
        >
          −30 seg
        </button>
        <button
          type="button"
          className="tool-control-btn tool-control-secondary"
          onClick={() => adjustTime(30)}
        >
          +30 seg
        </button>
        <button
          type="button"
          className="tool-control-btn tool-control-secondary"
          onClick={() => adjustTime(60)}
        >
          +1 min
        </button>
        {!isFinished && (
          <button
            type="button"
            className="tool-control-btn tool-control-primary"
            onClick={togglePause}
          >
            {phase === 'running' ? '⏸ Geldi' : '▶ Jarraitu'}
          </button>
        )}
        <button
          type="button"
          className="tool-control-btn tool-control-danger"
          onClick={resetToSetup}
        >
          ↺ Berrezarri
        </button>
      </footer>
    </div>
  )
}
