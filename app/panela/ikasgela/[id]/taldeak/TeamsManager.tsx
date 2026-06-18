'use client'

import { useState } from 'react'
import { generateTeams, deleteAllTeams, type Team } from '@/lib/teams/actions'
import { HERO_CLASS_LABELS } from '@/lib/students/hero-class'
import { sanitizeAvatarConfig, type AvatarConfig } from '@/lib/students/avatar'
import { xpToLevel } from '@/lib/students/level'
import AvatarRender from '@/components/student/AvatarRender'

type Props = {
  classroomId: string
  initialTeams: Team[]
  countsByClass: { sorgina: number; lamia: number; jentila: number }
  maxTeams: number
}

export default function TeamsManager({
  classroomId,
  initialTeams,
  countsByClass,
  maxTeams,
}: Props) {
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canGenerate = maxTeams > 0

  async function handleGenerate() {
    setError(null)
    setSuccess(null)
    if (teams.length > 0) {
      if (
        !window.confirm(
          'Talde berriak sortuko dira eta oraingoak ezabatu egingo dira. Aurrera?'
        )
      ) {
        return
      }
    }
    setBusy(true)
    const result = await generateTeams(classroomId)
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    setSuccess(`${result.numTeams} talde sortu dira.`)
    // Recargar
    location.reload()
  }

  async function handleDeleteAll() {
    if (!window.confirm('Talde guztiak ezabatu nahi dituzu?')) return
    setBusy(true)
    const result = await deleteAllTeams(classroomId)
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    setTeams([])
    setSuccess('Talde guztiak ezabatu dira.')
  }

  return (
    <>
      <section className="teams-stats">
        <div className="teams-stat teams-stat-sorgina">
          <span className="teams-stat-icon">🟣</span>
          <span className="teams-stat-value">{countsByClass.sorgina}</span>
          <span className="teams-stat-label">Sorgina</span>
        </div>
        <div className="teams-stat teams-stat-lamia">
          <span className="teams-stat-icon">🔵</span>
          <span className="teams-stat-value">{countsByClass.lamia}</span>
          <span className="teams-stat-label">Lamia</span>
        </div>
        <div className="teams-stat teams-stat-jentila">
          <span className="teams-stat-icon">🟡</span>
          <span className="teams-stat-value">{countsByClass.jentila}</span>
          <span className="teams-stat-label">Jentila</span>
        </div>
        <div className="teams-stat teams-stat-result">
          <span className="teams-stat-icon">👥</span>
          <span className="teams-stat-value">{maxTeams}</span>
          <span className="teams-stat-label">Talde sor daitezke</span>
        </div>
      </section>

      <section className="teams-controls">
        {!canGenerate && (
          <p className="teams-warning">
            Ezin dira taldeak sortu: gutxienez sorgina, lamia eta jentila bana
            behar dituzu ikasgelan.
          </p>
        )}
        <div className="teams-controls-buttons">
          <button
            type="button"
            className="panel-cta-btn"
            onClick={handleGenerate}
            disabled={busy || !canGenerate}
          >
            {teams.length === 0 ? '⚡ Taldeak sortu' : '🔄 Berriz sortu'}
          </button>
          {teams.length > 0 && (
            <button
              type="button"
              className="panel-btn-secondary"
              onClick={handleDeleteAll}
              disabled={busy}
            >
              Talde guztiak ezabatu
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="behaviors-error" role="alert">
          {error}
        </div>
      )}
      {success && <div className="teams-success">{success}</div>}

      {teams.length === 0 ? (
        <div className="panel-empty-state">
          <p>Oraindik ez dago talderik sortu.</p>
          <p className="panel-empty-hint">
            Sakatu &laquo;Taldeak sortu&raquo; klasea automatikoki banatzeko.
          </p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((t) => (
            <article key={t.id} className="team-card">
              <header className="team-card-header">
                <h3 className="team-card-name">{t.name}</h3>
                <span className="team-card-count">{t.members.length} kide</span>
              </header>
              <ul className="team-members">
                {t.members.map((m) => {
                  const cfg = sanitizeAvatarConfig(
                    m.avatar_config as AvatarConfig,
                    99
                  )
                  return (
                    <li key={m.id} className="team-member">
                      <span className="team-member-avatar">
                        <AvatarRender config={cfg} size={42} />
                      </span>
                      <div className="team-member-info">
                        <span className="team-member-name">{m.full_name}</span>
                        <span
                          className={`student-hero-class hero-${m.hero_class}`}
                        >
                          {HERO_CLASS_LABELS[m.hero_class]}
                        </span>
                      </div>
                      <span className="team-member-level">
                        Mla {xpToLevel(m.xp)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
