'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import AvatarRender from '@/components/student/AvatarRender'
import { sanitizeAvatarConfig, type AvatarConfig } from '@/lib/students/avatar'
import { xpToLevel, levelProgress } from '@/lib/students/level'
import type { HeroClass } from '@/lib/students/hero-class'
import { HERO_CLASS_LABELS } from '@/lib/students/hero-class'

const POLL_MS = 8000

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

type Props = {
  classroomId: string
  classroomName: string
  initialStudents: StudentRow[]
}

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
          setStudents(json.students)
          setLastRefresh(Date.now())
        }
      } catch {
        // Silencioso: si falla un poll no es crítico
      }
    }
    pollRef.current = window.setInterval(refresh, POLL_MS)
    return () => {
      if (pollRef.current !== null) window.clearInterval(pollRef.current)
    }
  }, [classroomId])

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
              <StudentCard key={s.id} student={s} />
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
  const cfg = sanitizeAvatarConfig(
    student.avatar_config as AvatarConfig,
    99
  )
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

function StudentCard({ student }: { student: StudentRow }) {
  const cfg = sanitizeAvatarConfig(
    student.avatar_config as AvatarConfig,
    99
  )
  const lp = levelProgress(student.xp)

  const heartsArr = Array.from({ length: student.max_hearts }, (_, i) => i)
  const manaArr = Array.from({ length: student.max_mana }, (_, i) => i)

  return (
    <article
      className={`proiektatu-card ${
        student.pending_death ? 'proiektatu-card-dead' : ''
      }`}
    >
      <div className="proiektatu-card-avatar">
        <AvatarRender config={cfg} size={130} />
        {student.pending_death && (
          <div className="proiektatu-card-dead-badge">🎲 patua zain</div>
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
    </article>
  )
}
