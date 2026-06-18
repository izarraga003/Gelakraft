'use client'

import { useState } from 'react'
import {
  createBehavior,
  updateBehavior,
  deleteBehavior,
  type Behavior,
} from '@/lib/behaviors/actions'

type Props = {
  classroomId: string
  initial: Behavior[]
}

export default function BehaviorsEditor({ classroomId, initial }: Props) {
  const [behaviors, setBehaviors] = useState<Behavior[]>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado para crear nueva
  const [newPositive, setNewPositive] = useState({ description: '', xp: 20, hearts: 0 })
  const [newNegative, setNewNegative] = useState({ description: '', xp: 0, hearts: -2 })

  const positives = behaviors.filter((b) => b.behavior_type === 'positive')
  const negatives = behaviors.filter((b) => b.behavior_type === 'negative')

  async function handleCreate(type: 'positive' | 'negative') {
    setError(null)
    const input = type === 'positive' ? newPositive : newNegative
    if (!input.description.trim()) {
      setError('Deskribapena ezin da hutsik egon.')
      return
    }
    setBusy(true)
    const result = await createBehavior({
      classroomId,
      behaviorType: type,
      description: input.description,
      xpDelta: input.xp,
      heartsDelta: input.hearts,
    })
    setBusy(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setBehaviors((prev) => [...prev, result.behavior])
    if (type === 'positive') setNewPositive({ description: '', xp: 20, hearts: 0 })
    else setNewNegative({ description: '', xp: 0, hearts: -2 })
  }

  async function handleSave(b: Behavior) {
    setError(null)
    setBusy(true)
    const result = await updateBehavior({
      id: b.id,
      classroomId,
      description: b.description,
      xpDelta: b.xp_delta,
      heartsDelta: b.hearts_delta,
    })
    setBusy(false)
    if (!result.success) setError(result.error ?? 'Errorea.')
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Ziur jokabide hau ezabatu nahi duzula?')) return
    setBusy(true)
    const result = await deleteBehavior(id, classroomId)
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    setBehaviors((prev) => prev.filter((b) => b.id !== id))
  }

  function updateRow(id: string, patch: Partial<Behavior>) {
    setBehaviors((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  return (
    <>
      {error && (
        <div className="behaviors-error" role="alert">
          {error}
        </div>
      )}

      <div className="behaviors-columns">
        {/* POSITIVAS */}
        <section className="behaviors-column behaviors-column-positive">
          <header className="behaviors-column-header">
            <h2 className="behaviors-column-title">
              <span aria-hidden="true">👍</span> Sariak (positiboak)
            </h2>
            <p className="behaviors-column-hint">
              Ikasleak puntuak edo bihotzak irabazteko jokabideak.
            </p>
          </header>

          <div className="behaviors-list">
            {positives.length === 0 && (
              <p className="behaviors-empty">Oraindik ez dago sari positiborik.</p>
            )}
            {positives.map((b) => (
              <BehaviorRow
                key={b.id}
                behavior={b}
                busy={busy}
                onChange={(patch) => updateRow(b.id, patch)}
                onSave={() => handleSave(b)}
                onDelete={() => handleDelete(b.id)}
              />
            ))}
          </div>

          <div className="behaviors-create">
            <input
              type="text"
              value={newPositive.description}
              onChange={(e) =>
                setNewPositive((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Sari berri bat gehitu…"
              className="behavior-input behavior-input-desc"
              disabled={busy}
            />
            <div className="behavior-input-deltas">
              <DeltaInput
                value={newPositive.xp}
                onChange={(v) => setNewPositive((p) => ({ ...p, xp: v }))}
                icon="⚡"
                disabled={busy}
              />
              <DeltaInput
                value={newPositive.hearts}
                onChange={(v) => setNewPositive((p) => ({ ...p, hearts: v }))}
                icon="❤️"
                disabled={busy}
              />
            </div>
            <button
              type="button"
              className="behavior-add-btn"
              onClick={() => handleCreate('positive')}
              disabled={busy || !newPositive.description.trim()}
            >
              + Gehitu
            </button>
          </div>
        </section>

        {/* NEGATIVAS */}
        <section className="behaviors-column behaviors-column-negative">
          <header className="behaviors-column-header">
            <h2 className="behaviors-column-title">
              <span aria-hidden="true">⚠️</span> Abisuak (negatiboak)
            </h2>
            <p className="behaviors-column-hint">
              Ikasleek bihotzak galtzeko jokabideak.
            </p>
          </header>

          <div className="behaviors-list">
            {negatives.length === 0 && (
              <p className="behaviors-empty">Oraindik ez dago abisurik.</p>
            )}
            {negatives.map((b) => (
              <BehaviorRow
                key={b.id}
                behavior={b}
                busy={busy}
                onChange={(patch) => updateRow(b.id, patch)}
                onSave={() => handleSave(b)}
                onDelete={() => handleDelete(b.id)}
              />
            ))}
          </div>

          <div className="behaviors-create">
            <input
              type="text"
              value={newNegative.description}
              onChange={(e) =>
                setNewNegative((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Abisu berri bat gehitu…"
              className="behavior-input behavior-input-desc"
              disabled={busy}
            />
            <div className="behavior-input-deltas">
              <DeltaInput
                value={newNegative.xp}
                onChange={(v) => setNewNegative((p) => ({ ...p, xp: v }))}
                icon="⚡"
                disabled={busy}
              />
              <DeltaInput
                value={newNegative.hearts}
                onChange={(v) => setNewNegative((p) => ({ ...p, hearts: v }))}
                icon="❤️"
                disabled={busy}
              />
            </div>
            <button
              type="button"
              className="behavior-add-btn"
              onClick={() => handleCreate('negative')}
              disabled={busy || !newNegative.description.trim()}
            >
              + Gehitu
            </button>
          </div>
        </section>
      </div>
    </>
  )
}

function BehaviorRow({
  behavior,
  busy,
  onChange,
  onSave,
  onDelete,
}: {
  behavior: Behavior
  busy: boolean
  onChange: (patch: Partial<Behavior>) => void
  onSave: () => void
  onDelete: () => void
}) {
  return (
    <div className="behavior-row">
      <input
        type="text"
        value={behavior.description}
        onChange={(e) => onChange({ description: e.target.value })}
        onBlur={onSave}
        className="behavior-input behavior-input-desc"
        disabled={busy}
        aria-label="Deskribapena"
      />
      <div className="behavior-input-deltas">
        <DeltaInput
          value={behavior.xp_delta}
          onChange={(v) => onChange({ xp_delta: v })}
          onBlur={onSave}
          icon="⚡"
          disabled={busy}
        />
        <DeltaInput
          value={behavior.hearts_delta}
          onChange={(v) => onChange({ hearts_delta: v })}
          onBlur={onSave}
          icon="❤️"
          disabled={busy}
        />
      </div>
      <button
        type="button"
        className="behavior-delete-btn"
        onClick={onDelete}
        disabled={busy}
        aria-label="Ezabatu"
        title="Ezabatu"
      >
        🗑
      </button>
    </div>
  )
}

function DeltaInput({
  value,
  onChange,
  onBlur,
  icon,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  onBlur?: () => void
  icon: string
  disabled?: boolean
}) {
  return (
    <label className="behavior-delta">
      <span className="behavior-delta-icon" aria-hidden="true">
        {icon}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          onChange(isNaN(n) ? 0 : n)
        }}
        onBlur={onBlur}
        disabled={disabled}
        className="behavior-delta-input"
      />
    </label>
  )
}
