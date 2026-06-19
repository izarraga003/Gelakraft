'use client'

import { useState } from 'react'
import {
  setOverride,
  resetOverride,
  type EffectivePower,
} from '@/lib/powers/overrides'
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

/** Lista corta de emojis recomendados al cambiar el icon */
const EMOJI_SUGGESTIONS = [
  '✨','🔥','💧','🌊','⚡','🌙','🌟','💫','🛡️','⚔️','🏹','💎',
  '🔮','🪄','💖','💚','💙','💜','🐺','🐻','🦉','🌲','🏔️','🌌',
  '🍃','🌀','☁️','📜','🎲','🎯','🌪️','🌋','🦅','🐉','🐍','🧿',
]

export default function BotereakEditor({ classroomId, groups: initial }: Props) {
  const [groups, setGroups] = useState<Group[]>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function getOriginal(powerId: string, heroClass: HeroClass) {
    return POWERS_BY_CLASS[heroClass].find((p) => p.id === powerId)
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /**
   * Guarda los campos efectivos como override. Si un campo coincide con el
   * catálogo original, lo deja como null (no override). Si todos coinciden,
   * el override entero se borra.
   */
  async function saveAll(p: EffectivePower, heroClass: HeroClass) {
    const orig = getOriginal(p.id, heroClass)
    if (!orig) return

    setBusy(true)
    setError(null)
    const result = await setOverride({
      classroomId,
      powerId: p.id,
      mode: orig.mode === p.effectiveMode ? null : p.effectiveMode,
      manaCost: orig.manaCost === p.effectiveManaCost ? null : p.effectiveManaCost,
      name: orig.name === p.effectiveName ? null : p.effectiveName,
      description:
        orig.description === p.effectiveDescription ? null : p.effectiveDescription,
      levelRequired:
        orig.levelRequired === p.effectiveLevelRequired ? null : p.effectiveLevelRequired,
      icon: orig.icon === p.effectiveIcon ? null : p.effectiveIcon,
    })
    setBusy(false)
    if (!result.success) setError(result.error ?? 'Errorea.')
  }

  async function handleReset(p: EffectivePower, heroClass: HeroClass) {
    if (!window.confirm('Berrezarri jatorrizko balioetara?')) return
    setBusy(true)
    setError(null)
    const result = await resetOverride({ classroomId, powerId: p.id })
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    const orig = getOriginal(p.id, heroClass)
    if (!orig) return
    updatePower(heroClass, p.id, {
      effectiveMode: orig.mode,
      effectiveManaCost: orig.manaCost,
      effectiveName: orig.name,
      effectiveDescription: orig.description,
      effectiveLevelRequired: orig.levelRequired,
      effectiveIcon: orig.icon,
      isOverridden: false,
    })
  }

  function updatePower(
    heroClass: HeroClass,
    powerId: string,
    patch: Partial<EffectivePower>
  ) {
    setGroups((prev) =>
      prev.map((g) =>
        g.heroClass !== heroClass
          ? g
          : {
              ...g,
              powers: g.powers.map((x) =>
                x.id !== powerId
                  ? x
                  : ({ ...x, ...patch, isOverridden: true } as EffectivePower)
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

          <ul className="botereak-cards">
            {g.powers.map((p) => {
              const isOpen = expanded.has(p.id)
              return (
                <li
                  key={p.id}
                  className={`botereak-card ${
                    p.isOverridden ? 'botereak-card-overridden' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="botereak-card-summary"
                    onClick={() => toggle(p.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="botereak-card-icon">{p.effectiveIcon}</span>
                    <div className="botereak-card-text">
                      <span className="botereak-card-name">
                        {p.effectiveName}
                        {p.isOverridden && (
                          <span className="botereak-card-badge">aldatuta</span>
                        )}
                      </span>
                      <span className="botereak-card-meta">
                        Mla {p.effectiveLevelRequired} · 🔮{' '}
                        {p.effectiveManaCost} · {p.effectiveMode === 'manual' ? 'Baieztatu' : 'Auto'}
                      </span>
                    </div>
                    <span className="botereak-card-chev" aria-hidden="true">
                      {isOpen ? '▾' : '▸'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="botereak-card-body">
                      <div className="botereak-field">
                        <label className="botereak-label">Ikonoa</label>
                        <div className="botereak-icon-row">
                          <input
                            type="text"
                            value={p.effectiveIcon}
                            onChange={(e) =>
                              updatePower(g.heroClass, p.id, {
                                effectiveIcon: e.target.value.slice(0, 4),
                              })
                            }
                            onBlur={() => saveAll(p, g.heroClass)}
                            className="botereak-icon-input"
                            maxLength={4}
                          />
                          <div className="botereak-emoji-picker" role="group">
                            {EMOJI_SUGGESTIONS.map((emo) => (
                              <button
                                key={emo}
                                type="button"
                                className="botereak-emoji-btn"
                                onClick={() => {
                                  updatePower(g.heroClass, p.id, {
                                    effectiveIcon: emo,
                                  })
                                  // guardar tras seleccionar
                                  saveAll(
                                    { ...p, effectiveIcon: emo },
                                    g.heroClass
                                  )
                                }}
                                disabled={busy}
                                title={emo}
                              >
                                {emo}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="botereak-field">
                        <label className="botereak-label">Izena</label>
                        <input
                          type="text"
                          value={p.effectiveName}
                          onChange={(e) =>
                            updatePower(g.heroClass, p.id, {
                              effectiveName: e.target.value,
                            })
                          }
                          onBlur={() => saveAll(p, g.heroClass)}
                          className="botereak-text-input"
                          disabled={busy}
                          maxLength={60}
                        />
                      </div>

                      <div className="botereak-field">
                        <label className="botereak-label">Deskribapena</label>
                        <textarea
                          value={p.effectiveDescription}
                          onChange={(e) =>
                            updatePower(g.heroClass, p.id, {
                              effectiveDescription: e.target.value,
                            })
                          }
                          onBlur={() => saveAll(p, g.heroClass)}
                          className="botereak-textarea"
                          disabled={busy}
                          maxLength={240}
                          rows={2}
                        />
                      </div>

                      <div className="botereak-field-row">
                        <div className="botereak-field">
                          <label className="botereak-label">
                            Desblokeatze maila
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={p.effectiveLevelRequired}
                            onChange={(e) => {
                              const n = parseInt(e.target.value, 10)
                              updatePower(g.heroClass, p.id, {
                                effectiveLevelRequired: isNaN(n)
                                  ? p.effectiveLevelRequired
                                  : Math.max(1, Math.min(50, n)),
                              })
                            }}
                            onBlur={() => saveAll(p, g.heroClass)}
                            className="botereak-num-input"
                            disabled={busy}
                          />
                        </div>

                        <div className="botereak-field">
                          <label className="botereak-label">
                            Mana kostua
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={p.effectiveManaCost}
                            onChange={(e) => {
                              const n = parseInt(e.target.value, 10)
                              updatePower(g.heroClass, p.id, {
                                effectiveManaCost: isNaN(n)
                                  ? p.effectiveManaCost
                                  : Math.max(0, Math.min(20, n)),
                              })
                            }}
                            onBlur={() => saveAll(p, g.heroClass)}
                            className="botereak-num-input"
                            disabled={busy}
                          />
                        </div>

                        <div className="botereak-field">
                          <label className="botereak-label">
                            Baieztapena
                          </label>
                          <label className="botereak-toggle">
                            <input
                              type="checkbox"
                              checked={p.effectiveMode === 'manual'}
                              onChange={(e) => {
                                const newMode = e.target.checked
                                  ? 'manual'
                                  : 'auto'
                                updatePower(g.heroClass, p.id, {
                                  effectiveMode: newMode,
                                })
                                saveAll(
                                  { ...p, effectiveMode: newMode },
                                  g.heroClass
                                )
                              }}
                              disabled={busy}
                            />
                            <span>
                              {p.effectiveMode === 'manual'
                                ? 'Baieztatu egin behar dut'
                                : 'Automatikoki aplikatu'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {p.isOverridden && (
                        <div className="botereak-actions">
                          <button
                            type="button"
                            className="botereak-reset-btn"
                            onClick={() => handleReset(p, g.heroClass)}
                            disabled={busy}
                          >
                            ↺ Jatorrizkoa berrezarri
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </>
  )
}
