'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MoonIcon, EnvelopeIcon } from '@/components/icons'

type Mode = 'login' | 'signup' | 'forgot'

type AuthFormProps = {
  mode: Mode
  eyebrow: string
  title: string
  subtitle: string
  /** Texto del enlace alternativo (p.ej. "¿No tienes cuenta?") */
  alternativeText: string
  alternativeLabel: string
  alternativeHref: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const MIN_PASSWORD_LENGTH = 8

/**
 * Formulario de autenticación para profesores.
 *
 * Tres modos:
 * - 'login'  → email + contraseña → entra al panel
 * - 'signup' → email + contraseña + confirmar → envía email de confirmación
 * - 'forgot' → email → envía email de recuperación
 */
export default function AuthForm({
  mode,
  eyebrow,
  title,
  subtitle,
  alternativeText,
  alternativeLabel,
  alternativeHref,
}: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setStatus('error')
      // Mensajes en euskara para los errores comunes
      if (
        error.message.toLowerCase().includes('invalid login') ||
        error.message.toLowerCase().includes('invalid credentials')
      ) {
        setErrorMsg('Helbide elektronikoa edo pasahitza okerra dira.')
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        setErrorMsg(
          'Lehenbizi zure helbide elektronikoa baieztatu behar duzu. Begiratu zure posta — esteka bidali genizun izen-ematean.'
        )
      } else {
        setErrorMsg(error.message)
      }
      return
    }

    // Sesión activa. Vamos al panel.
    router.push('/panela')
    router.refresh()
  }

  async function handleSignup(event: FormEvent) {
    event.preventDefault()
    setErrorMsg('')

    // Validación cliente antes de pegar a Supabase
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
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setStatus('error')
      if (error.message.toLowerCase().includes('already registered')) {
        setErrorMsg(
          'Helbide elektroniko hori jada erabilita dago. Saiatu saioa hastearekin edo berreskuratu pasahitza.'
        )
      } else if (error.message.toLowerCase().includes('password')) {
        setErrorMsg('Pasahitzak ez du baldintzak betetzen. Gutxienez 8 karaktere behar ditu.')
      } else {
        setErrorMsg(error.message)
      }
      return
    }

    setStatus('success')
  }

  async function handleForgotPassword(event: FormEvent) {
    event.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const supabase = createClient()
    // Endpoint dedicado: evita la ambigüedad de query params en redirectTo.
    // Supabase no siempre preserva ?next= al hacer el redirect final desde su
    // servidor, pero la ruta base sí. Por eso usamos un endpoint propio
    // (/auth/recovery) que ya sabe a dónde llevar al usuario.
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/recovery`,
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
      return
    }

    setStatus('success')
  }

  // ============================================================
  // ESTADO: SUCCESS (mostrar mensaje según el modo)
  // ============================================================
  if (status === 'success') {
    if (mode === 'signup') {
      return (
        <div className="auth-card">
          <div className="auth-success-icon">
            <EnvelopeIcon size={56} />
          </div>
          <div className="auth-eyebrow">Begiratu zure posta</div>
          <h1 className="auth-title">Baieztapen-esteka bidali dizugu.</h1>
          <p className="auth-subtitle">
            <strong>{email}</strong> helbidera esteka bat bidali dizugu. Sakatu emailean dagoen
            estekan zure kontua baieztatzeko. Behin baieztatuta, zure pasahitzarekin saioa hasi
            ahal izango duzu.
          </p>
          <p className="auth-hint">
            Ez duzu emailik jaso? Begiratu spam karpeta edo{' '}
            <button
              type="button"
              className="auth-link-button"
              onClick={() => {
                setStatus('idle')
                setEmail('')
                setPassword('')
                setPasswordConfirm('')
              }}
            >
              saiatu berriro
            </button>
            .
          </p>
        </div>
      )
    }

    if (mode === 'forgot') {
      return (
        <div className="auth-card">
          <div className="auth-success-icon">
            <EnvelopeIcon size={56} />
          </div>
          <div className="auth-eyebrow">Posta bidali da</div>
          <h1 className="auth-title">Berreskuratze-esteka bidali dizugu.</h1>
          <p className="auth-subtitle">
            <strong>{email}</strong> helbidera esteka bat bidali dizugu. Sakatu emailean eta
            pasahitz berri bat sortu ahal izango duzu.
          </p>
          <p className="auth-footer">
            <Link href="/saioa-hasi" className="auth-link">
              ← Saioa hastera itzuli
            </Link>
          </p>
        </div>
      )
    }
  }

  // ============================================================
  // ESTADO: FORM
  // ============================================================
  const isLogin = mode === 'login'
  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'

  const handleSubmit = isLogin
    ? handleLogin
    : isSignup
      ? handleSignup
      : handleForgotPassword

  const submitLabel = isLogin
    ? 'Saioa hasi'
    : isSignup
      ? 'Kontua sortu'
      : 'Berreskuratze-esteka bidali'

  const loadingLabel = isLogin
    ? 'Sartzen…'
    : isSignup
      ? 'Sortzen…'
      : 'Bidaltzen…'

  return (
    <div className="auth-card">
      <div className="auth-eyebrow">{eyebrow}</div>
      <h1 className="auth-title">{title}</h1>
      <p className="auth-subtitle">{subtitle}</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-field">
          <span className="auth-label">Helbide elektronikoa</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="zu@adibidez.eus"
            required
            autoComplete="email"
            autoFocus
            disabled={status === 'loading'}
            className="auth-input"
          />
        </label>

        {!isForgot && (
          <label className="auth-field">
            <span className="auth-label">
              Pasahitza
              {isSignup && (
                <span className="auth-label-hint">gutxienez {MIN_PASSWORD_LENGTH} karaktere</span>
              )}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              disabled={status === 'loading'}
              className="auth-input"
            />
          </label>
        )}

        {isSignup && (
          <label className="auth-field">
            <span className="auth-label">Berretsi pasahitza</span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              disabled={status === 'loading'}
              className="auth-input"
            />
          </label>
        )}

        {status === 'error' && errorMsg && (
          <p className="auth-error" role="alert">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary auth-submit"
          disabled={status === 'loading' || !email.trim()}
        >
          {status === 'loading' ? loadingLabel : submitLabel}
        </button>
      </form>

      {isLogin && (
        <p className="auth-forgot">
          <Link href="/pasahitza-berreskuratu" className="auth-link">
            Pasahitza ahaztu duzu?
          </Link>
        </p>
      )}

      <p className="auth-footer">
        {alternativeText}{' '}
        <Link href={alternativeHref} className="auth-link">
          {alternativeLabel}
        </Link>
      </p>
    </div>
  )
}

/**
 * Cabecera con el logo, usada en las páginas de auth.
 */
export function AuthHeader() {
  return (
    <Link href="/" className="auth-logo" aria-label="GELAKRAFT hasiera">
      <MoonIcon size={28} />
      <span>GELAKRAFT</span>
    </Link>
  )
}
