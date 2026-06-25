'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Mission, MissionEdge, MissionNode } from './types'
import type { MissionMapId } from './maps'

type Result<T = unknown> =
  | ({ success: true } & T)
  | { success: false; error: string }

// ================ MISIONES ================

export async function createMission(
  classroomId: string,
  payload: {
    name: string
    description?: string
    background_id?: MissionMapId
  }
): Promise<Result<{ mission: Mission }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Saioa hasi behar duzu.' }

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('teacher_id')
    .eq('id', classroomId)
    .single()
  if (!classroom || classroom.teacher_id !== user.id) {
    return { success: false, error: 'Ikasgela hori ez da zurea.' }
  }

  const { data, error } = await supabase
    .from('missions')
    .insert({
      classroom_id: classroomId,
      name: payload.name.trim(),
      description: payload.description?.trim() ?? '',
      background_id: payload.background_id ?? 'anboto',
    })
    .select('*')
    .single()
  if (error) return { success: false, error: error.message }

  revalidatePath(`/panela/ikasgela/${classroomId}/misioak`)
  return { success: true, mission: data as Mission }
}

export async function updateMission(
  missionId: string,
  patch: Partial<{
    name: string
    description: string
    background_id: MissionMapId
    is_active: boolean
    final_xp_reward: number
    final_hearts_reward: number
    final_mana_reward: number
  }>
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('missions')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', missionId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deleteMission(missionId: string): Promise<Result> {
  const supabase = await createClient()
  const { data: mission } = await supabase
    .from('missions')
    .select('classroom_id')
    .eq('id', missionId)
    .single()
  const { error } = await supabase.from('missions').delete().eq('id', missionId)
  if (error) return { success: false, error: error.message }
  if (mission) revalidatePath(`/panela/ikasgela/${mission.classroom_id}/misioak`)
  return { success: true }
}

export async function listMissions(
  classroomId: string
): Promise<{ missions: Mission[]; nodeCounts: Record<string, number> }> {
  const supabase = await createClient()
  const { data: missions } = await supabase
    .from('missions')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: false })
  const list = (missions ?? []) as Mission[]
  if (list.length === 0) return { missions: [], nodeCounts: {} }

  const { data: nodes } = await supabase
    .from('mission_nodes')
    .select('mission_id')
    .in('mission_id', list.map((m) => m.id))
  const counts: Record<string, number> = {}
  if (nodes) {
    for (const n of nodes) {
      counts[n.mission_id] = (counts[n.mission_id] ?? 0) + 1
    }
  }
  return { missions: list, nodeCounts: counts }
}

export async function getMissionWithGraph(missionId: string): Promise<{
  mission: Mission | null
  nodes: MissionNode[]
  edges: MissionEdge[]
}> {
  const supabase = await createClient()
  const { data: mission } = await supabase
    .from('missions')
    .select('*')
    .eq('id', missionId)
    .single()
  const { data: nodes } = await supabase
    .from('mission_nodes')
    .select('*')
    .eq('mission_id', missionId)
  const { data: edges } = await supabase
    .from('mission_edges')
    .select('*')
    .eq('mission_id', missionId)
  return {
    mission: (mission as Mission) ?? null,
    nodes: (nodes ?? []) as MissionNode[],
    edges: (edges ?? []) as MissionEdge[],
  }
}

// ================ NODOS ================

export async function createNode(
  missionId: string,
  data: {
    title: string
    position_x: number
    position_y: number
    is_start?: boolean
  }
): Promise<Result<{ node: MissionNode }>> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('mission_nodes')
    .insert({
      mission_id: missionId,
      title: data.title.trim() || 'Helburu berria',
      position_x: data.position_x,
      position_y: data.position_y,
      is_start: data.is_start ?? false,
    })
    .select('*')
    .single()
  if (error) return { success: false, error: error.message }

  // Si es el primer nodo, marcarlo como start automáticamente
  if (data.is_start === undefined) {
    const { count } = await supabase
      .from('mission_nodes')
      .select('*', { count: 'exact', head: true })
      .eq('mission_id', missionId)
    if (count === 1) {
      await supabase.from('mission_nodes').update({ is_start: true }).eq('id', row.id)
      row.is_start = true
    }
  }

  return { success: true, node: row as MissionNode }
}

export async function updateNode(
  nodeId: string,
  patch: Partial<MissionNode>
): Promise<Result> {
  const supabase = await createClient()
  // Eliminar campos que no se pueden actualizar
  const { id: _id, mission_id: _m, ...safePatch } = patch
  void _id
  void _m
  const { error } = await supabase.from('mission_nodes').update(safePatch).eq('id', nodeId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deleteNode(nodeId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from('mission_nodes').delete().eq('id', nodeId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function setStartNode(missionId: string, nodeId: string): Promise<Result> {
  const supabase = await createClient()
  // Limpiar el anterior
  await supabase
    .from('mission_nodes')
    .update({ is_start: false })
    .eq('mission_id', missionId)
  const { error } = await supabase
    .from('mission_nodes')
    .update({ is_start: true })
    .eq('id', nodeId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ================ EDGES ================

export async function createEdge(
  missionId: string,
  data: {
    from_node_id: string
    to_node_id: string
    condition?: 'always' | 'success' | 'failure'
  }
): Promise<Result<{ edge: MissionEdge }>> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('mission_edges')
    .insert({
      mission_id: missionId,
      from_node_id: data.from_node_id,
      to_node_id: data.to_node_id,
      condition: data.condition ?? 'always',
    })
    .select('*')
    .single()
  if (error) return { success: false, error: error.message }
  return { success: true, edge: row as MissionEdge }
}

export async function deleteEdge(edgeId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from('mission_edges').delete().eq('id', edgeId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ================ REVISIÓN (PROFESOR) ================

export async function listPendingReviews(classroomId: string): Promise<
  Array<{
    progress_id: string
    student_id: string
    student_name: string
    node_id: string
    node_title: string
    mission_id: string
    mission_name: string
    submission_text: string
    submitted_at: string
  }>
> {
  const supabase = await createClient()
  const { data } = await supabase
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
    const student = Array.isArray(row.students) ? row.students[0] : row.students
    const node = Array.isArray(row.mission_nodes) ? row.mission_nodes[0] : row.mission_nodes
    const mission = Array.isArray(row.missions) ? row.missions[0] : row.missions
    return {
      progress_id: row.id,
      student_id: row.student_id,
      student_name: student.full_name,
      node_id: row.node_id,
      node_title: node.title,
      mission_id: row.mission_id,
      mission_name: mission.name,
      submission_text: row.submission_text,
      submitted_at: row.submitted_at,
    }
  })
}

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
  if (!result.success) return { success: false, error: result.error ?? 'Errorea' }
  return { success: true }
}
