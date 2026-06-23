'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import AvatarRender from '@/components/student/AvatarRender'
import { sanitizeAvatarConfig, type AvatarConfig } from '@/lib/students/avatar'
import { xpToLevel, levelProgress } from '@/lib/students/level'
import type { HeroClass } from '@/lib/students/hero-class'
import { HERO_CLASS_LABELS } from '@/lib/students/hero-class'

const POLL_MS = 8000
const FLASH_MS = 4500

type StudentRow = {
  id: string
  full_name: string
  hero_class: HeroClass
  xp: number
  hearts: number
  max_hearts: number
  mana: number
  max_mana: number
  avatar_config: Record<string, unknown>
  pending_death: boolean
  team: { id: string; name: string } | null
}

type FloatingChange = {
  id: number
  studentId: string
  kind: 'xp' | 'hearts' | 'mana'
  delta: number
}

type Props = {
  classroomId: string
  classroomName: string
  initialStudents: StudentRow[]
}

let floatingCounter = 0

export default function ProiektatuView({
  classroomId,
  classroomName,
  initialStudents,
}: Props) {
  const [students, setStudents] = useState<StudentRow[]>(initialStudents)
  const [now, setNow] = useState(() => new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(() => Date.now())
  const [showRanking, setShowRanking] = useState(true)
  const pollRef = useRef<number | null>(null)

  // Indicadores de cambios en vivo
  const prevStudentsRef = useRef<Map<string, StudentRow>>(new Map())
  const [flashing, setFlashing] = useState<Set<string>>(new Set())
  const [floating, setFloating] = useState<FloatingChange[]>([])
  const [pendingLevelUp, setPendingLevelUp] = useState<Set<string>>(new Set())

  // Inicializar prevStudents la primera vez
  useEffect(() => {
    const m = new Map<string, StudentRow>()
    for (const s of initialStudents) m.set(s.id, s)
    prevStudentsRef.current = m
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reloj
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  // Polling
  useEffect(() => {
    async function refresh() {
      try {
        const res = await fetch(`/proiektatu/${classroomId}/api/data`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const json = await res.json()
        if (json.success) {
          applyDiff(json.students as StudentRow[])
          setLastRefresh(Date.now())
        }
      } catch {
        // Silencioso
      }
    }
    pollRef.current = window.setInterval(refresh, POLL_MS)
    return () => {
      if (pollRef.current !== null) window.clearInterval(pollRef.current)
    }
  }, [classroomId])

  /**
   * Compara los datos nuevos con los previos y genera floating numbers +
   * marca cards para pulsar. Después aplica el nuevo estado.
   */
  function applyDiff(next: StudentRow[]) {
    const prev = prevStudentsRef.current
    const newFloating: FloatingChange[] = []
    const newFlashing = new Set<string>()
    const newLevelUps = new Set<string>()

    for (const s of next) {
      const old = prev.get(s.id)
      if (!old) continue
      const dxp = s.xp - old.xp
      const dh = s.hearts - old.hearts
      const dm = s.mana - old.mana

      if (dxp !== 0) {
        newFloating.push({
          id: ++floatingCounter,
          studentId: s.id,
          kind: 'xp',
          delta: dxp,
        })
        newFlashing.add(s.id)
        // ¿Subió de nivel?
        if (xpToLevel(s.xp) > xpToLevel(old.xp)) {
          newLevelUps.add(s.id)
        }
      }
      if (dh !== 0) {
        newFloating.push({
          id: ++floatingCounter,
          studentId: s.id,
          kind: 'hearts',
          delta: dh,
        })
        newFlashing.add(s.id)
      }
      if (dm !== 0) {
        newFloating.push({
          id: ++floatingCounter,
          studentId: s.id,
          kind: 'mana',
          delta: dm,
        })
        newFlashing.add(s.id)
      }
    }

    // Aplicar nuevo estado
    setStudents(next)
    const m = new Map<string, StudentRow>()
    for (const s of next) m.set(s.id, s)
    prevStudentsRef.current = m

    if (newFloating.length > 0) {
      setFloating((prev) => [...prev, ...newFloating])
      // Eliminar los floating tras la animación
      const ids = newFloating.map((f) => f.id)
      window.setTimeout(() => {
        setFloating((prev) => prev.filter((f) => !ids.includes(f.id)))
      }, FLASH_MS)
    }
    if (newFlashing.size > 0) {
      setFlashing((prev) => {
        const next = new Set(prev)
        newFlashing.forEach((id) => next.add(id))
        return next
      })
      window.setTimeout(() => {
        setFlashing((prev) => {
          const next = new Set(prev)
          newFlashing.forEach((id) => next.delete(id))
          return next
        })
      }, FLASH_MS)
    }
    if (newLevelUps.size > 0) {
      setPendingLevelUp((prev) => {
        const next = new Set(prev)
        newLevelUps.forEach((id) => next.add(id))
        return next
      })
      window.setTimeout(() => {
        setPendingLevelUp((prev) => {
          const next = new Set(prev)
          newLevelUps.forEach((id) => next.delete(id))
          return next
        })
      }, FLASH_MS + 600)
    }
  }

  // Fullscreen
  useEffect(() => {
    function onChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  // Top 3 por XP para podio
  const ranking = [...students]
    .filter((s) => !s.pending_death)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 3)

  const timeStr = now.toLocaleTimeString('eu-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Indexar floating por studentId
  const floatingByStudent: Record<string, FloatingChange[]> = {}
  for (const f of floating) {
    if (!floatingByStudent[f.studentId]) floatingByStudent[f.studentId] = []
    floatingByStudent[f.studentId].push(f)
  }

  return (
    <div className="proiektatu-shell">
      <header className="proiektatu-header">
        <div className="proiektatu-header-left">
          <Link
            href={`/panela/ikasgela/${classroomId}`}
            className="proiektatu-back-btn"
            title="Itzuli panelara"
          >
            ←
          </Link>
          <h1 className="proiektatu-title">{classroomName}</h1>
        </div>

        <div className="proiektatu-header-center">
          <span className="proiektatu-clock">{timeStr}</span>
        </div>

        <div className="proiektatu-header-right">
          <button
            type="button"
            className="proiektatu-icon-btn"
            onClick={() => setShowRanking((v) => !v)}
            title={showRanking ? 'Ezkutatu rankina' : 'Erakutsi rankina'}
          >
            {showRanking ? '🏆' : '👥'}
          </button>
          <button
            type="button"
            className="proiektatu-icon-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Atera pantaila osotik' : 'Pantaila osoa'}
          >
            {isFullscreen ? '🗗' : '⛶'}
          </button>
        </div>
      </header>

      {showRanking && ranking.length >= 3 && (
        <section className="proiektatu-podium">
          <PodiumStep student={ranking[1]} place={2} />
          <PodiumStep student={ranking[0]} place={1} />
          <PodiumStep student={ranking[2]} place={3} />
        </section>
      )}

      <main className="proiektatu-main">
        {students.length === 0 ? (
          <p className="proiektatu-empty">Ez dago ikaslerik ikasgela honetan.</p>
        ) : (
          <div className="proiektatu-grid">
            {students.map((s) => (
              <StudentCard
                key={s.id}
                student={s}
                flashing={flashing.has(s.id)}
                leveledUp={pendingLevelUp.has(s.id)}
                changes={floatingByStudent[s.id] ?? []}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="proiektatu-footer">
        <span className="proiektatu-footer-left">
          GELAKRAFT · proiekzio modua
        </span>
        <span className="proiektatu-footer-right">
          {students.length} ikasle · azken eguneraketa{' '}
          {new Date(lastRefresh).toLocaleTimeString('eu-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      </footer>
    </div>
  )
}

function PodiumStep({
  student,
  place,
}: {
  student: StudentRow
  place: 1 | 2 | 3
}) {
  const cfg = sanitizeAvatarConfig(student.avatar_config as AvatarConfig, 99)
  const level = xpToLevel(student.xp)
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className={`proiektatu-podium-step proiektatu-podium-${place}`}>
      <div className="proiektatu-podium-medal">{medals[place - 1]}</div>
      <div className="proiektatu-podium-avatar">
        <AvatarRender config={cfg} size={place === 1 ? 110 : 88} />
      </div>
      <div className="proiektatu-podium-name">{student.full_name}</div>
      <div className="proiektatu-podium-meta">
        Maila {level} · {student.xp} XP
      </div>
    </div>
  )
}

function StudentCard({
  student,
  flashing,
  leveledUp,
  changes,
}: {
  student: StudentRow
  flashing: boolean
  leveledUp: boolean
  changes: FloatingChange[]
}) {
  const cfg = sanitizeAvatarConfig(student.avatar_config as AvatarConfig, 99)
  const lp = levelProgress(student.xp)

  const heartsArr = Array.from({ length: student.max_hearts }, (_, i) => i)
  const manaArr = Array.from({ length: student.max_mana }, (_, i) => i)

  return (
    <article
      className={`proiektatu-card ${
        student.pending_death ? 'proiektatu-card-dead' : ''
      } ${flashing ? 'proiektatu-card-flash' : ''} ${
        leveledUp ? 'proiektatu-card-levelup' : ''
      }`}
    >
      <div className="proiektatu-card-avatar">
        <AvatarRender config={cfg} size={130} />
        {student.pending_death && (
          <div className="proiektatu-card-dead-badge">🎲 patua zain</div>
        )}
        {leveledUp && (
          <div className="proiektatu-card-levelup-badge">⬆ LEVEL UP!</div>
        )}
      </div>

      <div className="proiektatu-card-body">
        <h3 className="proiektatu-card-name">{student.full_name}</h3>
        <div className="proiektatu-card-tags">
          <span className={`student-hero-class hero-${student.hero_class}`}>
            {HERO_CLASS_LABELS[student.hero_class]}
          </span>
          {student.team && (
            <span className="proiektatu-card-team">👥 {student.team.name}</span>
          )}
        </div>

        <div className="proiektatu-card-level">
          <span className="proiektatu-card-level-label">Mla</span>
          <span className="proiektatu-card-level-num">{lp.level}</span>
          <div className="proiektatu-card-xp-bar">
            <div
              className="proiektatu-card-xp-fill"
              style={{ width: `${lp.pct}%` }}
            />
          </div>
          <span className="proiektatu-card-xp-num">{student.xp}</span>
        </div>

        <div className="proiektatu-card-stats">
          <div className="proiektatu-card-hearts">
            {heartsArr.map((i) => (
              <span
                key={i}
                className={`proiektatu-card-heart ${
                  i < student.hearts ? 'proiektatu-card-heart-on' : ''
                }`}
              >
                {i < student.hearts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
          <div className="proiektatu-card-mana">
            {manaArr.map((i) => (
              <span
                key={i}
                className={`proiektatu-card-mana-pip ${
                  i < student.mana ? 'proiektatu-card-mana-pip-on' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating numbers de cambios */}
      {changes.length > 0 && (
        <div className="proiektatu-floats" aria-hidden="true">
          {changes.map((c, idx) => {
            const sign = c.delta > 0 ? '+' : ''
            const label =
              c.kind === 'xp'
                ? `${sign}${c.delta} XP`
                : c.kind === 'hearts'
                ? `${sign}${c.delta} ❤️`
                : `${sign}${c.delta} 🔮`
            const variant =
              c.delta > 0
                ? c.kind === 'hearts'
                  ? 'gain-hearts'
                  : c.kind === 'mana'
                  ? 'gain-mana'
                  : 'gain-xp'
                : 'loss'
            return (
              <span
                key={c.id}
                className={`proiektatu-float proiektatu-float-${variant}`}
                style={{ animationDelay: `${idx * 0.12}s` }}
              >
                {label}
              </span>
            )
          })}
        </div>
      )}
    </article>
  )
}
