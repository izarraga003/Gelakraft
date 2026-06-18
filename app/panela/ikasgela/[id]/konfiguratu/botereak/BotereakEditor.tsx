'use client'

import { useState } from 'react'
import { setOverride, type EffectivePower } from '@/lib/powers/overrides'
import type { HeroClass } from '@/lib/students/hero-class'
import { POWERS_BY_CLASS } from '@/lib/powers/catalog'

type Group = {
  heroClass: HeroClass
  label: string
  powers: EffectivePower[]
}

type Props = {
  classroomId: string
  groups: Group[]
}

export default function BotereakEditor({ classroomId, groups: initial }: Props) {
  const [groups, setGroups] = useState<Group[]>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function getOriginal(powerId: string, heroClass: HeroClass) {
    return POWERS_BY_CLASS[heroClass].find((p) => p.id === powerId)
  }

  async function saveOverride(
    heroClass: HeroClass,
    powerId: string,
    mode: 'auto' | 'manual',
    manaCost: number
  ) {
    setBusy(true)
    setError(null)
    const orig = getOriginal(powerId, heroClass)
    if (!orig) {
      setBusy(false)
      return
    }
    // Si coinciden con el catálogo, borrar override
    const sameMode = orig.mode === mode
    const sameCost = orig.manaCost === manaCost
    const result = await setOverride({
      classroomId,
      powerId,
      mode: sameMode ? null : mode,
      manaCost: sameCost ? null : manaCost,
    })
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    setGroups((prev) =>
      prev.map((g) =>
        g.heroClass !== heroClass
          ? g
          : {
              ...g,
              powers: g.powers.map((p) =>
                p.id !== powerId
                  ? p
                  : {
                      ...p,
                      effectiveMode: mode,
                      effectiveManaCost: manaCost,
                      isOverridden: !sameMode || !sameCost,
                    }
              ),
            }
      )
    )
  }

  return (
    <>
      {error && (
        <div className="behaviors-error" role="alert">
          {error}
        </div>
      )}

      {groups.map((g) => (
        <section key={g.heroClass} className="botereak-group">
          <h3 className="botereak-group-title">
            <span className={`student-hero-class hero-${g.heroClass}`}>
              {g.label}
            </span>
          </h3>

          <div className="botereak-table-wrapper">
            <table className="botereak-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Izena</th>
                  <th>Maila</th>
                  <th>Mana</th>
                  <th>Baieztatu?</th>
                </tr>
              </thead>
              <tbody>
                {g.powers.map((p) => (
                  <tr key={p.id}>
                    <td className="botereak-icon">{p.icon}</td>
                    <td>
                      <strong>{p.name}</strong>
                      <p className="botereak-desc">{p.description}</p>
                    </td>
                    <td className="botereak-num">{p.levelRequired}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        defaultValue={p.effectiveManaCost}
                        onBlur={(e) => {
                          const n = parseInt(e.target.value, 10)
                          if (isNaN(n)) {
                            e.target.value = String(p.effectiveManaCost)
                            return
                          }
                          if (n !== p.effectiveManaCost) {
                            saveOverride(
                              g.heroClass,
                              p.id,
                              p.effectiveMode,
                              Math.max(0, Math.min(20, n))
                            )
                          }
                        }}
                        className="botereak-mana-input"
                        disabled={busy}
                      />
                    </td>
                    <td>
                      <label className="botereak-toggle">
                        <input
                          type="checkbox"
                          checked={p.effectiveMode === 'manual'}
                          onChange={(e) =>
                            saveOverride(
                              g.heroClass,
                              p.id,
                              e.target.checked ? 'manual' : 'auto',
                              p.effectiveManaCost
                            )
                          }
                          disabled={busy}
                        />
                        <span>
                          {p.effectiveMode === 'manual'
                            ? 'Baieztatu'
                            : 'Automatikoa'}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  )
}
