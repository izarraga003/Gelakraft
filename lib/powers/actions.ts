'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getStudent } from '@/lib/students/session'
import { findPowerById } from './catalog'

export type PowerRequest = {
  id: string
  student_id: string
  target_student_id: string | null
  classroom_id: string
  power_id: string
  power_name: string
  mana_cost: number
  status: 'pending' | 'approved' | 'denied'
  created_at: string
  resolved_at: string | null
}

export type PowerRequestWithStudents = PowerRequest & {
  student_name: string
  target_student_name: string | null
}

// ============================================================
// ALUMNO: invocar poder (auto o manual)
// ============================================================

/**
 * El alumno invoca un poder desde su panel. Según el tipo:
 *   - auto: aplica efecto en BD al instante (descuenta mana).
 *   - manual: crea request pendiente (reserva el mana descontándolo).
 *
 * Se aplican los overrides del classroom (modo + coste) si existen.
 */
export async function studentInvokePower(
  powerId: string,
  targetStudentId?: string
): Promise<{ success: boolean; error?: string; pending?: boolean }> {
  const session = await getStudent()
  if (!session) return { success: false, error: 'Saioa galdu da.' }

  const power = findPowerById(powerId)
  if (!power) return { success: false, error: 'Poderea ez da aurkitu.' }

  const supabase = await createClient()

  // Lookup classroom_id y overrides
  const { data: student } = await supabase
    .from('students')
    .select('classroom_id')
    .eq('id', session.studentId)
    .single()
  if (!student) return { success: false, error: 'Ikaslea ez da aurkitu.' }

  const { data: override } = await supabase
    .from('power_overrides')
    .select('mode, mana_cost')
    .eq('classroom_id', student.classroom_id)
    .eq('power_id', powerId)
    .maybeSingle()

  const effectiveMode = (override?.mode ?? power.mode) as 'auto' | 'manual'
  const effectiveCost = override?.mana_cost ?? power.manaCost

  if (effectiveMode === 'auto' && power.mode === 'auto') {
    const requiresTarget = power.requiresTarget
    if (requiresTarget && !targetStudentId) {
      return { success: false, error: 'Helburua aukeratu behar duzu.' }
    }
    const { data, error } = await supabase.rpc('execute_power_auto', {
      p_student_id: session.studentId,
      p_power_id: power.id,
      p_power_name: power.name,
      p_mana_cost: effectiveCost,
      p_effect_type: power.effect,
      p_effect_value: power.effectValue,
      p_target_student_id: targetStudentId ?? null,
    })
    if (error) return { success: false, error: error.message }
    const r = data as { success: boolean; error?: string }
    if (!r.success) return { success: false, error: r.error ?? 'Errorea.' }
    revalidatePath('/ikasle/panela')
    return { success: true, pending: false }
  }

  // manual (o auto pero override a manual): request
  const { data, error } = await supabase.rpc('request_power', {
    p_student_id: session.studentId,
    p_power_id: power.id,
    p_power_name: power.name,
    p_mana_cost: effectiveCost,
    p_target_student_id: targetStudentId ?? null,
  })
  if (error) return { success: false, error: error.message }
  const r = data as { success: boolean; error?: string }
  if (!r.success) return { success: false, error: r.error ?? 'Errorea.' }
  revalidatePath('/ikasle/panela')
  return { success: true, pending: true }
}

// ============================================================
// PROFESOR: gestionar requests
// ============================================================

async function teacherAssertClassroom(classroomId: string): Promise<string | null> {
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

export async function listPendingRequests(
  classroomId: string
): Promise<{ success: true; requests: PowerRequestWithStudents[] } | { success: false; error: string }> {
  const err = await teacherAssertClassroom(classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('power_requests')
    .select(
      `id, student_id, target_student_id, classroom_id, power_id, power_name,
       mana_cost, status, created_at, resolved_at,
       student:students!power_requests_student_id_fkey(full_name),
       target:students!power_requests_target_student_id_fkey(full_name)`
    )
    .eq('classroom_id', classroomId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  type Row = PowerRequest & {
    student: { full_name: string } | null
    target: { full_name: string } | null
  }

  const list: PowerRequestWithStudents[] = ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    student_id: r.student_id,
    target_student_id: r.target_student_id,
    classroom_id: r.classroom_id,
    power_id: r.power_id,
    power_name: r.power_name,
    mana_cost: r.mana_cost,
    status: r.status,
    created_at: r.created_at,
    resolved_at: r.resolved_at,
    student_name: r.student?.full_name ?? '?',
    target_student_name: r.target?.full_name ?? null,
  }))

  return { success: true, requests: list }
}

export async function countPendingRequests(classroomId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('power_requests')
    .select('id', { count: 'exact', head: true })
    .eq('classroom_id', classroomId)
    .eq('status', 'pending')
  return count ?? 0
}

export async function approveRequest(
  requestId: string,
  classroomId: string
): Promise<{ success: boolean; error?: string }> {
  const err = await teacherAssertClassroom(classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('approve_power_request', {
    p_request_id: requestId,
  })
  if (error) return { success: false, error: error.message }
  const r = data as { success: boolean; error?: string }
  if (!r.success) return { success: false, error: r.error ?? 'Errorea.' }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  revalidatePath(`/panela/ikasgela/${classroomId}/eskaerak`)
  return { success: true }
}

export async function denyRequest(
  requestId: string,
  classroomId: string
): Promise<{ success: boolean; error?: string }> {
  const err = await teacherAssertClassroom(classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('deny_power_request', {
    p_request_id: requestId,
  })
  if (error) return { success: false, error: error.message }
  const r = data as { success: boolean; error?: string }
  if (!r.success) return { success: false, error: r.error ?? 'Errorea.' }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  revalidatePath(`/panela/ikasgela/${classroomId}/eskaerak`)
  return { success: true }
}
