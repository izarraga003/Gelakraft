import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Endpoint al que apuntan los enlaces que Supabase envía por email.
 *
 * Maneja dos flujos:
 *  - Confirmación de email tras signup → redirige a /panela
 *  - Recuperación de contraseña       → redirige a /auth/pasahitza-aldatu
 *
 * Supabase añade `?next=` o `?type=` al enlace según el caso.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'recovery', 'signup', etc.
  const next = searchParams.get('next')

  // Determinar destino según el tipo de enlace
  let destination = '/panela'
  if (type === 'recovery') {
    destination = '/auth/pasahitza-aldatu'
  } else if (next) {
    destination = next
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  // Algo falló: enlace caducado, código inválido, etc.
  return NextResponse.redirect(
    `${origin}/saioa-hasi?error=esteka-ezin-baliotu`
  )
}
