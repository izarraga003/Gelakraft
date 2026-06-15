import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Endpoint al que apunta el enlace mágico del email.
 * Recibe `?code=...` y lo intercambia por una sesión activa (cookies).
 * Después redirige al panel (o a la ruta `next` si se pasó).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/panela'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Sesión establecida. Vamos al destino.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Algo falló: enlace caducado, código inválido, etc.
  return NextResponse.redirect(
    `${origin}/saioa-hasi?error=esteka-ezin-baliotu`
  )
}
