'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthHeader } from '@/components/auth/AuthForm'

const MIN_PASSWORD_LENGTH = 8

/**
 * Página a la que aterriza el usuario desde el email de recuperación.
 * Aquí establece una pasahitz berria.
 *
 * El callback en /auth/callback ya estableció la sesión temporal de recovery,
 * así que aquí solo llamamos a `updateUser({ password })`.
 */
export default function ChangePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  // Verificar que el usuario tiene una sesión de recovery activa
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        setStatus('error')
        setErrorMsg(
          'Berreskuratze-saioa ez da aurkitu edo iraungita dago. Eskatu esteka berri bat.'
        )
      } else {
        setSessionReady(true)
      }
    })
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrorMsg('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setStatus('error')
      setErrorMsg(`Pasahitzak gutxienez ${MIN_PASSWORD_LENGTH} karaktere izan behar ditu.`)
      return
    }
    if (password !== passwordConfirm) {
      setStatus('error')
      setErrorMsg('Bi pasahitzak ez datoz bat.')
      return
    }

    setStatus('loading')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
      return
    }

    setStatus('success')
    // Pequeño delay para mostrar el éxito antes de redirigir
    setTimeout(() => {
      router.push('/panela')
      router.refresh()
    }, 1800)
  }

  if (status === 'success') {
    return (
      <main className="auth-screen">
        <AuthHeader />
        <div className="auth-card">
          <div className="auth-eyebrow">Egina</div>
          <h1 className="auth-title">Pasahitza aldatu da.</h1>
          <p className="auth-subtitle">
            Zure pasahitz berria sortu da. Panelara eramango zaitugu segituan…
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-screen">
      <AuthHeader />
      <div className="auth-card">
        <div className="auth-eyebrow">Pasahitz berria</div>
        <h1 className="auth-title">Aukeratu pasahitz berri bat.</h1>
        <p className="auth-subtitle">
          Aurrerantzean pasahitz berri honekin sartuko zara GELAKRAFTen.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            <span className="auth-label">
              Pasahitz berria
              <span className="auth-label-hint">gutxienez {MIN_PASSWORD_LENGTH} karaktere</span>
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              autoFocus
              disabled={status === 'loading' || !sessionReady}
              className="auth-input"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Berretsi pasahitz berria</span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              disabled={status === 'loading' || !sessionReady}
              className="auth-input"
            />
          </label>

          {status === 'error' && errorMsg && (
            <p className="auth-error" role="alert">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={status === 'loading' || !sessionReady || !password}
          >
            {status === 'loading' ? 'Aldatzen…' : 'Pasahitza aldatu'}
          </button>
        </form>
      </div>
    </main>
  )
}
