'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Mission } from './types'

type Result<T = unknown> =
  | ({ success: true } & T)
  | { success: false; error: string }

// ============================================================
// DUPLICAR MISIÓN
// Clona misión + nodos + edges en el mismo aula (o en otra del profe).
// ============================================================
export async function duplicateMission(
  missionId: string,
  targetClassroomId?: string
): Promise<Result<{ newMissionId: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Saioa hasi behar duzu.' }

  const { data: source } = await supabase
    .from('missions')
    .select('*')
    .eq('id', missionId)
    .single()
  if (!source) return { success: false, error: 'Misioa ez da aurkitu.' }

  const classroomId = targetClassroomId ?? source.classroom_id
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('teacher_id')
    .eq('id', classroomId)
    .single()
  if (!classroom || classroom.teacher_id !== user.id) {
    return { success: false, error: 'Helmugako ikasgela ez da zurea.' }
  }

  // Crear la nueva misión
  const { data: newMission, error: newErr } = await supabase
    .from('missions')
    .insert({
      classroom_id: classroomId,
      name: `${source.name} (kopia)`,
      description: source.description,
      background_id: source.background_id,
      is_active: false, // empieza oculta
      final_xp_reward: source.final_xp_reward,
      final_hearts_reward: source.final_hearts_reward,
      final_mana_reward: source.final_mana_reward,
    })
    .select('id')
    .single()
  if (newErr || !newMission) {
    return { success: false, error: newErr?.message ?? 'Errorea misioa sortzean.' }
  }

  // Cargar nodos del original
  const { data: oldNodes } = await supabase
    .from('mission_nodes')
    .select('*')
    .eq('mission_id', missionId)
  if (oldNodes && oldNodes.length > 0) {
    type N = {
      id: string
      title: string
      description: string
      position_x: number
      position_y: number
      content_type: string
      content_url: string
      content_text: string
      validation_type: string
      xp_reward: number
      hearts_delta: number
      mana_reward: number
      hearts_penalty: number
      is_start: boolean
    }
    const nodeMap = new Map<string, string>() // old_id -> new_id

    for (const n of oldNodes as N[]) {
      const { data: newNode } = await supabase
        .from('mission_nodes')
        .insert({
          mission_id: newMission.id,
          title: n.title,
          description: n.description,
          position_x: n.position_x,
          position_y: n.position_y,
          content_type: n.content_type,
          content_url: n.content_url,
          content_text: n.content_text,
          validation_type: n.validation_type,
          xp_reward: n.xp_reward,
          hearts_delta: n.hearts_delta,
          mana_reward: n.mana_reward,
          hearts_penalty: n.hearts_penalty,
          is_start: n.is_start,
        })
        .select('id')
        .single()
      if (newNode) nodeMap.set(n.id, newNode.id)
    }

    // Cargar edges originales y recrear con los nuevos IDs
    const { data: oldEdges } = await supabase
      .from('mission_edges')
      .select('*')
      .eq('mission_id', missionId)
    if (oldEdges && oldEdges.length > 0) {
      for (const e of oldEdges as Array<{
        from_node_id: string
        to_node_id: string
        condition: 'always' | 'success' | 'failure'
      }>) {
        const fromNew = nodeMap.get(e.from_node_id)
        const toNew = nodeMap.get(e.to_node_id)
        if (!fromNew || !toNew) continue
        await supabase.from('mission_edges').insert({
          mission_id: newMission.id,
          from_node_id: fromNew,
          to_node_id: toNew,
          condition: e.condition,
        })
      }
    }
  }

  revalidatePath(`/panela/ikasgela/${classroomId}/misioak`)
  return { success: true, newMissionId: newMission.id }
}

// ============================================================
// PROGRESO DEL AULA EN UNA MISIÓN
// ============================================================
export type StudentProgressRow = {
  student_id: string
  student_name: string
  total_nodes: number
  completed: number
  pending_review: number
  failed: number
  available: number
  fully_completed: boolean
  current_node_title: string | null
}

export async function getMissionClassroomProgress(
  missionId: string
): Promise<StudentProgressRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_mission_classroom_progress', {
    p_mission_id: missionId,
  })
  if (error) {
    console.error('[Misioak] classroom progress error:', error)
    return []
  }
  return (data ?? []) as StudentProgressRow[]
}

// ============================================================
// REVISIONES PENDIENTES (lista plana del aula)
// ============================================================
export type PendingReview = {
  progress_id: string
  student_id: string
  student_name: string
  node_id: string
  node_title: string
  mission_id: string
  mission_name: string
  submission_text: string
  submitted_at: string
}

export async function listPendingReviews(
  classroomId: string
): Promise<PendingReview[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mission_progress')
    .select(`
      id, student_id, node_id, mission_id, submission_text, submitted_at,
      students!inner(full_name),
      mission_nodes!inner(title),
      missions!inner(name, classroom_id)
    `)
    .eq('status', 'pending_review')
    .eq('missions.classroom_id', classroomId)
    .order('submitted_at', { ascending: true })

  if (error) {
    console.error('[Misioak] listPendingReviews error:', error)
    return []
  }

  type Row = {
    id: string
    student_id: string
    node_id: string
    mission_id: string
    submission_text: string
    submitted_at: string
    students: { full_name: string } | { full_name: string }[]
    mission_nodes: { title: string } | { title: string }[]
    missions: { name: string } | { name: string }[]
  }
  return ((data ?? []) as unknown as Row[]).map((row) => {
    const s = Array.isArray(row.students) ? row.students[0] : row.students
    const n = Array.isArray(row.mission_nodes) ? row.mission_nodes[0] : row.mission_nodes
    const m = Array.isArray(row.missions) ? row.missions[0] : row.missions
    return {
      progress_id: row.id,
      student_id: row.student_id,
      student_name: s.full_name,
      node_id: row.node_id,
      node_title: n.title,
      mission_id: row.mission_id,
      mission_name: m.name,
      submission_text: row.submission_text,
      submitted_at: row.submitted_at,
    }
  })
}

// ============================================================
// REVISAR UNA ENTREGA: success / failure
// ============================================================
export async function reviewSubmission(
  nodeId: string,
  studentId: string,
  outcome: 'success' | 'failure'
): Promise<Result> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('review_mission_node', {
    p_node_id: nodeId,
    p_student_id: studentId,
    p_outcome: outcome,
  })
  if (error) return { success: false, error: error.message }
  const result = data as { success: boolean; error?: string }
  if (!result.success) return { success: false, error: result.error ?? 'Errorea.' }
  return { success: true }
}

// ============================================================
// CONTAR REVISIONES PENDIENTES POR AULA (para badge)
// ============================================================
export async function countPendingReviewsByClassroom(
  classroomIds: string[]
): Promise<Record<string, number>> {
  if (classroomIds.length === 0) return {}
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mission_progress')
    .select('mission_id, missions!inner(classroom_id)')
    .eq('status', 'pending_review')

  if (error || !data) return {}

  type Row = {
    mission_id: string
    missions: { classroom_id: string } | { classroom_id: string }[]
  }
  const counts: Record<string, number> = {}
  for (const row of data as unknown as Row[]) {
    const m = Array.isArray(row.missions) ? row.missions[0] : row.missions
    if (classroomIds.includes(m.classroom_id)) {
      counts[m.classroom_id] = (counts[m.classroom_id] ?? 0) + 1
    }
  }
  return counts
}

// Export type Mission to avoid unused-import warning in callers
export type { Mission }
