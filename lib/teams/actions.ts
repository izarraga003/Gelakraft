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

export async function generateTeams(
  classroomId: string
): Promise<{ success: boolean; error?: string; numTeams?: number }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('generate_teams', {
    p_classroom_id: classroomId,
  })

  if (error) return { success: false, error: error.message }

  const result = data as { success: boolean; error?: string; num_teams?: number }
  if (!result.success) {
    return { success: false, error: result.error ?? 'Errorea.' }
  }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  revalidatePath(`/panela/ikasgela/${classroomId}/taldeak`)
  return { success: true, numTeams: result.num_teams }
}

export async function deleteAllTeams(
  classroomId: string
): Promise<{ success: boolean; error?: string }> {
  const err = await assertOwnership(classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('classroom_id', classroomId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  revalidatePath(`/panela/ikasgela/${classroomId}/taldeak`)
  return { success: true }
}

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
      a.hero_class < b.hero_class ? -1 : a.hero_class > b.hero_class ? 1 : a.full_name.localeCompare(b.full_name)
    ),
  }))

  return { success: true, teams: result }
}

/**
 * Helper para obtener qué team_id tiene un alumno (o null si ninguno).
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
