'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { MoonIcon } from '@/components/icons'
import { loginStudent } from './actions'

export default function StudentLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await loginStudent(formData)

    if (result && !result.success) {
      setError(result.error)
      setLoading(false)
    }
    // Si éxito, redirect — nunca llegamos aquí
  }

  return (
    <main className="auth-screen">
      <Link href="/" className="auth-logo" aria-label="GELAKRAFT hasiera">
        <MoonIcon size={28} />
        <span>GELAKRAFT</span>
      </Link>

      <div className="auth-card">
        <div className="auth-eyebrow">Ikaslea naiz</div>
        <h1 className="auth-title">Sartu zure abenturara.</h1>
        <p className="auth-subtitle">
          Idatzi zure irakasleak emandako erabiltzailea eta pasahitza.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            <span className="auth-label">Erabiltzailea</span>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="adib: ane.etxebarria"
              required
              autoComplete="username"
              autoFocus
              autoCapitalize="off"
              spellCheck="false"
              disabled={loading}
              className="auth-input"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Pasahitza</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="adib: Mari-247"
              required
              autoComplete="current-password"
              disabled={loading}
              className="auth-input"
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading || !username.trim() || !password}
          >
            {loading ? 'Sartzen…' : 'Sartu'}
          </button>
        </form>

        <p className="auth-footer">
          Irakaslea zara?{' '}
          <Link href="/saioa-hasi" className="auth-link">
            Hemen sartu
          </Link>
        </p>
      </div>
    </main>
  )
}
