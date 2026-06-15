import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente Supabase para usar en SERVIDOR:
 *  - Server Components
 *  - Route Handlers (app/.../route.ts)
 *  - Server Actions
 *
 * En Next.js 15 `cookies()` es async, por eso la función es async.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components no pueden mutar cookies — el middleware se
            // encargará de refrescar la sesión. Es seguro ignorar este error.
          }
        },
      },
    }
  )
}
