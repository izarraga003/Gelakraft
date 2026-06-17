'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_EVENTS } from './default-events'

const MAX_TITLE = 60
const MAX_DESCRIPTION = 800

function validate(title: string, description: string): string | null {
  const t = title.trim()
  const d = description.trim()
  if (!t) return 'Idatzi gertaeraren izenburua.'
  if (t.length > MAX_TITLE)
    return `Izenburuak ${MAX_TITLE} karaktere baino gutxiago izan behar du.`
  if (!d) return 'Idatzi gertaeraren deskribapena.'
  if (d.length > MAX_DESCRIPTION)
    return `Deskribapenak ${MAX_DESCRIPTION} karaktere baino gutxiago izan behar du.`
  return null
}

export async function createEvent(
  title: string,
  description: string
): Promise<
  | { success: true; event: { id: string; title: string; description: string } }
  | { success: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Saioa hasi behar duzu.' }

  const validationError = validate(title, description)
  if (validationError) return { success: false, error: validationError }

  const { data, error } = await supabase
    .from('events')
    .insert({
      teacher_id: user.id,
      title: title.trim(),
      description: description.trim(),
    })
    .select('id, title, description')
    .single()

  if (error || !data)
    return { success: false, error: error?.message ?? 'Errore ezezaguna.' }

  revalidatePath('/panela', 'layout')
  return { success: true, event: data }
}

export async function updateEvent(
  id: string,
  title: string,
  description: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Saioa hasi behar duzu.' }

  const validationError = validate(title, description)
  if (validationError) return { success: false, error: validationError }

  const { error } = await supabase
    .from('events')
    .update({
      title: title.trim(),
      description: description.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/panela', 'layout')
  return { success: true }
}

export async function deleteEvent(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Saioa hasi behar duzu.' }

  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/panela', 'layout')
  return { success: true }
}

/**
 * Carga los eventos por defecto (DEFAULT_EVENTS).
 * Se inserta solo en la lista del profesor actual.
 */
export async function loadDefaultEvents(): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Saioa hasi behar duzu.' }

  const inserts = DEFAULT_EVENTS.map((e) => ({
    teacher_id: user.id,
    title: e.title,
    description: e.description,
  }))

  const { error } = await supabase.from('events').insert(inserts)
  if (error) return { success: false, error: error.message }

  revalidatePath('/panela', 'layout')
  return { success: true, count: inserts.length }
}

/**
 * Borrar TODOS los eventos del profesor (acción destructiva).
 */
export async function deleteAllEvents(): Promise<{
  success: boolean
  error?: string
  count?: number
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Saioa hasi behar duzu.' }

  const { error, count } = await supabase
    .from('events')
    .delete({ count: 'exact' })
    .eq('teacher_id', user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/panela', 'layout')
  return { success: true, count: count ?? 0 }
}
