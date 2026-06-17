'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { playToolSound } from './sounds'

type Student = {
  id: string
  full_name: string
  username: string
}

type Phase = 'idle' | 'rolling' | 'result' | 'empty'

type HautatzaileaProps = {
  classroomId: string
  classroomName: string
  students: Student[]
}

export default function Hautatzailea({
  classroomId,
  classroomName,
  students,
}: HautatzaileaProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const [selected, setSelected] = useState<Student | null>(null)
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set())
  const [allowRepeat, setAllowRepeat] = useState(false)
  const [muted, setMuted] = useState(false)
  const [rollingDisplay, setRollingDisplay] = useState('')

  const rollingTimeoutRef = useRef<number | null>(null)

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (rollingTimeoutRef.current) {
        clearTimeout(rollingTimeoutRef.current)
      }
    }
  }, [])

  const availablePool = allowRepeat
    ? students
    : students.filter((s) => !usedIds.has(s.id))

  function rollOnce(pool: Student[], startTime: number, duration: number) {
    const elapsed = Date.now() - startTime
    if (elapsed >= duration) {
      // Finalizar: elegir ganador real
      const winner = pool[Math.floor(Math.random() * pool.length)]
      setRollingDisplay(winner.full_name)
      setSelected(winner)
      if (!allowRepeat) {
        setUsedIds((prev) => new Set(prev).add(winner.id))
      }
      setPhase('result')
      if (!muted) playToolSound('ding')
      return
    }

    // Mostrar un nombre aleatorio momentáneo
    const random = pool[Math.floor(Math.random() * pool.length)]
    setRollingDisplay(random.full_name)
    if (!muted) playToolSound('rolling')

    // Frenar: el siguiente intervalo crece exponencialmente al avanzar
    const progress = elapsed / duration
    const interval = 50 + Math.pow(progress, 2.5) * 350

    rollingTimeoutRef.current = window.setTimeout(
      () => rollOnce(pool, startTime, duration),
      interval
    )
  }

  function handleRoll() {
    if (availablePool.length === 0) {
      setPhase('empty')
      return
    }

    setSelected(null)
    setPhase('rolling')
    const duration = 2400
    const startTime = Date.now()
    rollOnce(availablePool, startTime, duration)
  }

  function handleReset() {
    const confirmed = window.confirm(
      'Zerrenda berrezarri? Aurretik aukeratutako ikasle guztiak berriro sartuko dira.'
    )
    if (!confirmed) return
    setUsedIds(new Set())
    setSelected(null)
    setPhase('idle')
  }

  function handleExit() {
    router.push(`/panela/ikasgela/${classroomId}`)
  }

  return (
    <div className="tool-screen tool-hautatzailea-screen">
      <header className="tool-header">
        <div className="tool-classroom-name">{classroomName}</div>
        <div className="tool-title-mini">Ausazko hautatzailea</div>
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

      <main className="tool-hautatzailea-main">
        <div className="tool-hautatzailea-display">
          {phase === 'idle' && (
            <div className="tool-hautatzailea-idle">
              <div className="tool-hautatzailea-d20">⛧</div>
              <p className="tool-hautatzailea-prompt">
                {students.length === 0
                  ? 'Ez dago ikaslerik.'
                  : 'Sakatu beheko botoia ikasle bat aukeratzeko.'}
              </p>
            </div>
          )}

          {phase === 'rolling' && (
            <div className="tool-hautatzailea-rolling">
              <div className="tool-hautatzailea-eyebrow">Aukeratzen…</div>
              <div className="tool-hautatzailea-name tool-hautatzailea-name-rolling">
                {rollingDisplay}
              </div>
            </div>
          )}

          {phase === 'result' && selected && (
            <div className="tool-hautatzailea-result">
              <div className="tool-hautatzailea-eyebrow">Aukeratua</div>
              <div className="tool-hautatzailea-name tool-hautatzailea-name-result">
                {selected.full_name}
              </div>
              <div className="tool-hautatzailea-username">@{selected.username}</div>
            </div>
          )}

          {phase === 'empty' && (
            <div className="tool-hautatzailea-idle">
              <div className="tool-hautatzailea-d20" style={{ opacity: 0.3 }}>
                ⛧
              </div>
              <p className="tool-hautatzailea-prompt">
                Ikasle guztiak aukeratuak izan dira. Berrezarri zerrenda berriro hasteko.
              </p>
            </div>
          )}
        </div>

        {students.length > 0 && (
          <div className="tool-hautatzailea-pool">
            <div className="tool-pool-header">
              <span className="tool-pool-count">
                {availablePool.length} eskuragarri / {students.length} guztira
              </span>
            </div>
            <div className="tool-pool-chips">
              {students.map((s) => {
                const isUsed = usedIds.has(s.id)
                const isCurrent = selected?.id === s.id && phase === 'result'
                return (
                  <span
                    key={s.id}
                    className={`tool-pool-chip ${
                      isUsed ? 'tool-pool-chip-used' : ''
                    } ${isCurrent ? 'tool-pool-chip-current' : ''}`}
                  >
                    {s.full_name}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="tool-controls">
        <label className="tool-toggle">
          <input
            type="checkbox"
            checked={allowRepeat}
            onChange={(e) => setAllowRepeat(e.target.checked)}
          />
          <span>Errepikatzea baimendu</span>
        </label>

        <button
          type="button"
          className="tool-control-btn tool-control-primary"
          onClick={handleRoll}
          disabled={
            phase === 'rolling' ||
            students.length === 0 ||
            (availablePool.length === 0 && !allowRepeat)
          }
        >
          {phase === 'rolling' ? 'Aukeratzen…' : '🎲 Hautatu'}
        </button>

        <button
          type="button"
          className="tool-control-btn tool-control-danger"
          onClick={handleReset}
          disabled={usedIds.size === 0 && !selected}
        >
          ↺ Berrezarri
        </button>
      </footer>
    </div>
  )
}
