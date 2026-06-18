'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type DeathConsequence = {
  id: string
  classroom_id: string
  description: string
  display_order: number
}

async function assertOwnership(classroomId: string): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'Saioa hasi behar duzu.'

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('teacher_id')
    .eq('id', classroomId)
    .single()
  if (!classroom || classroom.teacher_id !== user.id) {
    return 'Ikasgela hori ez da zurea.'
  }
  return null
}

export async function listConsequences(
  classroomId: string
): Promise<{ success: true; items: DeathConsequence[] } | { success: false; error: string }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('death_consequences')
    .select('id, classroom_id, description, display_order')
    .eq('classroom_id', classroomId)
    .order('display_order', { ascending: true })
  if (error) return { success: false, error: error.message }
  return { success: true, items: (data ?? []) as DeathConsequence[] }
}

export async function createConsequence(input: {
  classroomId: string
  description: string
}): Promise<{ success: true; item: DeathConsequence } | { success: false; error: string }> {
  const err = await assertOwnership(input.classroomId)
  if (err) return { success: false, error: err }
  if (!input.description.trim()) {
    return { success: false, error: 'Deskribapena ezin da hutsik egon.' }
  }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('death_consequences')
    .insert({
      classroom_id: input.classroomId,
      description: input.description.trim(),
      display_order: 999,
    })
    .select('id, classroom_id, description, display_order')
    .single()
  if (error || !data) return { success: false, error: error?.message ?? 'Errorea.' }
  revalidatePath(`/panela/ikasgela/${input.classroomId}/konfiguratu/patuak`)
  return { success: true, item: data as DeathConsequence }
}

export async function updateConsequence(input: {
  id: string
  classroomId: string
  description: string
}): Promise<{ success: boolean; error?: string }> {
  const err = await assertOwnership(input.classroomId)
  if (err) return { success: false, error: err }
  if (!input.description.trim()) {
    return { success: false, error: 'Deskribapena ezin da hutsik egon.' }
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from('death_consequences')
    .update({ description: input.description.trim() })
    .eq('id', input.id)
    .eq('classroom_id', input.classroomId)
  if (error) return { success: false, error: error.message }
  revalidatePath(`/panela/ikasgela/${input.classroomId}/konfiguratu/patuak`)
  return { success: true }
}

export async function deleteConsequence(
  id: string,
  classroomId: string
): Promise<{ success: boolean; error?: string }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }
  const supabase = await createClient()
  const { error } = await supabase
    .from('death_consequences')
    .delete()
    .eq('id', id)
    .eq('classroom_id', classroomId)
  if (error) return { success: false, error: error.message }
  revalidatePath(`/panela/ikasgela/${classroomId}/konfiguratu/patuak`)
  return { success: true }
}

// ============================================================
// Ejecutar sentencia
// ============================================================

export type PendingDeathStudent = {
  id: string
  full_name: string
  avatar_config: Record<string, unknown>
  hero_class: string
  xp: number
}

export async function listPendingDeaths(
  classroomId: string
): Promise<{ success: true; students: PendingDeathStudent[] } | { success: false; error: string }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_pending_deaths', {
    p_classroom_id: classroomId,
  })
  if (error) return { success: false, error: error.message }
  const r = data as { success: boolean; error?: string; students?: PendingDeathStudent[] }
  if (!r.success) return { success: false, error: r.error ?? 'Errorea.' }
  return { success: true, students: r.students ?? [] }
}

export async function executeSentence(
  studentId: string,
  classroomId: string
): Promise<{ success: true; consequence: string; studentName: string } | { success: false; error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('execute_death_sentence', {
    p_student_id: studentId,
  })
  if (error) return { success: false, error: error.message }
  const r = data as {
    success: boolean
    error?: string
    consequence?: string
    student_name?: string
  }
  if (!r.success) return { success: false, error: r.error ?? 'Errorea.' }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  return {
    success: true,
    consequence: r.consequence ?? '',
    studentName: r.student_name ?? '',
  }
}
