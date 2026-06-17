'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { playToolSound } from './sounds'

type EventItem = {
  id: string
  title: string
  description: string
}

type Student = {
  id: string
  full_name: string
  username: string
}

type Phase = 'idle' | 'revealing' | 'revealed' | 'empty'

type UstekabekoaProps = {
  classroomId: string
  classroomName: string
  events: EventItem[]
  students: Student[]
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function Ustekabekoa({
  classroomId,
  classroomName,
  events,
  students,
}: UstekabekoaProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>(
    events.length === 0 ? 'empty' : 'idle'
  )
  const [deck, setDeck] = useState<EventItem[]>([])
  const [current, setCurrent] = useState<EventItem | null>(null)
  const [suggestedStudent, setSuggestedStudent] = useState<Student | null>(null)
  const [muted, setMuted] = useState(false)
  const [seenCount, setSeenCount] = useState(0)

  const revealTimeoutRef = useRef<number | null>(null)

  // Barajar al montar
  useEffect(() => {
    if (events.length > 0) {
      setDeck(shuffle(events))
    }
    return () => {
      if (revealTimeoutRef.current !== null) {
        clearTimeout(revealTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function nextEvent() {
    if (events.length === 0) return

    // Si el deck está vacío, rebarajar
    let workingDeck = deck
    if (workingDeck.length === 0) {
      workingDeck = shuffle(events)
    }

    // Coger el siguiente
    const [next, ...rest] = workingDeck
    setDeck(rest)
    setSuggestedStudent(null)

    setPhase('revealing')
    if (!muted) playToolSound('mist')

    revealTimeoutRef.current = window.setTimeout(() => {
      setCurrent(next)
      setSeenCount((c) => c + 1)
      setPhase('revealed')
      if (!muted) playToolSound('reveal')
    }, 1500)
  }

  function suggestRandomStudent() {
    if (students.length === 0) return
    if (students.length === 1) {
      setSuggestedStudent(students[0])
      return
    }
    // Evitar sugerir el mismo dos veces seguidas
    let pick: Student
    do {
      pick = students[Math.floor(Math.random() * students.length)]
    } while (suggestedStudent && pick.id === suggestedStudent.id)
    setSuggestedStudent(pick)
  }

  function handleExit() {
    router.push(`/panela/ikasgela/${classroomId}`)
  }

  // ====================== EMPTY ======================
  if (phase === 'empty') {
    return (
      <div className="tool-screen ustekabekoa-screen">
        <header className="tool-header">
          <div className="tool-classroom-name">{classroomName}</div>
          <div className="tool-title-mini">Ustekabeko gertaera</div>
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

        <main className="ustekabekoa-empty">
          <div className="ustekabekoa-empty-icon">📜</div>
          <h1 className="ustekabekoa-empty-title">Ez dago gertaerarik.</h1>
          <p className="ustekabekoa-empty-text">
            Joan konfigurazio orrira gertaerak sortzeko, edo kargatu lehenetsitakoak.
          </p>
          <Link
            href={`/panela/ikasgela/${classroomId}/ustekabekoa/konfiguratu`}
            className="btn-primary"
          >
            Gertaerak konfiguratu
          </Link>
        </main>
      </div>
    )
  }

  // ====================== MAIN ======================
  return (
    <div className="tool-screen ustekabekoa-screen">
      <header className="tool-header">
        <div className="tool-classroom-name">{classroomName}</div>
        <div className="tool-title-mini">Ustekabeko gertaera</div>
        <div className="tool-header-actions">
          <button
            type="button"
            className="tool-icon-btn"
            onClick={() => setMuted((m) => !m)}
            title={muted ? 'Aktibatu soinua' : 'Isildu'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <Link
            href={`/panela/ikasgela/${classroomId}/ustekabekoa/konfiguratu`}
            className="tool-icon-btn"
            title="Konfiguratu"
          >
            ⚙
          </Link>
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

      <main className="ustekabekoa-main">
        <div
          className={`ustekabekoa-parchment ustekabekoa-phase-${phase}`}
          aria-live="polite"
        >
          {/* Rollos enrollados arriba/abajo */}
          <div className="parchment-scroll parchment-scroll-top" aria-hidden="true">
            <div className="parchment-scroll-curl parchment-scroll-curl-left" />
            <div className="parchment-scroll-curl parchment-scroll-curl-right" />
          </div>
          <div className="parchment-scroll parchment-scroll-bottom" aria-hidden="true">
            <div className="parchment-scroll-curl parchment-scroll-curl-left" />
            <div className="parchment-scroll-curl parchment-scroll-curl-right" />
          </div>

          {/* Capas de niebla */}
          <div className="parchment-mist parchment-mist-1" aria-hidden="true" />
          <div className="parchment-mist parchment-mist-2" aria-hidden="true" />
          <div className="parchment-mist parchment-mist-3" aria-hidden="true" />

          {/* Contenido */}
          <div className="parchment-content">
            {phase === 'idle' && (
              <div className="parchment-idle">
                <p className="parchment-idle-text">
                  Mariren laino artean ezkutatuta dago hurrengo gertaera.
                </p>
                <p className="parchment-idle-hint">
                  Sakatu Aurkitu botoia agertarazteko.
                </p>
              </div>
            )}

            {(phase === 'revealing' || phase === 'revealed') && current && (
              <div className="parchment-event">
                <h1 className="parchment-event-title">{current.title}</h1>
                <p className="parchment-event-desc">{current.description}</p>

                {phase === 'revealed' && students.length > 0 && (
                  <div className="parchment-student-suggest">
                    {!suggestedStudent ? (
                      <button
                        type="button"
                        className="parchment-suggest-btn"
                        onClick={suggestRandomStudent}
                      >
                        🎲 Ausaz ikaslea hautatu
                      </button>
                    ) : (
                      <div className="parchment-suggest-result">
                        <span className="parchment-suggest-label">
                          Aukeratutako ikaslea:
                        </span>
                        <strong className="parchment-suggest-name">
                          {suggestedStudent.full_name}
                        </strong>
                        <button
                          type="button"
                          className="parchment-suggest-rebtn"
                          onClick={suggestRandomStudent}
                        >
                          ↺ Beste bat
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="tool-controls ustekabekoa-controls">
        <div className="ustekabekoa-controls-info">
          {seenCount > 0 && deck.length > 0 && (
            <span className="ustekabekoa-deck-info">
              {deck.length} gertaera geratzen dira
            </span>
          )}
          {seenCount > 0 && deck.length === 0 && (
            <span className="ustekabekoa-deck-info">
              Sorta amaitu da · hurrengoa berriz nahasiko da
            </span>
          )}
        </div>

        <button
          type="button"
          className="tool-control-btn tool-control-primary"
          onClick={nextEvent}
          disabled={phase === 'revealing'}
        >
          {phase === 'revealing'
            ? 'Lainoa ezabatzen…'
            : phase === 'idle'
              ? '✨ Aurkitu'
              : '➜ Hurrengo gertaera'}
        </button>
      </footer>
    </div>
  )
}
