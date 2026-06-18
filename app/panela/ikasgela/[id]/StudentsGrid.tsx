'use client'

import { useState, useTransition } from 'react'
import {
  regeneratePassword,
  deleteStudent,
} from '@/lib/students/actions'
import { adjustStudents } from '@/lib/students/adjust-actions'
import {
  HERO_CLASS_LABELS,
  type HeroClass,
} from '@/lib/students/hero-class'
import { xpToLevel } from '@/lib/students/level'
import { sanitizeAvatarConfig, type AvatarConfig } from '@/lib/students/avatar'
import AvatarRender from '@/components/student/AvatarRender'

type Student = {
  id: string
  full_name: string
  username: string
  password_plain: string
  hero_class: HeroClass
  avatar_config: AvatarConfig
  xp: number
  hearts: number
  max_hearts: number
  mana: number
  max_mana: number
  created_at: string
}

type Props = {
  students: Student[]
  classroomId: string
}

export default function StudentsGrid({
  students: initial,
  classroomId,
}: Props) {
  const [students, setStudents] = useState<Student[]>(initial)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [openStudent, setOpenStudent] = useState<Student | null>(null)

  const allSelected = students.length > 0 && selected.size === students.length

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(students.map((s) => s.id)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  async function applyAdjustment(
    studentIds: string[],
    xpDelta: number,
    heartsDelta: number,
    note?: string
  ) {
    setBusy(true)
    const result = await adjustStudents(classroomId, studentIds, xpDelta, heartsDelta, note)
    setBusy(false)

    if (!result.success) {
      alert(`Errorea: ${result.error}`)
      return
    }

    // Aplicar a estado local para feedback inmediato
    setStudents((prev) =>
      prev.map((s) => {
        if (!studentIds.includes(s.id)) return s
        return {
          ...s,
          xp: Math.max(0, s.xp + xpDelta),
          hearts: Math.max(0, Math.min(s.max_hearts, s.hearts + heartsDelta)),
        }
      })
    )

    // También en la card abierta si la hay
    if (openStudent && studentIds.includes(openStudent.id)) {
      setOpenStudent((prev) =>
        prev
          ? {
              ...prev,
              xp: Math.max(0, prev.xp + xpDelta),
              hearts: Math.max(0, Math.min(prev.max_hearts, prev.hearts + heartsDelta)),
            }
          : prev
      )
    }
  }

  async function handleRegenerate(id: string) {
    const confirmed = window.confirm(
      'Pasahitz berri bat sortu?\n\nIkasleak ezin izango du sartu pasahitz zaharrarekin.'
    )
    if (!confirmed) return

    setBusy(true)
    const result = await regeneratePassword(id)
    setBusy(false)

    if (result.success) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, password_plain: result.newPassword } : s
        )
      )
      if (openStudent?.id === id) {
        setOpenStudent((prev) =>
          prev ? { ...prev, password_plain: result.newPassword } : prev
        )
      }
    } else {
      alert(`Errorea: ${result.error}`)
    }
  }

  function handleDelete(id: string) {
    const s = students.find((x) => x.id === id)
    if (!s) return
    if (
      !window.confirm(
        `Seguru ${s.full_name} ezabatu nahi duzula?\n\nEkintza hau ezin da desegin.`
      )
    )
      return

    startTransition(async () => {
      const result = await deleteStudent(id, classroomId)
      if (result.success) {
        setStudents((prev) => prev.filter((x) => x.id !== id))
        setSelected((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        if (openStudent?.id === id) setOpenStudent(null)
      } else {
        alert(`Errorea: ${result.error}`)
      }
    })
  }

  return (
    <>
      <div className="students-grid-header">
        <label className="students-select-all">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            aria-label="Aukeratu denak"
          />
          <span>{allSelected ? 'Kendu aukeraketa' : 'Aukeratu denak'}</span>
        </label>
        <span className="students-count">
          {students.length} ikasle{selected.size > 0 ? ` · ${selected.size} aukeratuta` : ''}
        </span>
      </div>

      <div className="students-grid">
        {students.map((s) => {
          const level = xpToLevel(s.xp)
          const safeAvatar = sanitizeAvatarConfig(s.avatar_config, 99)
          const isSelected = selected.has(s.id)
          return (
            <article
              key={s.id}
              className={`student-card ${isSelected ? 'student-card-selected' : ''}`}
            >
              <label className="student-card-select">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(s.id)}
                  aria-label={`Aukeratu ${s.full_name}`}
                />
              </label>

              <button
                type="button"
                className="student-card-body"
                onClick={() => setOpenStudent(s)}
              >
                <div className="student-card-avatar">
                  <AvatarRender config={safeAvatar} size={86} />
                  <span className="student-card-level">Mla {level}</span>
                </div>
                <div className="student-card-info">
                  <span className="student-card-name">{s.full_name}</span>
                  <span className={`student-hero-class hero-${s.hero_class}`}>
                    {HERO_CLASS_LABELS[s.hero_class]}
                  </span>
                </div>
              </button>

              <div className="student-card-stats">
                <span className="student-card-stat" title="XP">
                  <span className="student-card-stat-icon">⚡</span>
                  <span className="student-card-stat-value">{s.xp}</span>
                </span>
                <span className="student-card-stat" title="Bihotzak">
                  <span className="student-card-stat-icon">❤️</span>
                  <span className="student-card-stat-value">
                    {s.hearts}<span className="student-card-stat-max">/{s.max_hearts}</span>
                  </span>
                </span>
              </div>

              <div className="student-card-quick">
                <button
                  type="button"
                  className="student-quick-btn student-quick-positive"
                  onClick={() => applyAdjustment([s.id], 10, 0)}
                  disabled={busy}
                  title="+10 XP"
                >
                  +10 XP
                </button>
                <button
                  type="button"
                  className="student-quick-btn student-quick-negative"
                  onClick={() => applyAdjustment([s.id], 0, -1)}
                  disabled={busy || s.hearts <= 0}
                  title="-1 bihotz"
                >
                  -1 ♥
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Modal detalle alumno */}
      {openStudent && (
        <StudentDetailModal
          student={openStudent}
          onClose={() => setOpenStudent(null)}
          onAdjust={(xp, hearts) => applyAdjustment([openStudent.id], xp, hearts)}
          onRegeneratePassword={() => handleRegenerate(openStudent.id)}
          onDelete={() => handleDelete(openStudent.id)}
          busy={busy}
        />
      )}

      {/* Barra de bulk actions cuando hay seleccionados */}
      {selected.size > 0 && (
        <BulkActionsBar
          count={selected.size}
          busy={busy}
          onClear={clearSelection}
          onAdjust={(xp, hearts) =>
            applyAdjustment(Array.from(selected), xp, hearts).then(() => {
              if (xp !== 0 || hearts !== 0) clearSelection()
            })
          }
        />
      )}
    </>
  )
}

// ============================================================
// MODAL DETALLE
// ============================================================

function StudentDetailModal({
  student,
  onClose,
  onAdjust,
  onRegeneratePassword,
  onDelete,
  busy,
}: {
  student: Student
  onClose: () => void
  onAdjust: (xpDelta: number, heartsDelta: number) => void
  onRegeneratePassword: () => void
  onDelete: () => void
  busy: boolean
}) {
  const level = xpToLevel(student.xp)
  const safeAvatar = sanitizeAvatarConfig(student.avatar_config, 99)

  return (
    <div
      className="avatar-picker-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="student-detail-modal">
        <header className="student-detail-header">
          <div className="student-detail-avatar">
            <AvatarRender config={safeAvatar} size={130} />
          </div>
          <div className="student-detail-info">
            <h2 className="student-detail-name">{student.full_name}</h2>
            <div className="student-detail-meta">
              <span className={`student-hero-class hero-${student.hero_class}`}>
                {HERO_CLASS_LABELS[student.hero_class]}
              </span>
              <span className="student-detail-level">Maila {level}</span>
            </div>
            <div className="student-detail-credentials">
              <div>
                <span className="student-detail-label">Erabiltzailea</span>
                <code className="student-code">{student.username}</code>
              </div>
              <div>
                <span className="student-detail-label">Pasahitza</span>
                <code className="student-code">{student.password_plain}</code>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="avatar-picker-close"
            onClick={onClose}
            aria-label="Itxi"
          >
            ✕
          </button>
        </header>

        <div className="student-detail-stats">
          <StatControl
            label="Esperientzia"
            icon="⚡"
            value={student.xp}
            onAdjust={(delta) => onAdjust(delta, 0)}
            presets={[5, 10, 20, 50, -10]}
            busy={busy}
          />
          <StatControl
            label="Bihotzak"
            icon="❤️"
            value={student.hearts}
            max={student.max_hearts}
            onAdjust={(delta) => onAdjust(0, delta)}
            presets={[1, -1, -2]}
            busy={busy}
            isHearts
          />
        </div>

        <footer className="student-detail-footer">
          <button
            type="button"
            className="student-action-btn"
            onClick={onRegeneratePassword}
            disabled={busy}
          >
            Pasahitz berria
          </button>
          <button
            type="button"
            className="student-action-btn student-action-danger"
            onClick={onDelete}
            disabled={busy}
          >
            Ikaslea ezabatu
          </button>
          <div className="student-detail-footer-spacer" />
          <button
            type="button"
            className="panel-btn-secondary"
            onClick={onClose}
            disabled={busy}
          >
            Itxi
          </button>
        </footer>
      </div>
    </div>
  )
}

function StatControl({
  label,
  icon,
  value,
  max,
  onAdjust,
  presets,
  busy,
  isHearts = false,
}: {
  label: string
  icon: string
  value: number
  max?: number
  onAdjust: (delta: number) => void
  presets: number[]
  busy: boolean
  isHearts?: boolean
}) {
  return (
    <div className="stat-control">
      <div className="stat-control-header">
        <span className="stat-control-icon">{icon}</span>
        <span className="stat-control-label">{label}</span>
        <span className="stat-control-value">
          {value}
          {max !== undefined && (
            <span className="stat-control-max"> / {max}</span>
          )}
        </span>
      </div>
      <div className="stat-control-buttons">
        {presets.map((p) => {
          const isNeg = p < 0
          return (
            <button
              key={p}
              type="button"
              className={`stat-preset-btn ${isNeg ? 'stat-preset-negative' : 'stat-preset-positive'}`}
              onClick={() => onAdjust(p)}
              disabled={busy || (isHearts && p < 0 && value === 0)}
            >
              {p > 0 ? '+' : ''}
              {p}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// BULK ACTIONS BAR
// ============================================================

function BulkActionsBar({
  count,
  busy,
  onClear,
  onAdjust,
}: {
  count: number
  busy: boolean
  onClear: () => void
  onAdjust: (xpDelta: number, heartsDelta: number) => void
}) {
  return (
    <div className="bulk-bar" role="region" aria-label="Talde-akzioak">
      <div className="bulk-bar-info">
        <span className="bulk-bar-count">{count}</span>
        <span>ikasle aukeratuta</span>
      </div>
      <div className="bulk-bar-actions">
        <button
          type="button"
          className="bulk-btn bulk-btn-positive"
          onClick={() => onAdjust(10, 0)}
          disabled={busy}
        >
          + 10 XP
        </button>
        <button
          type="button"
          className="bulk-btn bulk-btn-positive"
          onClick={() => onAdjust(20, 0)}
          disabled={busy}
        >
          + 20 XP
        </button>
        <button
          type="button"
          className="bulk-btn bulk-btn-positive"
          onClick={() => onAdjust(50, 0)}
          disabled={busy}
        >
          + 50 XP
        </button>
        <span className="bulk-bar-sep" aria-hidden="true">|</span>
        <button
          type="button"
          className="bulk-btn bulk-btn-negative"
          onClick={() => onAdjust(0, -1)}
          disabled={busy}
        >
          - 1 ♥
        </button>
        <button
          type="button"
          className="bulk-btn bulk-btn-negative"
          onClick={() => onAdjust(0, -2)}
          disabled={busy}
        >
          - 2 ♥
        </button>
      </div>
      <button
        type="button"
        className="bulk-bar-clear"
        onClick={onClear}
        aria-label="Aukeraketa garbitu"
      >
        ✕
      </button>
    </div>
  )
}
