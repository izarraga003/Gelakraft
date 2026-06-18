'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type BehaviorType = 'positive' | 'negative'

export type Behavior = {
  id: string
  classroom_id: string
  behavior_type: BehaviorType
  description: string
  xp_delta: number
  hearts_delta: number
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

export async function listBehaviors(
  classroomId: string
): Promise<{ success: true; behaviors: Behavior[] } | { success: false; error: string }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('behaviors')
    .select('id, classroom_id, behavior_type, description, xp_delta, hearts_delta, display_order')
    .eq('classroom_id', classroomId)
    .order('behavior_type', { ascending: true })
    .order('display_order', { ascending: true })

  if (error) return { success: false, error: error.message }
  return { success: true, behaviors: (data ?? []) as Behavior[] }
}

export async function createBehavior(input: {
  classroomId: string
  behaviorType: BehaviorType
  description: string
  xpDelta: number
  heartsDelta: number
}): Promise<{ success: true; behavior: Behavior } | { success: false; error: string }> {
  const err = await assertOwnership(input.classroomId)
  if (err) return { success: false, error: err }

  if (!input.description.trim()) {
    return { success: false, error: 'Deskribapena ezin da hutsik egon.' }
  }
  if (input.xpDelta === 0 && input.heartsDelta === 0) {
    return { success: false, error: 'XP edo bihotzak aldatu behar dira.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('behaviors')
    .insert({
      classroom_id: input.classroomId,
      behavior_type: input.behaviorType,
      description: input.description.trim(),
      xp_delta: input.xpDelta,
      hearts_delta: input.heartsDelta,
      display_order: 999,
    })
    .select('id, classroom_id, behavior_type, description, xp_delta, hearts_delta, display_order')
    .single()

  if (error || !data) return { success: false, error: error?.message ?? 'Errorea.' }

  revalidatePath(`/panela/ikasgela/${input.classroomId}/jokabideak`)
  return { success: true, behavior: data as Behavior }
}

export async function updateBehavior(input: {
  id: string
  classroomId: string
  description: string
  xpDelta: number
  heartsDelta: number
}): Promise<{ success: boolean; error?: string }> {
  const err = await assertOwnership(input.classroomId)
  if (err) return { success: false, error: err }

  if (!input.description.trim()) {
    return { success: false, error: 'Deskribapena ezin da hutsik egon.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('behaviors')
    .update({
      description: input.description.trim(),
      xp_delta: input.xpDelta,
      hearts_delta: input.heartsDelta,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('classroom_id', input.classroomId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/panela/ikasgela/${input.classroomId}/jokabideak`)
  return { success: true }
}

export async function deleteBehavior(
  id: string,
  classroomId: string
): Promise<{ success: boolean; error?: string }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()
  const { error } = await supabase
    .from('behaviors')
    .delete()
    .eq('id', id)
    .eq('classroom_id', classroomId)

  if (error) return { success: false, error: error.message }
  revalidatePath(`/panela/ikasgela/${classroomId}/jokabideak`)
  return { success: true }
}
