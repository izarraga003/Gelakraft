'use client'

import { useMemo, useRef, useState } from 'react'
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

/** Snapshot de los campos editables de un poder para detectar cambios */
type Snapshot = {
  mode: 'auto' | 'manual'
  manaCost: number
  name: string
  description: string
  levelRequired: number
  icon: string
}

function toSnapshot(p: EffectivePower): Snapshot {
  return {
    mode: p.effectiveMode,
    manaCost: p.effectiveManaCost,
    name: p.effectiveName,
    description: p.effectiveDescription,
    levelRequired: p.effectiveLevelRequired,
    icon: p.effectiveIcon,
  }
}

function snapshotsEqual(a: Snapshot, b: Snapshot): boolean {
  return (
    a.mode === b.mode &&
    a.manaCost === b.manaCost &&
    a.name === b.name &&
    a.description === b.description &&
    a.levelRequired === b.levelRequired &&
    a.icon === b.icon
  )
}

export default function BotereakEditor({ classroomId, groups: initial }: Props) {
  const [groups, setGroups] = useState<Group[]>(initial)
  const [busy, setBusy] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Snapshot inmutable de cada poder TAL Y COMO ESTÁ EN BD (al cargar y tras
  // cada guardado). Se usa para detectar si una card está "dirty".
  const savedSnapshotRef = useRef<Map<string, Snapshot>>(
    new Map(
      initial.flatMap((g) => g.powers.map((p) => [p.id, toSnapshot(p)] as const))
    )
  )

  // Mapa id → poder actual para acceso rápido
  const allPowers = useMemo(
    () =>
      groups.flatMap((g) => g.powers.map((p) => ({ heroClass: g.heroClass, p }))),
    [groups]
  )

  const dirtyIds = useMemo(() => {
    const s = new Set<string>()
    for (const { p } of allPowers) {
      const saved = savedSnapshotRef.current.get(p.id)
      if (!saved) continue
      if (!snapshotsEqual(saved, toSnapshot(p))) s.add(p.id)
    }
    return s
  }, [allPowers])

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

  function setBusyFor(id: string, value: boolean) {
    setBusy((prev) => {
      const next = new Set(prev)
      if (value) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function flashSaved(id: string) {
    setSavedFlash((prev) => new Set(prev).add(id))
    setTimeout(() => {
      setSavedFlash((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 1800)
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
                  : ({ ...x, ...patch } as EffectivePower)
              ),
            }
      )
    )
  }

  /**
   * Guarda los campos de un poder. Si todos coinciden con el catálogo, borra
   * el override entero. Si no, hace upsert con TODOS los campos efectivos
   * (no solo los que difieren del catálogo) — así no perdemos datos si el
   * usuario revierte un campo a su valor original mientras otros siguen
   * modificados.
   */
  async function handleSavePower(p: EffectivePower, heroClass: HeroClass) {
    const orig = getOriginal(p.id, heroClass)
    if (!orig) return

    setError(null)
    setBusyFor(p.id, true)

    const sameMode = orig.mode === p.effectiveMode
    const sameMana = orig.manaCost === p.effectiveManaCost
    const sameName = orig.name === p.effectiveName
    const sameDesc = orig.description === p.effectiveDescription
    const sameLevel = orig.levelRequired === p.effectiveLevelRequired
    const sameIcon = orig.icon === p.effectiveIcon

    const allMatchCatalog =
      sameMode && sameMana && sameName && sameDesc && sameLevel && sameIcon

    let result
    if (allMatchCatalog) {
      // Si nada difiere del catálogo, mejor borrar el override entero
      result = await resetOverride({ classroomId, powerId: p.id })
    } else {
      result = await setOverride({
        classroomId,
        powerId: p.id,
        // Si un campo coincide con el catálogo, mandamos null para que se
        // "limpie" de la fila (caerá al catálogo); el resto se guarda.
        mode: sameMode ? null : p.effectiveMode,
        manaCost: sameMana ? null : p.effectiveManaCost,
        name: sameName ? null : p.effectiveName,
        description: sameDesc ? null : p.effectiveDescription,
        levelRequired: sameLevel ? null : p.effectiveLevelRequired,
        icon: sameIcon ? null : p.effectiveIcon,
      })
    }

    setBusyFor(p.id, false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }

    // Actualizar snapshot: a partir de ahora estos valores son los "guardados"
    savedSnapshotRef.current.set(p.id, toSnapshot(p))
    // Marcar también isOverridden correctamente
    updatePower(heroClass, p.id, { isOverridden: !allMatchCatalog })
    flashSaved(p.id)
  }

  async function handleReset(p: EffectivePower, heroClass: HeroClass) {
    if (!window.confirm('Berrezarri jatorrizko balioetara?')) return
    setBusyFor(p.id, true)
    setError(null)
    const result = await resetOverride({ classroomId, powerId: p.id })
    setBusyFor(p.id, false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    const orig = getOriginal(p.id, heroClass)
    if (!orig) return
    const fresh: Partial<EffectivePower> = {
      effectiveMode: orig.mode,
      effectiveManaCost: orig.manaCost,
      effectiveName: orig.name,
      effectiveDescription: orig.description,
      effectiveLevelRequired: orig.levelRequired,
      effectiveIcon: orig.icon,
      isOverridden: false,
    }
    updatePower(heroClass, p.id, fresh)
    savedSnapshotRef.current.set(p.id, {
      mode: orig.mode,
      manaCost: orig.manaCost,
      name: orig.name,
      description: orig.description,
      levelRequired: orig.levelRequired,
      icon: orig.icon,
    })
    flashSaved(p.id)
  }

  async function handleSaveAll() {
    setError(null)
    for (const { p, heroClass } of allPowers) {
      if (dirtyIds.has(p.id)) {
        await handleSavePower(p, heroClass)
      }
    }
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
              const isDirty = dirtyIds.has(p.id)
              const isBusy = busy.has(p.id)
              const isFlashing = savedFlash.has(p.id)
              return (
                <li
                  key={p.id}
                  className={`botereak-card ${
                    p.isOverridden ? 'botereak-card-overridden' : ''
                  } ${isDirty ? 'botereak-card-dirty' : ''}`}
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
                        {p.isOverridden && !isDirty && (
                          <span className="botereak-card-badge">aldatuta</span>
                        )}
                        {isDirty && (
                          <span className="botereak-card-badge botereak-card-badge-dirty">
                            gorde gabe
                          </span>
                        )}
                        {isFlashing && (
                          <span className="botereak-card-badge botereak-card-badge-saved">
                            ✓ gordeta
                          </span>
                        )}
                      </span>
                      <span className="botereak-card-meta">
                        Mla {p.effectiveLevelRequired} · 🔮{' '}
                        {p.effectiveManaCost} ·{' '}
                        {p.effectiveMode === 'manual' ? 'Baieztatu' : 'Auto'}
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
                            className="botereak-icon-input"
                            maxLength={4}
                          />
                          <div className="botereak-emoji-picker" role="group">
                            {EMOJI_SUGGESTIONS.map((emo) => (
                              <button
                                key={emo}
                                type="button"
                                className={`botereak-emoji-btn ${
                                  p.effectiveIcon === emo
                                    ? 'botereak-emoji-btn-on'
                                    : ''
                                }`}
                                onClick={() =>
                                  updatePower(g.heroClass, p.id, {
                                    effectiveIcon: emo,
                                  })
                                }
                                disabled={isBusy}
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
                          className="botereak-text-input"
                          disabled={isBusy}
                          maxLength={60}
                        />
                      </div>

                      <div className="botereak-field">
                        <label className="botereak-label">Deskribapena</label>
                        {p.effectiveMode === 'auto' ? (
                          <>
                            <textarea
                              value={p.effectiveDescription}
                              className="botereak-textarea botereak-textarea-locked"
                              disabled
                              rows={2}
                              readOnly
                            />
                            <p className="botereak-locked-hint">
                              🔒 Boterea automatikoa denez, deskribapena ezin
                              da aldatu (sistemak berak aplikatzen du
                              eragina). Aldatu nahi baduzu, lehenbizi markatu
                              <strong> Baieztapena</strong> behar duela.
                            </p>
                          </>
                        ) : (
                          <textarea
                            value={p.effectiveDescription}
                            onChange={(e) =>
                              updatePower(g.heroClass, p.id, {
                                effectiveDescription: e.target.value,
                              })
                            }
                            className="botereak-textarea"
                            disabled={isBusy}
                            maxLength={240}
                            rows={2}
                          />
                        )}
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
                            className="botereak-num-input"
                            disabled={isBusy}
                          />
                        </div>

                        <div className="botereak-field">
                          <label className="botereak-label">Mana kostua</label>
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
                            className="botereak-num-input"
                            disabled={isBusy}
                          />
                        </div>

                        <div className="botereak-field">
                          <label className="botereak-label">Baieztapena</label>
                          <label className="botereak-toggle">
                            <input
                              type="checkbox"
                              checked={p.effectiveMode === 'manual'}
                              onChange={(e) =>
                                updatePower(g.heroClass, p.id, {
                                  effectiveMode: e.target.checked
                                    ? 'manual'
                                    : 'auto',
                                })
                              }
                              disabled={isBusy}
                            />
                            <span>
                              {p.effectiveMode === 'manual'
                                ? 'Baieztatu egin behar dut'
                                : 'Automatikoki aplikatu'}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="botereak-actions">
                        {p.isOverridden && (
                          <button
                            type="button"
                            className="botereak-reset-btn"
                            onClick={() => handleReset(p, g.heroClass)}
                            disabled={isBusy}
                          >
                            ↺ Jatorrizkoa berrezarri
                          </button>
                        )}
                        <button
                          type="button"
                          className="botereak-save-btn"
                          onClick={() => handleSavePower(p, g.heroClass)}
                          disabled={isBusy || !isDirty}
                        >
                          {isBusy ? 'Gordetzen…' : 'Gorde aldaketak'}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {/* Barra flotante: aparece si hay cambios pendientes en cualquier card */}
      {dirtyIds.size > 0 && (
        <div className="botereak-floating-bar" role="region">
          <span className="botereak-floating-info">
            <strong>{dirtyIds.size}</strong> botere{dirtyIds.size === 1 ? 'a' : 'k'}{' '}
            gorde gabe
          </span>
          <button
            type="button"
            className="botereak-save-all-btn"
            onClick={handleSaveAll}
            disabled={busy.size > 0}
          >
            Gorde dena
          </button>
        </div>
      )}
    </>
  )
}
