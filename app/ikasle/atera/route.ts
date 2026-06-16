import { NextResponse, type NextRequest } from 'next/server'
import { getStudentSession } from '@/lib/students/session'

/**
 * Cierra la sesión del alumno y redirige a la pantalla de login.
 */
export async function POST(request: NextRequest) {
  const session = await getStudentSession()
  session.destroy()

  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/ikasle/sartu`, { status: 303 })
}
