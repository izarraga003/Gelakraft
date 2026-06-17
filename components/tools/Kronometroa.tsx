'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Phase = 'idle' | 'running' | 'paused'

type KronometroaProps = {
  classroomId: string
  classroomName: string
}

function formatMs(ms: number): { mm: string; ss: string; cc: string } {
  const totalMs = Math.max(0, ms)
  const totalSeconds = Math.floor(totalMs / 1000)
  const mm = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const ss = (totalSeconds % 60).toString().padStart(2, '0')
  const cc = Math.floor((totalMs % 1000) / 10).toString().padStart(2, '0')
  return { mm, ss, cc }
}

export default function Kronometroa({ classroomId, classroomName }: KronometroaProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [laps, setLaps] = useState<number[]>([])

  // Refs para no perder precisión con re-renders
  const startTimestampRef = useRef<number>(0)
  const accumulatedRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)

  // requestAnimationFrame loop para precisión
  useEffect(() => {
    if (phase !== 'running') return

    const tick = () => {
      const now = Date.now()
      const total = accumulatedRef.current + (now - startTimestampRef.current)
      setElapsedMs(total)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [phase])

  function handleStartPause() {
    if (phase === 'running') {
      // Pausar: acumular tiempo
      accumulatedRef.current += Date.now() - startTimestampRef.current
      setPhase('paused')
    } else {
      // Iniciar o reanudar
      startTimestampRef.current = Date.now()
      setPhase('running')
    }
  }

  function handleLap() {
    if (phase !== 'running') return
    setLaps((prev) => [elapsedMs, ...prev])
  }

  function handleReset() {
    if (phase === 'running' || laps.length > 0 || elapsedMs > 0) {
      const confirmed = window.confirm('Kronometroa berrezarri?')
      if (!confirmed) return
    }
    accumulatedRef.current = 0
    setElapsedMs(0)
    setLaps([])
    setPhase('idle')
  }

  function handleExit() {
    router.push(`/panela/ikasgela/${classroomId}`)
  }

  const { mm, ss, cc } = formatMs(elapsedMs)

  return (
    <div className="tool-screen tool-kronometroa-screen">
      <header className="tool-header">
        <div className="tool-classroom-name">{classroomName}</div>
        <div className="tool-title-mini">Kronometroa</div>
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

      <main className="tool-kronometroa-main">
        <div className="tool-kronometroa-display">
          <span className="tool-kronometroa-num">{mm}</span>
          <span className="tool-kronometroa-sep">:</span>
          <span className="tool-kronometroa-num">{ss}</span>
          <span className="tool-kronometroa-cc">.{cc}</span>
        </div>

        {laps.length > 0 && (
          <div className="tool-laps">
            <h3 className="tool-laps-title">Itzalpeak ({laps.length})</h3>
            <ol className="tool-laps-list">
              {laps.map((lap, idx) => {
                const f = formatMs(lap)
                const lapNumber = laps.length - idx
                return (
                  <li key={`${lap}-${idx}`} className="tool-lap-item">
                    <span className="tool-lap-num">#{lapNumber}</span>
                    <span className="tool-lap-time">
                      {f.mm}:{f.ss}.{f.cc}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </main>

      <footer className="tool-controls">
        <button
          type="button"
          className="tool-control-btn tool-control-secondary"
          onClick={handleLap}
          disabled={phase !== 'running'}
        >
          🚩 Itzalpea
        </button>
        <button
          type="button"
          className="tool-control-btn tool-control-primary"
          onClick={handleStartPause}
        >
          {phase === 'running' ? '⏸ Geldi' : phase === 'idle' ? '▶ Hasi' : '▶ Jarraitu'}
        </button>
        <button
          type="button"
          className="tool-control-btn tool-control-danger"
          onClick={handleReset}
        >
          ↺ Berrezarri
        </button>
      </footer>
    </div>
  )
}
