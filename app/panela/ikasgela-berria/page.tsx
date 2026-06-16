'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { createClassroom } from './actions'

export default function NewClassroomPage() {
  const [name, setName] = useState('')
  const [stage, setStage] = useState('dbh')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await createClassroom(formData)

    // Si llega aquí es que hubo error (si éxito, redirect)
    if (result && !result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <Link href="/panela" className="panel-breadcrumb">
          ← Panela
        </Link>
        <div className="panel-eyebrow">Ikasgela berria</div>
        <h1 className="panel-title">Ikasgela bat sortu.</h1>
        <p className="panel-subtitle">
          Eman ikasgelari izena eta aukeratu maila. Ondoren ikasleak gehituko dituzu.
        </p>
      </section>

      <section className="panel-form-section">
        <form onSubmit={handleSubmit} className="panel-form">
          <label className="panel-field">
            <span className="panel-label">Ikasgelaren izena</span>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adib: DBH 3.A · Matematika"
              required
              minLength={2}
              maxLength={80}
              autoFocus
              className="panel-input"
            />
            <span className="panel-field-hint">
              Idatzi mailan eta gairean oinarritutako izena. Geroago alda dezakezu.
            </span>
          </label>

          <label className="panel-field">
            <span className="panel-label">Maila</span>
            <select
              name="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="panel-input"
            >
              <option value="lehen">Lehen Hezkuntza</option>
              <option value="dbh">DBH</option>
              <option value="batxilergoa">Batxilergoa</option>
              <option value="lh">Lanbide Heziketa</option>
              <option value="unibertsitatea">Unibertsitatea</option>
              <option value="beste">Beste bat</option>
            </select>
          </label>

          {error && (
            <p className="panel-form-error" role="alert">
              {error}
            </p>
          )}

          <div className="panel-form-actions">
            <Link href="/panela" className="panel-btn-secondary">
              Utzi
            </Link>
            <button
              type="submit"
              className="panel-cta-btn"
              disabled={loading || name.trim().length < 2}
            >
              {loading ? 'Sortzen…' : 'Ikasgela sortu'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
