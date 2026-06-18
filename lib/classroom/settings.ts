'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { HeroClass } from '@/lib/students/hero-class'

export type ClassroomSettings = {
  id: string
  name: string
  weekly_mana: number
  weekly_hearts: number
}

export async function getClassroomSettings(
  classroomId: string
): Promise<ClassroomSettings | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('classrooms')
    .select('id, name, weekly_mana, weekly_hearts')
    .eq('id', classroomId)
    .single()
  return (data as ClassroomSettings | null) ?? null
}

export async function updateClassroomSettings(input: {
  classroomId: string
  name: string
  weeklyMana: number
  weeklyHearts: number
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('update_classroom_settings', {
    p_classroom_id: input.classroomId,
    p_name: input.name,
    p_weekly_mana: input.weeklyMana,
    p_weekly_hearts: input.weeklyHearts,
  })
  if (error) return { success: false, error: error.message }
  const r = data as { success: boolean; error?: string }
  if (!r.success) return { success: false, error: r.error ?? 'Errorea.' }

  revalidatePath(`/panela/ikasgela/${input.classroomId}`)
  revalidatePath(`/panela/ikasgela/${input.classroomId}/konfiguratu`)
  return { success: true }
}

export async function updateStudentHeroClass(
  studentId: string,
  newClass: HeroClass,
  classroomId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('update_student_hero_class', {
    p_student_id: studentId,
    p_new_class: newClass,
  })
  if (error) return { success: false, error: error.message }
  const r = data as { success: boolean; error?: string }
  if (!r.success) return { success: false, error: r.error ?? 'Errorea.' }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  revalidatePath(`/panela/ikasgela/${classroomId}/konfiguratu/ikasleak`)
  return { success: true }
}
