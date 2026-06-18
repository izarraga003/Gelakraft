'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createEvent,
  updateEvent,
  deleteEvent,
  loadDefaultEvents,
  deleteAllEvents,
} from '@/lib/events/actions'

type EventItem = {
  id: string
  title: string
  description: string
}

type Props = {
  classroomId: string
  classroomName: string
  initialEvents: EventItem[]
}

export default function UstekabekoaSetup({
  classroomId,
  classroomName,
  initialEvents,
}: Props) {
  const router = useRouter()
  const [events, setEvents] = useState<EventItem[]>(initialEvents)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDesc, setDraftDesc] = useState('')

  // Para añadir nuevo
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [, startTransition] = useTransition()

  async function handleCreate() {
    setError(null)
    setBusy(true)
    const result = await createEvent(newTitle, newDesc)
    setBusy(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    setEvents((prev) => [
      ...prev,
      { id: result.event.id, title: result.event.title, description: result.event.description },
    ])
    setNewTitle('')
    setNewDesc('')
    setCreating(false)
  }

  function startEditing(ev: EventItem) {
    setEditingId(ev.id)
    setDraftTitle(ev.title)
    setDraftDesc(ev.description)
    setError(null)
  }

  function cancelEditing() {
    setEditingId(null)
    setDraftTitle('')
    setDraftDesc('')
    setError(null)
  }

  async function saveEdit() {
    if (!editingId) return
    setError(null)
    setBusy(true)
    const result = await updateEvent(editingId, draftTitle, draftDesc)
    setBusy(false)

    if (!result.success) {
      setError(result.error ?? 'Errorea')
      return
    }
    setEvents((prev) =>
      prev.map((e) =>
        e.id === editingId
          ? { ...e, title: draftTitle.trim(), description: draftDesc.trim() }
          : e
      )
    )
    cancelEditing()
  }

  function handleDelete(id: string, title: string) {
    const confirmed = window.confirm(
      `Ziur "${title}" ezabatu nahi duzula?\n\nEkintza hau ezin da desegin.`
    )
    if (!confirmed) return

    startTransition(async () => {
      const result = await deleteEvent(id)
      if (result.success) {
        setEvents((prev) => prev.filter((e) => e.id !== id))
      } else {
        alert(`Errorea: ${result.error}`)
      }
    })
  }

  async function handleLoadDefaults() {
    const confirmed = window.confirm(
      'Lehenetsitako 15 gertaerak zure zerrendara gehituko dira.\n\nJarraitu?'
    )
    if (!confirmed) return

    setBusy(true)
    const result = await loadDefaultEvents()
    setBusy(false)

    if (!result.success) {
      alert(`Errorea: ${result.error}`)
      return
    }
    // Refrescamos pidiendo de nuevo al server (más sencillo que duplicar lógica)
    router.refresh()
  }

  async function handleDeleteAll() {
    const confirmed = window.confirm(
      `Zure gertaera GUZTIAK ezabatu nahi dituzu?\n\nHau ezin da desegin.`
    )
    if (!confirmed) return
    const reconfirmed = window.confirm(
      'Ziur zaude? Berriro galdetzen dizut.'
    )
    if (!reconfirmed) return

    setBusy(true)
    const result = await deleteAllEvents()
    setBusy(false)

    if (!result.success) {
      alert(`Errorea: ${result.error}`)
      return
    }
    setEvents([])
  }

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <Link
          href={`/panela/ikasgela/${classroomId}/ustekabekoa`}
          className="panel-breadcrumb"
        >
          ← Itzuli ustekabekoa
        </Link>
        <div className="panel-eyebrow">Konfigurazioa</div>
        <h1 className="panel-title">Ustekabeko gertaeren katalogoa.</h1>
        <p className="panel-subtitle">
          Hauek dira zure gertaerak. Aurkitu botoia sakatzean, sistemak hauen
          artean ausaz aukeratzen du bat. {classroomName} eta gainerako ikasgela
          guztietan partekatzen da zerrenda hau.
        </p>
      </section>

      <section className="panel-section">
        <div className="panel-section-header">
          <h2 className="panel-section-title">
            Gertaerak ({events.length})
          </h2>
          <div className="ustekabekoa-config-actions">
            {events.length === 0 && (
              <button
                type="button"
                className="panel-btn-secondary"
                onClick={handleLoadDefaults}
                disabled={busy}
              >
                ↓ Kargatu lehenetsitakoak
              </button>
            )}
            <button
              type="button"
              className="panel-cta-btn"
              onClick={() => setCreating(true)}
              disabled={busy || creating}
            >
              + Gertaera berria
            </button>
          </div>
        </div>

        {/* Crear nuevo */}
        {creating && (
          <div className="event-edit-card">
            <label className="panel-field">
              <span className="panel-label">Izenburua</span>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="panel-input"
                placeholder="Adib: Anbotoko lainoa"
                maxLength={60}
                autoFocus
              />
            </label>
            <label className="panel-field">
              <span className="panel-label">Deskribapena</span>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="panel-textarea"
                placeholder="Zer gertatzen den, nork parte hartzen duen, zer irabazi edo galtzen den…"
                rows={4}
                maxLength={800}
              />
              <span className="panel-field-hint">
                {newDesc.length} / 800 karaktere
              </span>
            </label>
            {error && (
              <p className="panel-form-error" role="alert">
                {error}
              </p>
            )}
            <div className="panel-form-actions">
              <button
                type="button"
                className="panel-btn-secondary"
                onClick={() => {
                  setCreating(false)
                  setNewTitle('')
                  setNewDesc('')
                  setError(null)
                }}
                disabled={busy}
              >
                Utzi
              </button>
              <button
                type="button"
                className="panel-cta-btn"
                onClick={handleCreate}
                disabled={busy || !newTitle.trim() || !newDesc.trim()}
              >
                {busy ? 'Sortzen…' : 'Sortu'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de eventos */}
        {events.length === 0 && !creating ? (
          <div className="panel-empty-state">
            <p>Ez duzu gertaerarik oraindik.</p>
            <p className="panel-empty-hint">
              Kargatu lehenetsitako 15 gertaerak hasteko, edo sortu zeureak.
            </p>
          </div>
        ) : (
          <div className="event-list">
            {events.map((ev) => {
              const isEditing = editingId === ev.id
              return (
                <article key={ev.id} className="event-card">
                  {isEditing ? (
                    <>
                      <label className="panel-field">
                        <span className="panel-label">Izenburua</span>
                        <input
                          type="text"
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          className="panel-input"
                          maxLength={60}
                          autoFocus
                        />
                      </label>
                      <label className="panel-field">
                        <span className="panel-label">Deskribapena</span>
                        <textarea
                          value={draftDesc}
                          onChange={(e) => setDraftDesc(e.target.value)}
                          className="panel-textarea"
                          rows={4}
                          maxLength={800}
                        />
                      </label>
                      {error && (
                        <p className="panel-form-error" role="alert">
                          {error}
                        </p>
                      )}
                      <div className="panel-form-actions">
                        <button
                          type="button"
                          className="panel-btn-secondary"
                          onClick={cancelEditing}
                          disabled={busy}
                        >
                          Utzi
                        </button>
                        <button
                          type="button"
                          className="panel-cta-btn"
                          onClick={saveEdit}
                          disabled={busy || !draftTitle.trim() || !draftDesc.trim()}
                        >
                          {busy ? 'Gordetzen…' : 'Gorde'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <header className="event-card-header">
                        <h3 className="event-card-title">{ev.title}</h3>
                        <div className="event-card-actions">
                          <button
                            type="button"
                            className="student-action-btn"
                            onClick={() => startEditing(ev)}
                            disabled={busy}
                          >
                            Editatu
                          </button>
                          <button
                            type="button"
                            className="student-action-btn student-action-danger"
                            onClick={() => handleDelete(ev.id, ev.title)}
                            disabled={busy}
                          >
                            Ezabatu
                          </button>
                        </div>
                      </header>
                      <p className="event-card-desc">{ev.description}</p>
                    </>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {events.length > 0 && (
          <div className="ustekabekoa-bulk-actions">
            <button
              type="button"
              className="panel-btn-secondary"
              onClick={handleLoadDefaults}
              disabled={busy}
            >
              ↓ Kargatu lehenetsitakoak (15 gehiago)
            </button>
            <button
              type="button"
              className="ustekabekoa-danger-btn"
              onClick={handleDeleteAll}
              disabled={busy}
            >
              Guztiak ezabatu
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
