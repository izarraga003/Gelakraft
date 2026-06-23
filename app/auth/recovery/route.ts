import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Endpoint dedicado al flujo de RESET DE CONTRASEÑA.
 *
 * El exchange PKCE necesita el `code_verifier` que se guardó en cookies
 * cuando el usuario pulsó "He olvidado mi contraseña". Por eso este endpoint
 * es server-side (route handler), donde @supabase/ssr lee las cookies HTTP
 * directamente. Hacerlo en cliente fallaba con "PKCE code verifier not found
 * in storage" en muchos casos (caché borrada, otra pestaña, etc.).
 *
 * Soporta:
 *   - ?code=xxx               → PKCE flow (lo más común)
 *   - ?token_hash=xxx&type=…  → token-hash flow
 *
 * Si el enlace llega con fragment hash (#access_token=…), el navegador no lo
 * envía al servidor; ese caso lo gestiona `AuthHashHandler` en cliente.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const errorRedirect = (msg: string) =>
    NextResponse.redirect(
      `${origin}/saioa-hasi?error=${encodeURIComponent(msg)}`
    )

  // PKCE flow
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/auth/pasahitza-aldatu`)
    }
    return errorRedirect(error.message)
  }

  // Token-hash flow
  if (tokenHash && (type === 'recovery' || type === 'email')) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    })
    if (!error) {
      return NextResponse.redirect(`${origin}/auth/pasahitza-aldatu`)
    }
    return errorRedirect(error.message)
  }

  return errorRedirect('esteka-iraungita')
}
