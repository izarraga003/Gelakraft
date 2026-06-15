import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para usar en componentes del NAVEGADOR.
 * Solo usar en componentes con la directiva 'use client'.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
