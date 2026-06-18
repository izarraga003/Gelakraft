'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { findPowerById } from './catalog'

export async function activatePower(
  studentId: string,
  powerId: string
): Promise<{ success: boolean; error?: string }> {
  const power = findPowerById(powerId)
  if (!power) return { success: false, error: 'Poderea ez da aurkitu.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Saioa hasi behar duzu.' }

  // Verificar ownership a través del classroom del student
  const { data: student } = await supabase
    .from('students')
    .select('classroom_id, classroom:classrooms!inner(teacher_id)')
    .eq('id', studentId)
    .single()

  type StudentRow = { classroom_id: string; classroom: { teacher_id: string } | null }
  const s = student as unknown as StudentRow | null
  if (!s || s.classroom?.teacher_id !== user.id) {
    return { success: false, error: 'Ikasle hori ez da zurea.' }
  }

  const { data, error } = await supabase.rpc('use_power', {
    p_student_id: studentId,
    p_power_id: powerId,
    p_mana_cost: power.manaCost,
    p_power_name: power.name,
  })

  if (error) return { success: false, error: error.message }

  const result = data as { success: boolean; error?: string }
  if (!result.success) return { success: false, error: result.error ?? 'Errorea.' }

  revalidatePath(`/panela/ikasgela/${s.classroom_id}`)
  return { success: true }
}
