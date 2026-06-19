'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Power } from '@/lib/powers/catalog'
import type { EffectivePower } from '@/lib/powers/overrides'
import type { HeroClass } from '@/lib/students/hero-class'
import { studentInvokePower } from '@/lib/powers/actions'
import { sanitizeAvatarConfig, type AvatarConfig } from '@/lib/students/avatar'
import { xpToLevel } from '@/lib/students/level'
import AvatarRender from './AvatarRender'

type TeamMember = {
  id: string
  full_name: string
  hero_class: HeroClass
  avatar_config: AvatarConfig
  xp: number
}

type PendingRequest = {
  id: string
  power_id: string
  power_name: string
  mana_cost: number
  status: 'pending' | 'approved' | 'denied'
  created_at: string
  resolved_at: string | null
}

type Props = {
  level: number
  mana: number
  studentId: string
  teamMembers: TeamMember[]
  pendingRequests: PendingRequest[]
  powers: EffectivePower[]
}

export default function MyPowers({
  level,
  mana,
  studentId,
  teamMembers,
  pendingRequests,
  powers,
}: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [targetingPower, setTargetingPower] = useState<EffectivePower | null>(null)

  const unlocked = powers.filter((p) => p.effectiveLevelRequired <= level)
  const locked = powers.filter((p) => p.effectiveLevelRequired > level)

  const teamMatesExcludingSelf = teamMembers.filter((m) => m.id !== studentId)

  async function invoke(power: Power, targetId?: string) {
    setMessage(null)
    setBusy(true)
    const result = await studentInvokePower(power.id, targetId)
    setBusy(false)

    if (!result.success) {
      setMessage({ kind: 'err', text: result.error ?? 'Errorea.' })
      return
    }
    setMessage({
      kind: 'ok',
      text: result.pending
        ? `${power.name} eskatu da. Irakasleak baieztatu behar du.`
        : `${power.name} aplikatu da!`,
    })
    setTargetingPower(null)
    router.refresh()
  }

  function handleClick(power: EffectivePower) {
    if (busy) return
    if (mana < power.effectiveManaCost) {
      setMessage({ kind: 'err', text: 'Mana nahikorik ez.' })
      return
    }

    if (power.effectiveMode === 'auto' && power.mode === 'auto') {
      if (power.requiresTarget) {
        if (teamMatesExcludingSelf.length === 0) {
          setMessage({
            kind: 'err',
            text: 'Taldekiderik gabe ezin duzu botere hau erabili.',
          })
          return
        }
        setTargetingPower(power)
      } else {
        // Para algunos efectos auto sin target requieren equipo (xp_team, heal_team, mana_team)
        if (
          ['heal_team_except_self', 'mana_team_except_self', 'xp_team_all'].includes(
            power.effect
          ) &&
          teamMembers.length === 0
        ) {
          setMessage({
            kind: 'err',
            text: 'Talde batean egon behar duzu botere hau erabiltzeko.',
          })
          return
        }
        invoke(power)
      }
    } else {
      // manual (o auto con override a manual) → confirmación
      if (
        !window.confirm(
          `${power.name} eskatu? Mana ${power.effectiveManaCost} erreserbatu egingo da. Irakasleak baieztatu beharko du.`
        )
      )
        return
      invoke(power)
    }
  }

  return (
    <section className="my-powers-section">
      <header className="student-section-header">
        <h2 className="student-section-title">Nire botereak</h2>
        <span className="my-powers-mana">🔮 {mana} mana</span>
      </header>

      {message && (
        <div
          className={`my-powers-message my-powers-message-${message.kind}`}
          role="status"
        >
          {message.text}
        </div>
      )}

      {pendingRequests.filter((r) => r.status === 'pending').length > 0 && (
        <section className="my-powers-group my-powers-pending">
          <h3 className="my-powers-group-title">Zain dauden eskaerak</h3>
          <ul className="my-powers-list">
            {pendingRequests
              .filter((r) => r.status === 'pending')
              .map((r) => (
                <li key={r.id} className="my-power-card my-power-card-pending">
                  <span className="my-power-icon" aria-hidden="true">
                    ⏳
                  </span>
                  <div className="my-power-info">
                    <span className="my-power-name">{r.power_name}</span>
                    <span className="my-power-desc">
                      Irakasleak baieztatu behar du.
                    </span>
                  </div>
                  <span className="my-power-cost">🔮 {r.mana_cost}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      {unlocked.length > 0 && (
        <section className="my-powers-group">
          <h3 className="my-powers-group-title">Eskura</h3>
          <ul className="my-powers-list">
            {unlocked.map((p) => {
              const canAfford = mana >= p.effectiveManaCost
              const isAuto = p.effectiveMode === 'auto' && p.mode === 'auto'
              return (
                <li
                  key={p.id}
                  className={`my-power-card ${!canAfford ? 'my-power-card-noemana' : ''}`}
                >
                  <span className="my-power-icon" aria-hidden="true">
                    {p.effectiveIcon}
                  </span>
                  <div className="my-power-info">
                    <span className="my-power-name">
                      {p.effectiveName}
                      {p.collaborative && (
                        <span className="my-power-collab"> · talde</span>
                      )}
                      {isAuto ? (
                        <span className="my-power-tag my-power-tag-auto"> · auto</span>
                      ) : (
                        <span className="my-power-tag my-power-tag-manual"> · baieztatu</span>
                      )}
                    </span>
                    <span className="my-power-desc">{p.effectiveDescription}</span>
                  </div>
                  <button
                    type="button"
                    className="my-power-use-btn"
                    onClick={() => handleClick(p)}
                    disabled={busy || !canAfford}
                    title={
                      !canAfford
                        ? `Mana ${p.effectiveManaCost} behar da`
                        : 'Erabili'
                    }
                  >
                    <span className="my-power-use-cost">🔮 {p.effectiveManaCost}</span>
                    <span>Erabili</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {locked.length > 0 && (
        <section className="my-powers-group my-powers-locked">
          <h3 className="my-powers-group-title">Datozenak</h3>
          <ul className="my-powers-list">
            {locked.slice(0, 3).map((p) => (
              <li key={p.id} className="my-power-card my-power-card-locked">
                <span className="my-power-icon" aria-hidden="true">
                  {p.effectiveIcon}
                </span>
                <div className="my-power-info">
                  <span className="my-power-name">{p.effectiveName}</span>
                  <span className="my-power-desc">{p.effectiveDescription}</span>
                </div>
                <span className="my-power-locked-label">
                  🔒 Mla {p.effectiveLevelRequired}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Modal de selección de target */}
      {targetingPower && (
        <div
          className="avatar-picker-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setTargetingPower(null)
          }}
          role="dialog"
        >
          <div className="power-target-modal">
            <header className="avatar-picker-header">
              <h2 className="avatar-picker-title">
                {targetingPower.name} · Helburua aukeratu
              </h2>
              <button
                type="button"
                className="avatar-picker-close"
                onClick={() => setTargetingPower(null)}
              >
                ✕
              </button>
            </header>
            <div className="power-target-body">
              {teamMatesExcludingSelf.length === 0 ? (
                <p>Ez duzu taldekiderik.</p>
              ) : (
                <ul className="power-target-list">
                  {teamMatesExcludingSelf.map((m) => {
                    const cfg = sanitizeAvatarConfig(m.avatar_config, 99)
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          className="power-target-btn"
                          onClick={() => invoke(targetingPower, m.id)}
                          disabled={busy}
                        >
                          <span className="power-target-avatar">
                            <AvatarRender config={cfg} size={44} />
                          </span>
                          <span className="power-target-info">
                            <span className="power-target-name">
                              {m.full_name}
                            </span>
                            <span className="power-target-meta">
                              {m.hero_class} · Mla {xpToLevel(m.xp)}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
