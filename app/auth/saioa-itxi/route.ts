import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Cierra la sesión actual y redirige a la home.
 * Se accede via POST desde un formulario en el panel.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/`, { status: 303 })
}
