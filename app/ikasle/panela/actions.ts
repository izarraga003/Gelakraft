'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getStudentSession } from '@/lib/students/session'
import {
  sanitizeAvatarConfig,
  type AvatarConfig,
} from '@/lib/students/avatar'
import { xpToLevel } from '@/lib/students/level'

/**
 * Actualiza el avatar del alumno actual (basado en su iron-session).
 * Sanea la config y verifica que todas las opciones están desbloqueadas para su nivel.
 */
export async function updateStudentAvatar(
  newConfig: AvatarConfig
): Promise<{ success: boolean; error?: string }> {
  const session = await getStudentSession()
  if (!session.studentId) {
    return { success: false, error: 'Saioa galdu da. Sartu berriro.' }
  }

  const supabase = await createClient()

  // Obtener el nivel actual del alumno para validar
  const { data: student } = await supabase
    .from('students')
    .select('xp')
    .eq('id', session.studentId)
    .single()

  if (!student) {
    return { success: false, error: 'Ikaslea ez da aurkitu.' }
  }

  const level = xpToLevel(student.xp)
  const sanitized = sanitizeAvatarConfig(newConfig, level)

  const { error } = await supabase.rpc('update_student_avatar', {
    p_student_id: session.studentId,
    p_avatar_config: sanitized,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/ikasle/panela')
  return { success: true }
}
