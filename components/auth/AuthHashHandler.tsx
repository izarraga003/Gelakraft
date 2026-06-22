'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Componente global montado en el layout raíz.
 *
 * Si por algún motivo (configuración de Site URL / Redirect URLs en
 * Supabase Dashboard), el link del email de recovery aterriza en una ruta
 * distinta a /auth/recovery, detectamos el fragment hash con tokens y
 * redirigimos al endpoint correcto preservando el hash.
 *
 * Esto cubre el caso "muestro la página principal y no pasa nada" cuando
 * Supabase respeta solo la Site URL base.
 */
export default function AuthHashHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Si ya estamos en /auth/recovery, deja que esa página lo procese
    if (pathname?.startsWith('/auth/recovery')) return
    if (pathname?.startsWith('/auth/pasahitza-aldatu')) return

    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) return

    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
    const type = params.get('type')

    if (type === 'recovery') {
      // Reenviar a /auth/recovery preservando el hash
      window.location.replace(`/auth/recovery${hash}`)
    }
  }, [pathname, router])

  return null
}
