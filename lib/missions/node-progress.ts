'use server'

import { createClient } from '@/lib/supabase/server'

export type NodeStudent = {
  id: string
  name: string
  submitted_at: string | null
}

export type NodeProgress = {
  node_id: string
  title: string
  is_start: boolean
  position_y: number
  total: number
  completed: NodeStudent[]
  pending: NodeStudent[]
  failed: NodeStudent[]
  available: NodeStudent[]
  locked: NodeStudent[]
}

/**
 * Devuelve el progreso de cada nodo de una misión, con los alumnos
 * agrupados por estado. Pensado para mostrarse en la página de garapena.
 */
export async function getMissionNodeProgressAction(
  missionId: string
): Promise<NodeProgress[]> {
  const supabase = await createClient()

  // 1) Misión + aula
  const { data: missionRow } = await supabase
    .from('missions')
    .select('id, classroom_id')
    .eq('id', missionId)
    .single()

  if (!missionRow) return []

  // 2) Nodos (start primero, luego por posición visual)
  const { data: nodes } = await supabase
    .from('mission_nodes')
    .select('id, title, is_start, position_x, position_y')
    .eq('mission_id', missionId)
    .order('is_start', { ascending: false })
    .order('position_y', { ascending: true })
    .order('position_x', { ascending: true })

  if (!nodes || nodes.length === 0) return []

  // 3) Alumnos del aula
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name')
    .eq('classroom_id', missionRow.classroom_id)
    .order('full_name')

  if (!students) return []

  // 4) Progreso completo
  const { data: progress } = await supabase
    .from('mission_progress')
    .select('node_id, student_id, status, submitted_at')
    .eq('mission_id', missionId)

  const studentMap = new Map(students.map((s) => [s.id, s.full_name]))

  return nodes.map((n) => {
    const forNode = (progress ?? []).filter((p) => p.node_id === n.id)
    const withProgressIds = new Set(forNode.map((p) => p.student_id))

    const collect = (status: string): NodeStudent[] =>
      forNode
        .filter((p) => p.status === status)
        .map((p) => ({
          id: p.student_id,
          name: studentMap.get(p.student_id) ?? 'Ikasle ezezaguna',
          submitted_at: p.submitted_at ?? null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'eu'))

    const locked: NodeStudent[] = students
      .filter((s) => !withProgressIds.has(s.id))
      .map((s) => ({ id: s.id, name: s.full_name, submitted_at: null }))

    return {
      node_id: n.id,
      title: n.title,
      is_start: n.is_start,
      position_y: n.position_y,
      total: students.length,
      completed: collect('completed'),
      pending: collect('pending_review'),
      failed: collect('failed'),
      available: collect('available'),
      locked,
    }
  })
}
