'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Componente global montado en el layout raíz.
 *
 * Si por configuración de Supabase (Site URL / Redirect URLs) el enlace de
 * recovery aterriza en una ruta distinta a /auth/recovery, reenviamos al
 * endpoint correcto preservando los parámetros.
 *
 * Detecta dos formatos:
 *   1. Fragment hash: #access_token=xxx&type=recovery (implicit flow legacy)
 *   2. Query string: ?code=xxx (PKCE flow — el caso real que estaba fallando
 *      porque Supabase, al ignorar el redirectTo, manda a la Site URL
 *      pelada con ?code=)
 */
export default function AuthHashHandler() {
  const pathname = usePathname()

  useEffect(() => {
    // Si ya estamos en rutas que saben qué hacer con esto, salir
    if (pathname?.startsWith('/auth/')) return

    // CASO 1: Fragment hash con access_token + type=recovery
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(
        hash.startsWith('#') ? hash.slice(1) : hash
      )
      if (params.get('type') === 'recovery') {
        window.location.replace(`/auth/recovery${hash}`)
        return
      }
    }

    // CASO 2: Query string ?code= (PKCE flow). Cuando llega a / con ?code=,
    // casi siempre es porque Supabase no respetó el redirectTo y mandó a la
    // Site URL pelada tras verificar un email de recovery o de signup.
    const search = window.location.search
    if (search && search.includes('code=')) {
      const params = new URLSearchParams(search)
      const code = params.get('code')
      if (code) {
        // Conservar también `type` si viniera (raro, pero por si acaso)
        const type = params.get('type')
        const qs = type
          ? `?code=${encodeURIComponent(code)}&type=${encodeURIComponent(type)}`
          : `?code=${encodeURIComponent(code)}`
        window.location.replace(`/auth/recovery${qs}`)
      }
    }
  }, [pathname])

  return null
}
