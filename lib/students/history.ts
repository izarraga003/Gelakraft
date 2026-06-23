'use server'

import { createClient } from '@/lib/supabase/server'

export type HistoryEntry = {
  id: string
  activity_type: string
  outcome: string
  xp_delta: number
  hearts_delta: number
  metadata: Record<string, unknown>
  created_at: string
  scope: 'individual' | 'classroom'
}

/**
 * Devuelve el historial de un alumno: actividades individuales/bulk en las
 * que aparece, más las actividades globales del aula (afectan a todos).
 *
 * Filtros opcionales:
 *   - kind: 'all' | 'reward' | 'punishment' | 'battle' | 'power' | 'event' | 'adjustment' | 'patua'
 *   - limit: nº máximo de entradas (default 100)
 */
export async function getStudentHistory(
  studentId: string,
  options: { kind?: string; limit?: number } = {}
): Promise<
  | { success: true; entries: HistoryEntry[] }
  | { success: false; error: string }
> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Saioa hasi behar duzu.' }

  // Validar que el alumno pertenece a un aula del profesor
  const { data: student } = await supabase
    .from('students')
    .select('classroom_id, classrooms!inner(teacher_id)')
    .eq('id', studentId)
    .single()

  if (!student) {
    return { success: false, error: 'Ikaslea ez da aurkitu.' }
  }

  const classroomData = student.classrooms as unknown as {
    teacher_id: string
  } | { teacher_id: string }[]
  const teacherId = Array.isArray(classroomData)
    ? classroomData[0]?.teacher_id
    : classroomData?.teacher_id

  if (teacherId !== user.id) {
    return { success: false, error: 'Ez duzu baimenik ikasle honetan.' }
  }

  const limit = options.limit ?? 100

  // Traer todas las activities del classroom (las que afectaron al alumno
  // individual o las globales). Postgres puede filtrar el array con `@>`.
  const { data, error } = await supabase
    .from('activities')
    .select(
      'id, activity_type, outcome, xp_delta, hearts_delta, metadata, created_at, affected_student_ids'
    )
    .eq('classroom_id', student.classroom_id)
    .or(`affected_student_ids.is.null,affected_student_ids.cs.{${studentId}}`)
    .order('created_at', { ascending: false })
    .limit(limit * 2) // pedimos más por si hay que filtrar después por kind

  if (error) {
    return { success: false, error: error.message }
  }

  let entries: HistoryEntry[] = (data ?? []).map((row) => ({
    id: row.id,
    activity_type: row.activity_type,
    outcome: row.outcome,
    xp_delta: row.xp_delta,
    hearts_delta: row.hearts_delta,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    created_at: row.created_at,
    scope:
      row.affected_student_ids && row.affected_student_ids.length > 0
        ? 'individual'
        : 'classroom',
  }))

  // Filtro de tipo si se especificó
  if (options.kind && options.kind !== 'all') {
    entries = entries.filter((e) => {
      const kind = options.kind
      if (kind === 'reward') {
        return e.activity_type === 'reward' || (e.activity_type === 'adjustment' && e.outcome === 'success')
      }
      if (kind === 'punishment') {
        return e.activity_type === 'adjustment' && e.outcome === 'failure'
      }
      if (kind === 'battle') return e.activity_type === 'battle'
      if (kind === 'event') return e.activity_type === 'event'
      if (kind === 'silence') return e.activity_type === 'silence'
      if (kind === 'power') {
        const m = e.metadata as Record<string, unknown>
        return e.activity_type === 'adjustment' && (m.kind === 'power_used' || m.kind === 'power_request')
      }
      if (kind === 'patua') {
        const m = e.metadata as Record<string, unknown>
        return m.kind === 'death_sentence' || Boolean(m.patua)
      }
      if (kind === 'adjustment') {
        const m = e.metadata as Record<string, unknown>
        return e.activity_type === 'adjustment' && m.kind !== 'death_sentence' && m.kind !== 'power_used' && m.kind !== 'power_request'
      }
      return true
    })
  }

  return { success: true, entries: entries.slice(0, limit) }
}
