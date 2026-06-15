import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refresca la sesión del usuario en cada petición y protege las rutas /panela.
 *
 * Si las variables de entorno de Supabase no están configuradas, simplemente
 * deja pasar la petición sin hacer nada — esto permite que la home funcione
 * antes de configurar Supabase.
 */
export async function updateSession(request: NextRequest) {
  // Si Supabase no está configurado todavía, pasa de largo.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Importante: no añadir nada entre createServerClient() y getUser().
  // Esto refresca el token de acceso si está caducado.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteger rutas privadas: /panela/* requiere usuario autenticado.
  const path = request.nextUrl.pathname
  const isPrivateRoute = path.startsWith('/panela')

  if (!user && isPrivateRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/saioa-hasi'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  // Si está autenticado y va a páginas de auth, redirigir al panel.
  const isAuthRoute = path === '/saioa-hasi' || path === '/izen-ematea'
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/panela'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
