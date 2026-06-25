'use client'

import { useState, useTransition, useMemo } from 'react'
import { regeneratePassword, deleteStudent } from '@/lib/students/actions'
import { adjustStudents } from '@/lib/students/adjust-actions'
import {
  HERO_CLASS_LABELS,
  type HeroClass,
} from '@/lib/students/hero-class'
import { xpToLevel } from '@/lib/students/level'
import { sanitizeAvatarConfig, type AvatarConfig } from '@/lib/students/avatar'
import AvatarRender from '@/components/student/AvatarRender'
import StudentHistory from '@/components/student/StudentHistory'
import { getPowersForClass } from '@/lib/powers/catalog'
import type { Behavior } from '@/lib/behaviors/actions'

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

type StudentTeamInfo = {
  teamId: string
  teamName: string
}

type Props = {
  students: Student[]
  classroomId: string
  behaviors: Behavior[]
  teamByStudent: Record<string, StudentTeamInfo>
}

export default function StudentsGrid({
  students: initial,
  classroomId,
  behaviors,
  teamByStudent,
}: Props) {
  const [students, setStudents] = useState<Student[]>(initial)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [openStudent, setOpenStudent] = useState<Student | null>(null)

  const positives = useMemo(
    () => behaviors.filter((b) => b.behavior_type === 'positive'),
    [behaviors]
  )
  const negatives = useMemo(
    () => behaviors.filter((b) => b.behavior_type === 'negative'),
    [behaviors]
  )

  // Agrupar alumnos por equipo
  const groupedByTeam = useMemo(() => {
    const groups = new Map<string, { teamName: string; teamId: string | null; students: Student[] }>()
    // "Sin equipo" siempre primero (key especial '')
    groups.set('', { teamName: 'Talderik gabe', teamId: null, students: [] })

    for (const s of students) {
      const info = teamByStudent[s.id]
      const key = info?.teamId ?? ''
      if (!groups.has(key)) {
        groups.set(key, {
          teamName: info!.teamName,
          teamId: info!.teamId,
          students: [],
        })
      }
      groups.get(key)!.students.push(s)
    }

    // Si "sin equipo" está vacío, lo quitamos
    if (groups.get('')!.students.length === 0) groups.delete('')

    return Array.from(groups.values()).sort((a, b) => {
      // sin equipo al final, los demás por nombre
      if (a.teamId === null) return 1
      if (b.teamId === null) return -1
      return a.teamName.localeCompare(b.teamName)
    })
  }, [students, teamByStudent])

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

  function selectGroup(studentIds: string[]) {
    setSelected((prev) => {
      const next = new Set(prev)
      const allInGroup = studentIds.every((id) => next.has(id))
      if (allInGroup) {
        studentIds.forEach((id) => next.delete(id))
      } else {
        studentIds.forEach((id) => next.add(id))
      }
      return next
    })
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
    if (xpDelta === 0 && heartsDelta === 0) return

    setBusy(true)
    const result = await adjustStudents(classroomId, studentIds, xpDelta, heartsDelta, note)
    setBusy(false)

    if (!result.success) {
      alert(`Errorea: ${result.error}`)
      return
    }

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
    if (
      !window.confirm(
        'Pasahitz berri bat sortu?\n\nIkasleak ezin izango du sartu pasahitz zaharrarekin.'
      )
    )
      return
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
        `Ziur ${s.full_name} ezabatu nahi duzula?\n\nEkintza hau ezin da desegin.`
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

      <div className="students-by-team">
        {groupedByTeam.map((group) => (
          <section key={group.teamId ?? 'none'} className="team-group">
            <header className="team-group-header">
              <h3 className="team-group-title">
                <span className="team-group-name">{group.teamName}</span>
                <span className="team-group-count">{group.students.length}</span>
              </h3>
              <button
                type="button"
                className="team-group-select"
                onClick={() => selectGroup(group.students.map((s) => s.id))}
              >
                {group.students.every((s) => selected.has(s.id))
                  ? '✕ Kendu denak'
                  : '+ Aukeratu denak'}
              </button>
            </header>

            <div className="students-grid">
              {group.students.map((s) => {
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
                      <span className="student-card-stat" title="Mana">
                        <span className="student-card-stat-icon">🔮</span>
                        <span className="student-card-stat-value">
                          {s.mana}<span className="student-card-stat-max">/{s.max_mana}</span>
                        </span>
                      </span>
                    </div>

                    <div className="student-card-quick">
                      <button
                        type="button"
                        className="student-quick-btn student-quick-positive"
                        onClick={() => applyAdjustment([s.id], 10, 0)}
                        disabled={busy}
                      >
                        +10 XP
                      </button>
                      <button
                        type="button"
                        className="student-quick-btn student-quick-negative"
                        onClick={() => applyAdjustment([s.id], 0, -1)}
                        disabled={busy || s.hearts <= 0}
                      >
                        -1 ♥
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {openStudent && (
        <StudentDetailModal
          student={openStudent}
          team={teamByStudent[openStudent.id] ?? null}
          positives={positives}
          negatives={negatives}
          busy={busy}
          onClose={() => setOpenStudent(null)}
          onAdjust={(xp, hearts, note) =>
            applyAdjustment([openStudent.id], xp, hearts, note)
          }
          onRegeneratePassword={() => handleRegenerate(openStudent.id)}
          onDelete={() => handleDelete(openStudent.id)}
        />
      )}

      {selected.size > 0 && (
        <BulkActionsBar
          count={selected.size}
          busy={busy}
          positives={positives}
          negatives={negatives}
          onClear={clearSelection}
          onAdjust={(xp, hearts, note) => {
            applyAdjustment(Array.from(selected), xp, hearts, note).then(() => {
              clearSelection()
            })
          }}
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
  team,
  positives,
  negatives,
  busy,
  onClose,
  onAdjust,
  onRegeneratePassword,
  onDelete,
}: {
  student: Student
  team: StudentTeamInfo | null
  positives: Behavior[]
  negatives: Behavior[]
  busy: boolean
  onClose: () => void
  onAdjust: (xpDelta: number, heartsDelta: number, note?: string) => void
  onRegeneratePassword: () => void
  onDelete: () => void
}) {
  const level = xpToLevel(student.xp)
  const safeAvatar = sanitizeAvatarConfig(student.avatar_config, 99)
  const [tab, setTab] = useState<'adjust' | 'behaviors' | 'powers' | 'historiala'>('adjust')

  const [customXp, setCustomXp] = useState<number>(10)
  const [customHearts, setCustomHearts] = useState<number>(-1)

  const powers = getPowersForClass(student.hero_class)
  const unlockedPowers = powers.filter((p) => p.levelRequired <= level)
  const lockedPowers = powers.filter((p) => p.levelRequired > level)

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
              {team && (
                <span className="student-detail-team">· {team.teamName}</span>
              )}
            </div>
            <div className="student-detail-meta-stats">
              <span>⚡ {student.xp} XP</span>
              <span>❤️ {student.hearts}/{student.max_hearts}</span>
              <span>🔮 {student.mana}/{student.max_mana}</span>
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

        <nav className="student-detail-tabs">
          <button
            type="button"
            className={`student-detail-tab ${tab === 'adjust' ? 'student-detail-tab-active' : ''}`}
            onClick={() => setTab('adjust')}
          >
            Doitu
          </button>
          <button
            type="button"
            className={`student-detail-tab ${tab === 'behaviors' ? 'student-detail-tab-active' : ''}`}
            onClick={() => setTab('behaviors')}
          >
            Jokabideak
          </button>
          <button
            type="button"
            className={`student-detail-tab ${tab === 'powers' ? 'student-detail-tab-active' : ''}`}
            onClick={() => setTab('powers')}
          >
            Botereak
          </button>
          <button
            type="button"
            className={`student-detail-tab ${tab === 'historiala' ? 'student-detail-tab-active' : ''}`}
            onClick={() => setTab('historiala')}
          >
            Historiala
          </button>
        </nav>

        <div className="student-detail-body">
          {tab === 'adjust' && (
            <div className="student-adjust-tab">
              <CustomAdjustControl
                label="Esperientzia"
                icon="⚡"
                value={customXp}
                onChange={setCustomXp}
                onApply={() => onAdjust(customXp, 0)}
                presets={[5, 10, 20, 50, 100, -10]}
                busy={busy}
              />
              <CustomAdjustControl
                label="Bihotzak"
                icon="❤️"
                value={customHearts}
                onChange={setCustomHearts}
                onApply={() => onAdjust(0, customHearts)}
                presets={[1, -1, -2, -3, -5]}
                busy={busy}
              />
            </div>
          )}

          {tab === 'behaviors' && (
            <div className="student-behaviors-tab">
              {positives.length > 0 && (
                <section className="student-behaviors-section">
                  <h3 className="student-behaviors-title">
                    <span>👍</span> Sariak
                  </h3>
                  <ul className="student-behaviors-list">
                    {positives.map((b) => (
                      <li key={b.id}>
                        <button
                          type="button"
                          className="behavior-apply-btn behavior-apply-positive"
                          onClick={() =>
                            onAdjust(b.xp_delta, b.hearts_delta, b.description)
                          }
                          disabled={busy}
                        >
                          <span className="behavior-apply-desc">{b.description}</span>
                          <span className="behavior-apply-deltas">
                            {b.xp_delta !== 0 && (
                              <span>+{b.xp_delta} XP</span>
                            )}
                            {b.hearts_delta !== 0 && (
                              <span>{b.hearts_delta > 0 ? '+' : ''}{b.hearts_delta} ♥</span>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {negatives.length > 0 && (
                <section className="student-behaviors-section">
                  <h3 className="student-behaviors-title">
                    <span>⚠️</span> Abisuak
                  </h3>
                  <ul className="student-behaviors-list">
                    {negatives.map((b) => (
                      <li key={b.id}>
                        <button
                          type="button"
                          className="behavior-apply-btn behavior-apply-negative"
                          onClick={() =>
                            onAdjust(b.xp_delta, b.hearts_delta, b.description)
                          }
                          disabled={busy || (student.hearts === 0 && b.hearts_delta < 0)}
                        >
                          <span className="behavior-apply-desc">{b.description}</span>
                          <span className="behavior-apply-deltas">
                            {b.xp_delta !== 0 && (
                              <span>{b.xp_delta > 0 ? '+' : ''}{b.xp_delta} XP</span>
                            )}
                            {b.hearts_delta !== 0 && (
                              <span>{b.hearts_delta > 0 ? '+' : ''}{b.hearts_delta} ♥</span>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {tab === 'powers' && (
            <div className="student-powers-tab">
              <p className="student-powers-note">
                Ikasleak bere panelean erabiltzen ditu botereak. Hemen ikus
                ditzakezu zein dauden desblokeatuta.
              </p>
              {unlockedPowers.length > 0 && (
                <section className="student-powers-section">
                  <h3 className="student-powers-title">Desblokeatuak</h3>
                  <ul className="student-powers-list">
                    {unlockedPowers.map((p) => (
                      <li key={p.id} className="student-power-item">
                        <span className="student-power-icon" aria-hidden="true">
                          {p.icon}
                        </span>
                        <div className="student-power-info">
                          <span className="student-power-name">
                            {p.name}
                            {p.mode === 'auto' && (
                              <span className="student-power-mode-auto"> · auto</span>
                            )}
                            {p.mode === 'manual' && (
                              <span className="student-power-mode-manual"> · onarpena</span>
                            )}
                          </span>
                          <span className="student-power-desc">{p.description}</span>
                        </div>
                        <span className="student-power-cost-badge">🔮 {p.manaCost}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {lockedPowers.length > 0 && (
                <section className="student-powers-section student-powers-locked">
                  <h3 className="student-powers-title">Blokeatuak</h3>
                  <ul className="student-powers-list">
                    {lockedPowers.map((p) => (
                      <li key={p.id} className="student-power-item student-power-item-locked">
                        <span className="student-power-icon" aria-hidden="true">
                          {p.icon}
                        </span>
                        <div className="student-power-info">
                          <span className="student-power-name">{p.name}</span>
                          <span className="student-power-desc">{p.description}</span>
                        </div>
                        <span className="student-power-locked-label">
                          🔒 Mla {p.levelRequired}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {tab === 'historiala' && (
            <StudentHistory
              studentId={student.id}
              studentName={student.full_name}
            />
          )}
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
            Ezabatu
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

function CustomAdjustControl({
  label,
  icon,
  value,
  onChange,
  onApply,
  presets,
  busy,
}: {
  label: string
  icon: string
  value: number
  onChange: (v: number) => void
  onApply: () => void
  presets: number[]
  busy: boolean
}) {
  return (
    <div className="stat-control">
      <div className="stat-control-header">
        <span className="stat-control-icon">{icon}</span>
        <span className="stat-control-label">{label}</span>
      </div>
      <div className="stat-control-custom">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10)
            onChange(isNaN(n) ? 0 : n)
          }}
          className="stat-control-input"
          aria-label={`${label} kopurua`}
        />
        <button
          type="button"
          className="stat-control-apply"
          onClick={onApply}
          disabled={busy || value === 0}
        >
          Aplikatu
        </button>
      </div>
      <div className="stat-control-buttons">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            className={`stat-preset-btn ${p < 0 ? 'stat-preset-negative' : 'stat-preset-positive'}`}
            onClick={() => onChange(p)}
            disabled={busy}
          >
            {p > 0 ? '+' : ''}
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

function BulkActionsBar({
  count,
  busy,
  positives,
  negatives,
  onClear,
  onAdjust,
}: {
  count: number
  busy: boolean
  positives: Behavior[]
  negatives: Behavior[]
  onClear: () => void
  onAdjust: (xpDelta: number, heartsDelta: number, note?: string) => void
}) {
  const [expanded, setExpanded] = useState<'none' | 'positive' | 'negative' | 'custom'>('none')
  const [customXp, setCustomXp] = useState(10)
  const [customHearts, setCustomHearts] = useState(0)

  return (
    <div className="bulk-bar" role="region" aria-label="Talde-akzioak">
      <div className="bulk-bar-info">
        <span className="bulk-bar-count">{count}</span>
        <span>ikasle aukeratuta</span>
      </div>

      <div className="bulk-bar-actions">
        <button
          type="button"
          className={`bulk-btn bulk-btn-positive ${expanded === 'positive' ? 'bulk-btn-active' : ''}`}
          onClick={() =>
            setExpanded(expanded === 'positive' ? 'none' : 'positive')
          }
          disabled={busy}
        >
          👍 Saritu
        </button>
        <button
          type="button"
          className={`bulk-btn bulk-btn-negative ${expanded === 'negative' ? 'bulk-btn-active' : ''}`}
          onClick={() =>
            setExpanded(expanded === 'negative' ? 'none' : 'negative')
          }
          disabled={busy}
        >
          ⚠️ Abisua
        </button>
        <button
          type="button"
          className={`bulk-btn bulk-btn-neutral ${expanded === 'custom' ? 'bulk-btn-active' : ''}`}
          onClick={() =>
            setExpanded(expanded === 'custom' ? 'none' : 'custom')
          }
          disabled={busy}
        >
          ✏️ Pertsonalizatu
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

      {expanded !== 'none' && (
        <div className="bulk-bar-expansion">
          {expanded === 'positive' && (
            <ul className="bulk-behavior-list">
              {positives.length === 0 ? (
                <li className="bulk-behavior-empty">
                  Ez dago jokabide positiborik konfiguratuta.
                </li>
              ) : (
                positives.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      className="bulk-behavior-btn bulk-behavior-positive"
                      onClick={() => {
                        onAdjust(b.xp_delta, b.hearts_delta, b.description)
                      }}
                      disabled={busy}
                    >
                      <span>{b.description}</span>
                      <span className="bulk-behavior-deltas">
                        {b.xp_delta !== 0 && <span>+{b.xp_delta} XP</span>}
                        {b.hearts_delta !== 0 && (
                          <span>
                            {b.hearts_delta > 0 ? '+' : ''}
                            {b.hearts_delta} ♥
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}

          {expanded === 'negative' && (
            <ul className="bulk-behavior-list">
              {negatives.length === 0 ? (
                <li className="bulk-behavior-empty">
                  Ez dago abisurik konfiguratuta.
                </li>
              ) : (
                negatives.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      className="bulk-behavior-btn bulk-behavior-negative"
                      onClick={() => {
                        onAdjust(b.xp_delta, b.hearts_delta, b.description)
                      }}
                      disabled={busy}
                    >
                      <span>{b.description}</span>
                      <span className="bulk-behavior-deltas">
                        {b.xp_delta !== 0 && (
                          <span>
                            {b.xp_delta > 0 ? '+' : ''}
                            {b.xp_delta} XP
                          </span>
                        )}
                        {b.hearts_delta !== 0 && (
                          <span>
                            {b.hearts_delta > 0 ? '+' : ''}
                            {b.hearts_delta} ♥
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}

          {expanded === 'custom' && (
            <div className="bulk-custom">
              <label className="bulk-custom-field">
                <span>XP</span>
                <input
                  type="number"
                  value={customXp}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10)
                    setCustomXp(isNaN(n) ? 0 : n)
                  }}
                  className="bulk-custom-input"
                />
              </label>
              <label className="bulk-custom-field">
                <span>♥</span>
                <input
                  type="number"
                  value={customHearts}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10)
                    setCustomHearts(isNaN(n) ? 0 : n)
                  }}
                  className="bulk-custom-input"
                />
              </label>
              <button
                type="button"
                className="bulk-custom-apply"
                onClick={() => onAdjust(customXp, customHearts)}
                disabled={busy || (customXp === 0 && customHearts === 0)}
              >
                Aplikatu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
