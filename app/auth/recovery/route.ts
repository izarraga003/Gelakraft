import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Endpoint dedicado para el flujo de RESET DE CONTRASEÑA.
 *
 * A diferencia de /auth/callback (genérico para signup), este endpoint:
 *  1. Intercambia el código que viene del email por una sesión "recovery".
 *  2. Redirige SIEMPRE a /auth/pasahitza-aldatu, donde el usuario establece
 *     su nueva contraseña.
 *
 * Tener una URL distinta evita la ambigüedad de query params:
 * Supabase no siempre preserva ?next= en el redirect tras verificar el token,
 * pero la ruta base sí se respeta. Por eso usamos una ruta dedicada.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}/auth/pasahitza-aldatu`)
    }
  }

  // Si falla (código caducado/inválido), volver al inicio del flujo
  return NextResponse.redirect(
    `${origin}/pasahitza-berreskuratu?error=esteka-iraungita`
  )
}
