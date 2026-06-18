'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getStudentSession } from '@/lib/students/session'
import { isValidAvatar } from '@/lib/students/avatars'

/**
 * Actualiza el avatar del alumno actual (basado en su iron-session).
 * Valida que el avatar sea uno del set predefinido.
 */
export async function updateStudentAvatar(
  newAvatar: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getStudentSession()
  if (!session.studentId) {
    return { success: false, error: 'Saioa galdu da. Sartu berriro.' }
  }

  if (!isValidAvatar(newAvatar)) {
    return { success: false, error: 'Avatar baliogabea.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('update_student_avatar', {
    p_student_id: session.studentId,
    p_avatar: newAvatar,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/ikasle/panela')
  return { success: true }
}
