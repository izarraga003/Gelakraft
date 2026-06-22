import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProiektatuView from './ProiektatuView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Params = { classroomId: string }

export default async function ProiektatuPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { classroomId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/saioa-hasi')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name, teacher_id')
    .eq('id', classroomId)
    .single()
  if (!classroom || classroom.teacher_id !== user.id) notFound()

  // Sincronizar grants antes de la primera carga
  await supabase.rpc('apply_weekly_grants_for_classroom', {
    p_classroom_id: classroomId,
  })

  // Carga inicial completa
  const { data: students } = await supabase
    .from('students')
    .select(
      'id, full_name, hero_class, xp, hearts, max_hearts, mana, max_mana, avatar_config, pending_death'
    )
    .eq('classroom_id', classroomId)
    .order('xp', { ascending: false })

  // Equipos para mostrar tag
  const { data: teamRows } = await supabase
    .from('teams')
    .select('id, name, team_members(student_id)')
    .eq('classroom_id', classroomId)

  const teamByStudent: Record<string, { id: string; name: string }> = {}
  if (teamRows) {
    for (const t of teamRows as Array<{
      id: string
      name: string
      team_members: Array<{ student_id: string }>
    }>) {
      for (const m of t.team_members ?? []) {
        teamByStudent[m.student_id] = { id: t.id, name: t.name }
      }
    }
  }

  return (
    <ProiektatuView
      classroomId={classroom.id}
      classroomName={classroom.name}
      initialStudents={(students ?? []).map((s) => ({
        ...s,
        team: teamByStudent[s.id] ?? null,
      }))}
    />
  )
}
