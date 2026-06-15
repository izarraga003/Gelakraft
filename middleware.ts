import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - _next/static (estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - cualquier archivo con extensión de imagen
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// 🔧 Forzar Node.js runtime (no Edge), porque @supabase/ssr arrastra
// @supabase/supabase-js que usa APIs de Node como `process.version`,
// las cuales no están disponibles en el Edge Runtime.
export const runtime = 'nodejs'
