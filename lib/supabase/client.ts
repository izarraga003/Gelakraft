import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para usar en componentes del NAVEGADOR.
 * Solo usar en componentes con la directiva 'use client'.
 */
export function createClient() {
  // DIAGNÓSTICO TEMPORAL — quitar después
  if (typeof window !== 'undefined') {
    console.log('[DEBUG] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('[DEBUG] KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log('[DEBUG] All NEXT_PUBLIC vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')))
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
