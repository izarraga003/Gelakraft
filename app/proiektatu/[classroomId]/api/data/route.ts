import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  const { classroomId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  }

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('teacher_id')
    .eq('id', classroomId)
    .single()
  if (!classroom || classroom.teacher_id !== user.id) {
    return NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 })
  }

  await supabase.rpc('apply_weekly_grants_for_classroom', {
    p_classroom_id: classroomId,
  })

  const { data: students } = await supabase
    .from('students')
    .select(
      'id, full_name, hero_class, xp, hearts, max_hearts, mana, max_mana, avatar_config, pending_death'
    )
    .eq('classroom_id', classroomId)
    .order('xp', { ascending: false })

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

  return NextResponse.json({
    success: true,
    students: (students ?? []).map((s) => ({
      ...s,
      team: teamByStudent[s.id] ?? null,
    })),
  })
}
