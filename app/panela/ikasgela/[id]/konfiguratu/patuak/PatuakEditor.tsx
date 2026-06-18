'use client'

import { useState } from 'react'
import {
  createConsequence,
  updateConsequence,
  deleteConsequence,
  type DeathConsequence,
} from '@/lib/patuak/actions'

type Props = {
  classroomId: string
  initial: DeathConsequence[]
}

export default function PatuakEditor({ classroomId, initial }: Props) {
  const [items, setItems] = useState<DeathConsequence[]>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newDesc, setNewDesc] = useState('')

  async function handleCreate() {
    setError(null)
    if (!newDesc.trim()) return
    setBusy(true)
    const result = await createConsequence({
      classroomId,
      description: newDesc.trim(),
    })
    setBusy(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setItems((prev) => [...prev, result.item])
    setNewDesc('')
  }

  async function handleUpdate(it: DeathConsequence) {
    setBusy(true)
    setError(null)
    const result = await updateConsequence({
      id: it.id,
      classroomId,
      description: it.description,
    })
    setBusy(false)
    if (!result.success) setError(result.error ?? 'Errorea.')
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Ziur patua hau ezabatu nahi duzula?')) return
    setBusy(true)
    const result = await deleteConsequence(id, classroomId)
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    setItems((prev) => prev.filter((x) => x.id !== id))
  }

  function updateRow(id: string, patch: Partial<DeathConsequence>) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }

  return (
    <>
      {error && (
        <div className="behaviors-error" role="alert">
          {error}
        </div>
      )}

      <ul className="patuak-list">
        {items.length === 0 && (
          <li className="patuak-empty">Oraindik ez dago patuik konfiguratuta.</li>
        )}
        {items.map((it) => (
          <li key={it.id} className="patuak-row">
            <span className="patuak-icon" aria-hidden="true">🎲</span>
            <input
              type="text"
              value={it.description}
              onChange={(e) => updateRow(it.id, { description: e.target.value })}
              onBlur={() => handleUpdate(it)}
              className="patuak-input"
              disabled={busy}
              aria-label="Patuaren deskribapena"
            />
            <button
              type="button"
              className="patuak-delete"
              onClick={() => handleDelete(it.id)}
              disabled={busy}
              title="Ezabatu"
              aria-label="Ezabatu"
            >
              🗑
            </button>
          </li>
        ))}
      </ul>

      <div className="patuak-create">
        <input
          type="text"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Patua berri bat gehitu…"
          className="patuak-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate()
          }}
          disabled={busy}
        />
        <button
          type="button"
          className="panel-cta-btn"
          onClick={handleCreate}
          disabled={busy || !newDesc.trim()}
        >
          + Gehitu
        </button>
      </div>
    </>
  )
}
