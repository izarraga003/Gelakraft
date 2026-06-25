import { createClient as createBaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase sin auth de sesión.
 *
 * Pensado para llamadas a RPCs SECURITY DEFINER desde rutas autenticadas
 * por iron-session (alumnos): el server ya tiene el studentId de la cookie
 * y lo pasa como parámetro a la RPC, que internamente valida ownership.
 *
 * NO usa @supabase/ssr porque ese lee cookies de Supabase auth (del
 * profesor) y aquí no queremos esa sesión.
 */
export function createServiceClient() {
  return createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
