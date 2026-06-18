'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type TeamMember = {
  id: string
  full_name: string
  hero_class: 'sorgina' | 'lamia' | 'jentila'
  avatar_config: Record<string, unknown>
  xp: number
}

export type Team = {
  id: string
  name: string
  position: number
  members: TeamMember[]
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

// ============================================================
// CRUD MANUAL DE EQUIPOS
// ============================================================

export async function createTeam(
  classroomId: string,
  name: string
): Promise<{ success: boolean; error?: string; team?: Team }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }
  if (!name.trim()) return { success: false, error: 'Izena ezin da hutsik egon.' }

  const supabase = await createClient()

  // Calcular siguiente position
  const { data: existing } = await supabase
    .from('teams')
    .select('position')
    .eq('classroom_id', classroomId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPos = (existing?.[0]?.position ?? 0) + 1

  const { data, error } = await supabase
    .from('teams')
    .insert({
      classroom_id: classroomId,
      name: name.trim(),
      position: nextPos,
    })
    .select('id, name, position')
    .single()

  if (error || !data) return { success: false, error: error?.message ?? 'Errorea.' }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  revalidatePath(`/panela/ikasgela/${classroomId}/taldeak`)
  return {
    success: true,
    team: { id: data.id, name: data.name, position: data.position, members: [] },
  }
}

export async function renameTeam(
  teamId: string,
  classroomId: string,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }
  if (!newName.trim()) return { success: false, error: 'Izena ezin da hutsik egon.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('teams')
    .update({ name: newName.trim() })
    .eq('id', teamId)
    .eq('classroom_id', classroomId)

  if (error) return { success: false, error: error.message }
  revalidatePath(`/panela/ikasgela/${classroomId}/taldeak`)
  return { success: true }
}

export async function deleteTeam(
  teamId: string,
  classroomId: string
): Promise<{ success: boolean; error?: string }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId)
    .eq('classroom_id', classroomId)

  if (error) return { success: false, error: error.message }
  revalidatePath(`/panela/ikasgela/${classroomId}`)
  revalidatePath(`/panela/ikasgela/${classroomId}/taldeak`)
  return { success: true }
}

/**
 * Mueve un alumno a un equipo (o lo quita si teamId == null).
 * Si ya estaba en otro equipo, lo cambia.
 */
export async function assignStudentToTeam(
  studentId: string,
  teamId: string | null,
  classroomId: string
): Promise<{ success: boolean; error?: string }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()

  // Borrar membresía anterior (la unique constraint sobre student_id lo exige)
  await supabase.from('team_members').delete().eq('student_id', studentId)

  if (teamId !== null) {
    const { error } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, student_id: studentId })
    if (error) return { success: false, error: error.message }
  }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  revalidatePath(`/panela/ikasgela/${classroomId}/taldeak`)
  return { success: true }
}

// ============================================================
// LECTURA
// ============================================================

export async function listTeams(
  classroomId: string
): Promise<{ success: true; teams: Team[] } | { success: false; error: string }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()

  const { data: teams, error: e1 } = await supabase
    .from('teams')
    .select('id, name, position')
    .eq('classroom_id', classroomId)
    .order('position', { ascending: true })

  if (e1) return { success: false, error: e1.message }
  if (!teams || teams.length === 0) return { success: true, teams: [] }

  const teamIds = teams.map((t) => t.id)
  const { data: memberships, error: e2 } = await supabase
    .from('team_members')
    .select('team_id, student:students(id, full_name, hero_class, avatar_config, xp)')
    .in('team_id', teamIds)

  if (e2) return { success: false, error: e2.message }

  type MembershipRow = {
    team_id: string
    student:
      | { id: string; full_name: string; hero_class: 'sorgina' | 'lamia' | 'jentila'; avatar_config: Record<string, unknown>; xp: number }
      | null
  }

  const byTeam = new Map<string, TeamMember[]>()
  for (const m of (memberships ?? []) as unknown as MembershipRow[]) {
    if (!m.student) continue
    if (!byTeam.has(m.team_id)) byTeam.set(m.team_id, [])
    byTeam.get(m.team_id)!.push({
      id: m.student.id,
      full_name: m.student.full_name,
      hero_class: m.student.hero_class,
      avatar_config: m.student.avatar_config,
      xp: m.student.xp,
    })
  }

  const result: Team[] = teams.map((t) => ({
    id: t.id,
    name: t.name,
    position: t.position,
    members: (byTeam.get(t.id) ?? []).sort((a, b) =>
      a.full_name.localeCompare(b.full_name)
    ),
  }))

  return { success: true, teams: result }
}

/**
 * Devuelve, para cada alumno del classroom, en qué team_id está (si lo está).
 */
export async function getStudentTeamMap(
  classroomId: string
): Promise<Map<string, { teamId: string; teamName: string; teamPosition: number }>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('team_members')
    .select('student_id, team:teams!inner(id, name, position, classroom_id)')
    .eq('team.classroom_id', classroomId)

  type Row = {
    student_id: string
    team: { id: string; name: string; position: number; classroom_id: string } | null
  }

  const map = new Map<string, { teamId: string; teamName: string; teamPosition: number }>()
  for (const r of (data ?? []) as unknown as Row[]) {
    if (!r.team) continue
    map.set(r.student_id, {
      teamId: r.team.id,
      teamName: r.team.name,
      teamPosition: r.team.position,
    })
  }
  return map
}
