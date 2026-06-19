'use client'

import { useEffect, useRef, useState } from 'react'
import {
  createTeam,
  renameTeam,
  deleteTeam,
  assignStudentToTeam,
  type Team,
} from '@/lib/teams/actions'
import { HERO_CLASS_LABELS, type HeroClass } from '@/lib/students/hero-class'
import { sanitizeAvatarConfig, type AvatarConfig } from '@/lib/students/avatar'
import { xpToLevel } from '@/lib/students/level'
import AvatarRender from '@/components/student/AvatarRender'

type SimpleStudent = {
  id: string
  full_name: string
  hero_class: HeroClass
  avatar_config: Record<string, unknown>
  xp: number
}

type Props = {
  classroomId: string
  initialTeams: Team[]
  initialUnassigned: SimpleStudent[]
}

const DRAG_THRESHOLD_PX = 5 // movimiento mínimo para iniciar drag (vs click)

export default function TeamsManager({
  classroomId,
  initialTeams,
  initialUnassigned,
}: Props) {
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [unassigned, setUnassigned] = useState<SimpleStudent[]>(initialUnassigned)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTeamName, setNewTeamName] = useState('')

  // Drag state
  const dragStartRef = useRef<{
    studentId: string
    startX: number
    startY: number
  } | null>(null)
  const [drag, setDrag] = useState<{
    studentId: string
    student: SimpleStudent
    x: number
    y: number
  } | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)

  // ============== CRUD ==============

  async function handleCreate() {
    setError(null)
    const name = newTeamName.trim()
    if (!name) {
      setError('Talde izena idatzi behar duzu.')
      return
    }
    setBusy(true)
    const result = await createTeam(classroomId, name)
    setBusy(false)
    if (!result.success || !result.team) {
      setError(result.error ?? 'Errorea.')
      return
    }
    setTeams((prev) => [...prev, result.team!])
    setNewTeamName('')
  }

  async function handleRename(teamId: string, newName: string) {
    setError(null)
    const trimmed = newName.trim()
    if (!trimmed) return
    setBusy(true)
    const result = await renameTeam(teamId, classroomId, trimmed)
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, name: trimmed } : t))
    )
  }

  async function handleDelete(teamId: string) {
    if (
      !window.confirm(
        'Ziur talde hau ezabatu nahi duzula? Ikasleak banatu gabe geratuko dira.'
      )
    )
      return
    setBusy(true)
    const result = await deleteTeam(teamId, classroomId)
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setUnassigned((prev) =>
        [
          ...prev,
          ...team.members.map((m) => ({
            id: m.id,
            full_name: m.full_name,
            hero_class: m.hero_class,
            avatar_config: m.avatar_config,
            xp: m.xp,
          })),
        ].sort((a, b) => a.full_name.localeCompare(b.full_name))
      )
    }
    setTeams((prev) => prev.filter((t) => t.id !== teamId))
  }

  function findStudent(
    studentId: string
  ): { student: SimpleStudent; currentTeamId: string | null } | null {
    for (const t of teams) {
      const found = t.members.find((m) => m.id === studentId)
      if (found) {
        return {
          student: {
            id: found.id,
            full_name: found.full_name,
            hero_class: found.hero_class,
            avatar_config: found.avatar_config,
            xp: found.xp,
          },
          currentTeamId: t.id,
        }
      }
    }
    const u = unassigned.find((s) => s.id === studentId)
    if (u) return { student: u, currentTeamId: null }
    return null
  }

  async function handleAssign(studentId: string, targetTeamId: string | null) {
    const found = findStudent(studentId)
    if (!found) return
    if (found.currentTeamId === targetTeamId) return

    const ms = found.student

    setBusy(true)
    const result = await assignStudentToTeam(
      studentId,
      targetTeamId,
      classroomId
    )
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }

    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        members: t.members.filter((m) => m.id !== studentId),
      }))
    )
    setUnassigned((prev) => prev.filter((s) => s.id !== studentId))

    if (targetTeamId === null) {
      setUnassigned((prev) =>
        [...prev, ms].sort((a, b) => a.full_name.localeCompare(b.full_name))
      )
    } else {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === targetTeamId
            ? {
                ...t,
                members: [...t.members, ms].sort((a, b) =>
                  a.full_name.localeCompare(b.full_name)
                ),
              }
            : t
        )
      )
    }
  }

  // ============== POINTER DRAG ==============

  function onMemberPointerDown(e: React.PointerEvent, studentId: string) {
    // Solo botón principal o touch
    if (e.button !== 0 && e.pointerType === 'mouse') return
    // No iniciar drag si se hace click en un botón/input dentro de la fila
    const target = e.target as HTMLElement
    if (
      target.closest(
        'button, input, select, .team-picker, .team-card-delete'
      )
    ) {
      return
    }
    dragStartRef.current = {
      studentId,
      startX: e.clientX,
      startY: e.clientY,
    }
  }

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const start = dragStartRef.current
      if (!start) return

      if (!drag) {
        // No iniciado todavía: chequear umbral
        const dx = e.clientX - start.startX
        const dy = e.clientY - start.startY
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return

        const found = findStudent(start.studentId)
        if (!found) {
          dragStartRef.current = null
          return
        }
        setDrag({
          studentId: start.studentId,
          student: found.student,
          x: e.clientX,
          y: e.clientY,
        })
        document.body.classList.add('teams-dragging-body')
        return
      }

      // Ya arrastrando: actualizar posición
      setDrag((d) =>
        d
          ? {
              ...d,
              x: e.clientX,
              y: e.clientY,
            }
          : d
      )

      // Calcular target debajo del cursor
      const el = document.elementFromPoint(
        e.clientX,
        e.clientY
      ) as HTMLElement | null
      const dropZone = el?.closest('[data-drop-zone]') as HTMLElement | null
      const key = dropZone?.getAttribute('data-drop-zone') ?? null
      setDragOverTarget(key)
    }

    function onUp(e: PointerEvent) {
      const start = dragStartRef.current
      dragStartRef.current = null

      if (!start) return

      const wasDragging = drag !== null
      if (!wasDragging) return

      setDrag(null)
      setDragOverTarget(null)
      document.body.classList.remove('teams-dragging-body')

      // Buscar drop zone bajo el cursor
      const el = document.elementFromPoint(
        e.clientX,
        e.clientY
      ) as HTMLElement | null
      const dropZone = el?.closest('[data-drop-zone]') as HTMLElement | null
      const key = dropZone?.getAttribute('data-drop-zone')
      if (!key) return
      const targetTeamId = key === '__unassigned__' ? null : key
      void handleAssign(start.studentId, targetTeamId)
    }

    function onCancel() {
      dragStartRef.current = null
      setDrag(null)
      setDragOverTarget(null)
      document.body.classList.remove('teams-dragging-body')
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onCancel)
    window.addEventListener('blur', onCancel)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('blur', onCancel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag, teams, unassigned])

  // ============== RENDER ==============

  function renderTeamMemberRow(
    m: {
      id: string
      full_name: string
      hero_class: HeroClass
      avatar_config: Record<string, unknown>
      xp: number
    },
    currentTeamId: string | null
  ) {
    const cfg = sanitizeAvatarConfig(m.avatar_config as AvatarConfig, 99)
    const isDragging = drag?.studentId === m.id

    return (
      <li
        key={m.id}
        className={`team-member ${isDragging ? 'team-member-dragging' : ''}`}
        onPointerDown={(e) => onMemberPointerDown(e, m.id)}
        title="Arrastatu beste talde batera"
      >
        <span className="team-member-drag-handle" aria-hidden="true">
          ⠿
        </span>
        <span className="team-member-avatar">
          <AvatarRender config={cfg} size={42} />
        </span>
        <div className="team-member-info">
          <span className="team-member-name">{m.full_name}</span>
          <span className={`student-hero-class hero-${m.hero_class}`}>
            {HERO_CLASS_LABELS[m.hero_class]}
          </span>
        </div>
        <span className="team-member-level">Mla {xpToLevel(m.xp)}</span>
        <TeamPicker
          teams={teams}
          currentTeamId={currentTeamId}
          disabled={busy}
          onChange={(newTeamId) => handleAssign(m.id, newTeamId)}
        />
      </li>
    )
  }

  return (
    <>
      {error && (
        <div className="behaviors-error" role="alert">
          {error}
        </div>
      )}

      <section className="teams-create-bar">
        <input
          type="text"
          className="teams-create-input"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="Talde berriaren izena (adib. Argi-eraileak)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate()
          }}
          disabled={busy}
        />
        <button
          type="button"
          className="panel-cta-btn"
          onClick={handleCreate}
          disabled={busy || !newTeamName.trim()}
        >
          + Taldea sortu
        </button>
      </section>

      <p className="teams-drag-hint">
        💡 Ikasleak <strong>arrastaka</strong> mugitu ditzakezu talde batetik
        bestera (klikatu eta arrastatu izenetik), edo erabili goitibeherako
        menua eskuinean.
      </p>

      {/* Sin equipo (zona drop) */}
      {unassigned.length > 0 && (
        <section
          data-drop-zone="__unassigned__"
          className={`teams-unassigned ${
            dragOverTarget === '__unassigned__' ? 'teams-drop-active' : ''
          }`}
        >
          <header className="teams-unassigned-header">
            <h2 className="teams-unassigned-title">
              Talderik gabe ({unassigned.length})
            </h2>
            <p className="teams-unassigned-hint">
              Arrastatu hemendik talde batera, edo aukeratu menutik.
            </p>
          </header>
          <ul className="team-members teams-unassigned-list">
            {unassigned.map((s) => renderTeamMemberRow(s, null))}
          </ul>
        </section>
      )}

      {/* Equipos (cada uno es zona drop) */}
      {teams.length === 0 ? (
        <div className="panel-empty-state">
          <p>Oraindik ez dago talderik sortu.</p>
          <p className="panel-empty-hint">
            Sortu taldea goian eta hasi ikasleak banatzen.
          </p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((t) => (
            <article
              key={t.id}
              data-drop-zone={t.id}
              className={`team-card ${
                dragOverTarget === t.id ? 'teams-drop-active' : ''
              }`}
            >
              <header className="team-card-header">
                <input
                  type="text"
                  className="team-card-name-input"
                  defaultValue={t.name}
                  onBlur={(e) => {
                    if (
                      e.target.value.trim() &&
                      e.target.value.trim() !== t.name
                    ) {
                      handleRename(t.id, e.target.value)
                    }
                  }}
                  disabled={busy}
                  aria-label="Talde izena"
                />
                <span className="team-card-count">{t.members.length} kide</span>
                <button
                  type="button"
                  className="team-card-delete"
                  onClick={() => handleDelete(t.id)}
                  disabled={busy}
                  aria-label="Talde ezabatu"
                  title="Ezabatu"
                >
                  🗑
                </button>
              </header>

              {t.members.length === 0 ? (
                <p className="team-empty">
                  Hutsik · arrastatu ikasle bat hona
                </p>
              ) : (
                <ul className="team-members">
                  {t.members.map((m) => renderTeamMemberRow(m, t.id))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Ghost flotante mientras se arrastra */}
      {drag && (
        <div
          className="teams-drag-ghost"
          style={{
            left: drag.x + 'px',
            top: drag.y + 'px',
          }}
        >
          <span className="teams-drag-ghost-avatar">
            <AvatarRender
              config={sanitizeAvatarConfig(
                drag.student.avatar_config as AvatarConfig,
                99
              )}
              size={36}
            />
          </span>
          <span className="teams-drag-ghost-name">
            {drag.student.full_name}
          </span>
        </div>
      )}
    </>
  )
}

// ============================================================
// TeamPicker: dropdown custom
// ============================================================

function TeamPicker({
  teams,
  currentTeamId,
  disabled,
  onChange,
}: {
  teams: Team[]
  currentTeamId: string | null
  disabled: boolean
  onChange: (newTeamId: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const currentTeam = teams.find((t) => t.id === currentTeamId)
  const label = currentTeam ? currentTeam.name : '— Talderik gabe —'

  return (
    <div className="team-picker" ref={wrapperRef}>
      <button
        type="button"
        className={`team-picker-btn ${open ? 'team-picker-btn-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="team-picker-label">{label}</span>
        <span className="team-picker-chev" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul className="team-picker-menu" role="listbox">
          <li>
            <button
              type="button"
              className={`team-picker-item ${
                currentTeamId === null ? 'team-picker-item-active' : ''
              }`}
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              role="option"
              aria-selected={currentTeamId === null}
            >
              <span className="team-picker-item-dot team-picker-item-dot-none">
                ✕
              </span>
              <span className="team-picker-item-text">— Talderik gabe —</span>
            </button>
          </li>
          {teams.map((t) => {
            const active = t.id === currentTeamId
            return (
              <li key={t.id}>
                <button
                  type="button"
                  className={`team-picker-item ${
                    active ? 'team-picker-item-active' : ''
                  }`}
                  onClick={() => {
                    if (!active) onChange(t.id)
                    setOpen(false)
                  }}
                  role="option"
                  aria-selected={active}
                >
                  <span className="team-picker-item-dot">●</span>
                  <span className="team-picker-item-text">{t.name}</span>
                  <span className="team-picker-item-count">
                    {t.members.length}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
