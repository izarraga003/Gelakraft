'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type AdjustResult =
  | { success: true }
  | { success: false; error: string }

/**
 * Ajusta XP y/o corazones de un conjunto específico de alumnos (1 o varios).
 * Verifica ownership del classroom y llama a la función SQL adjust_students,
 * que aplica los cambios Y registra la actividad con `affected_student_ids`.
 */
export async function adjustStudents(
  classroomId: string,
  studentIds: string[],
  xpDelta: number,
  heartsDelta: number,
  note?: string
): Promise<AdjustResult> {
  if (studentIds.length === 0) {
    return { success: false, error: 'Ez da ikaslerik aukeratu.' }
  }
  if (xpDelta === 0 && heartsDelta === 0) {
    return { success: false, error: 'Ezer ez aldatzeko ez du zentzurik.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Saioa hasi behar duzu.' }
  }

  // Verificar ownership del classroom
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, teacher_id')
    .eq('id', classroomId)
    .single()

  if (!classroom || classroom.teacher_id !== user.id) {
    return { success: false, error: 'Ikasgela hori ez da zurea.' }
  }

  const { error } = await supabase.rpc('adjust_students', {
    p_classroom_id: classroomId,
    p_student_ids: studentIds,
    p_xp_delta: xpDelta,
    p_hearts_delta: heartsDelta,
    p_note: note ?? null,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  return { success: true }
}
