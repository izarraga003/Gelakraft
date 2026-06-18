'use client'

import { useState } from 'react'
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

  async function handleCreate() {
    setError(null)
    const name = newTeamName.trim()
    if (!name) {
      setError('Talde izena sartu behar duzu.')
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
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, name: trimmed } : t)))
  }

  async function handleDelete(teamId: string) {
    if (!window.confirm('Ziur talde hau ezabatu nahi duzula? Ikasleak banatu gabe geratuko dira.'))
      return
    setBusy(true)
    const result = await deleteTeam(teamId, classroomId)
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    // mover miembros a unassigned
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

  async function handleAssign(studentId: string, targetTeamId: string | null) {
    setBusy(true)
    const result = await assignStudentToTeam(studentId, targetTeamId, classroomId)
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    // Reorganizar estado local
    let movedStudent: SimpleStudent | null = null

    // Quitar de donde estuviera
    setTeams((prev) =>
      prev.map((t) => {
        const found = t.members.find((m) => m.id === studentId)
        if (found) {
          movedStudent = {
            id: found.id,
            full_name: found.full_name,
            hero_class: found.hero_class,
            avatar_config: found.avatar_config,
            xp: found.xp,
          }
          return { ...t, members: t.members.filter((m) => m.id !== studentId) }
        }
        return t
      })
    )
    setUnassigned((prev) => {
      const idx = prev.findIndex((s) => s.id === studentId)
      if (idx >= 0) {
        movedStudent = prev[idx]
        return prev.filter((s) => s.id !== studentId)
      }
      return prev
    })

    // Insertarlo donde toque
    if (movedStudent !== null) {
      const ms = movedStudent as SimpleStudent
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
  }

  function renderTeamMemberRow(
    m: { id: string; full_name: string; hero_class: HeroClass; avatar_config: Record<string, unknown>; xp: number },
    currentTeamId: string | null
  ) {
    const cfg = sanitizeAvatarConfig(m.avatar_config as AvatarConfig, 99)
    return (
      <li key={m.id} className="team-member">
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
        <select
          className="team-member-select"
          value={currentTeamId ?? ''}
          onChange={(e) => {
            const v = e.target.value
            handleAssign(m.id, v === '' ? null : v)
          }}
          disabled={busy}
          aria-label="Talde aldatu"
        >
          <option value="">— Talderik gabe —</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
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

      {/* Sin equipo */}
      {unassigned.length > 0 && (
        <section className="teams-unassigned">
          <header className="teams-unassigned-header">
            <h2 className="teams-unassigned-title">
              Talderik gabe ({unassigned.length})
            </h2>
            <p className="teams-unassigned-hint">
              Esleitu ikasle hauei talde bat goitibeherako menutik.
            </p>
          </header>
          <ul className="team-members teams-unassigned-list">
            {unassigned.map((s) => renderTeamMemberRow(s, null))}
          </ul>
        </section>
      )}

      {/* Equipos */}
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
            <article key={t.id} className="team-card">
              <header className="team-card-header">
                <input
                  type="text"
                  className="team-card-name-input"
                  defaultValue={t.name}
                  onBlur={(e) => {
                    if (e.target.value.trim() && e.target.value.trim() !== t.name) {
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
                <p className="team-empty">Hutsik.</p>
              ) : (
                <ul className="team-members">
                  {t.members.map((m) => renderTeamMemberRow(m, t.id))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  )
}
