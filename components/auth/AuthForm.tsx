'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MoonIcon, EnvelopeIcon } from '@/components/icons'

type AuthFormProps = {
  /** Texto pequeño en mayúsculas arriba del título */
  eyebrow: string
  /** Título grande en Fraunces */
  title: string
  /** Texto explicativo bajo el título */
  subtitle: string
  /** Texto en el link de la página alternativa (ej: "¿No tienes cuenta?") */
  alternativeText: string
  /** Etiqueta del link (ej: "Crea una") */
  alternativeLabel: string
  /** Ruta del link */
  alternativeHref: string
}

type Status = 'idle' | 'loading' | 'sent' | 'error'

/**
 * Formulario reutilizable para login y registro.
 * Ambos flujos usan el mismo método: magic link enviado por email.
 * Si el usuario no existe, Supabase lo crea automáticamente.
 */
export default function AuthForm({
  eyebrow,
  title,
  subtitle,
  alternativeText,
  alternativeLabel,
  alternativeHref,
}: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    return (
      <div className="auth-card">
        <div className="auth-success-icon">
          <EnvelopeIcon size={56} />
        </div>
        <div className="auth-eyebrow">Begiratu zure posta</div>
        <h1 className="auth-title">Esteka bidali dizugu.</h1>
        <p className="auth-subtitle">
          <strong>{email}</strong> helbidera bidali dizugu esteka bat. Sakatu emailean dagoen
          estekan saioa hasteko.
        </p>
        <p className="auth-hint">
          Ez duzu emailik jaso? Begiratu spam karpeta edo{' '}
          <button
            type="button"
            className="auth-link-button"
            onClick={() => {
              setStatus('idle')
              setErrorMsg('')
            }}
          >
            saiatu berriro
          </button>
          .
        </p>
      </div>
    )
  }

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

        {status === 'error' && (
          <p className="auth-error" role="alert">
            Errore bat gertatu da: {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary auth-submit"
          disabled={status === 'loading' || !email.trim()}
        >
          {status === 'loading' ? 'Bidaltzen…' : 'Bidali esteka'}
        </button>
      </form>

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
