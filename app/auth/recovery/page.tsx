'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/**
 * Endpoint dedicado al flujo de RESET DE CONTRASEÑA.
 *
 * Supabase envía emails de recovery de varias formas según versión y
 * configuración:
 *   - PKCE flow:        ?code=xxx           (procesable server-side)
 *   - Token-hash flow:  ?token_hash=xxx&type=recovery
 *   - Implicit flow:    #access_token=xxx&refresh_token=yyy&type=recovery
 *                       (hash, NO llega al servidor)
 *
 * Esta página cliente cubre los tres casos y redirige a /auth/pasahitza-aldatu.
 */
export default function RecoveryPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'error'>('processing')
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    async function process() {
      const supabase = createClient()
      const url = new URL(window.location.href)

      // CASO 1: ?code= en query string (PKCE flow)
      const code = url.searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.replace('/auth/pasahitza-aldatu')
          return
        }
        setErrorMsg(error.message)
        setStatus('error')
        return
      }

      // CASO 2: ?token_hash= en query string
      const tokenHash = url.searchParams.get('token_hash')
      const type = url.searchParams.get('type')
      if (tokenHash && (type === 'recovery' || type === 'email')) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        })
        if (!error) {
          router.replace('/auth/pasahitza-aldatu')
          return
        }
        setErrorMsg(error.message)
        setStatus('error')
        return
      }

      // CASO 3: fragment hash con access_token + refresh_token (implicit flow)
      // El fragment empieza por "#" y contiene pares key=value separados por &
      const fragment = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : ''
      if (fragment) {
        const params = new URLSearchParams(fragment)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const hashType = params.get('type')
        const hashError = params.get('error') || params.get('error_description')

        if (hashError) {
          setErrorMsg(hashError.replace(/\+/g, ' '))
          setStatus('error')
          return
        }

        if (accessToken && refreshToken && hashType === 'recovery') {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (!error) {
            // Limpiar el hash para que no se quede en la URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            )
            router.replace('/auth/pasahitza-aldatu')
            return
          }
          setErrorMsg(error.message)
          setStatus('error')
          return
        }
      }

      // No reconocido
      setErrorMsg('Esteka iraungita edo baliogabea.')
      setStatus('error')
    }

    void process()
  }, [router])

  return (
    <div className="auth-page">
      <div className="auth-card">
        {status === 'processing' ? (
          <>
            <h1 className="auth-title">Berreskuratzen…</h1>
            <p className="auth-sub">
              Pasahitza aldatzeko prest jartzen ari gara. Itxaron pixka bat.
            </p>
            <div className="auth-spinner" aria-hidden="true" />
          </>
        ) : (
          <>
            <h1 className="auth-title">Esteka ez du balio</h1>
            <p className="auth-sub">
              Esteka iraungi egin da edo ezin izan da egiaztatu. Bidali
              berriz pasahitza berreskuratzeko mezua.
            </p>
            {errorMsg && (
              <p className="auth-error" role="alert">
                {errorMsg}
              </p>
            )}
            <div className="auth-actions">
              <Link href="/saioa-hasi" className="panel-cta-btn">
                Saioa hasi
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
