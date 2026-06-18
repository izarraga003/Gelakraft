import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { listTeams } from '@/lib/teams/actions'
import TeamsManager from './TeamsManager'

type Params = { id: string }

export default async function TeamsPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/saioa-hasi')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('id', id)
    .single()
  if (!classroom) notFound()

  const { data: studentsRaw } = await supabase
    .from('students')
    .select('id, full_name, hero_class, avatar_config, xp')
    .eq('classroom_id', id)
    .order('full_name', { ascending: true })

  const allStudents = (studentsRaw ?? []) as Array<{
    id: string
    full_name: string
    hero_class: 'sorgina' | 'lamia' | 'jentila'
    avatar_config: Record<string, unknown>
    xp: number
  }>

  const result = await listTeams(id)
  const initialTeams = result.success ? result.teams : []

  // Calcular los alumnos sin equipo
  const assignedIds = new Set<string>()
  initialTeams.forEach((t) => t.members.forEach((m) => assignedIds.add(m.id)))
  const unassigned = allStudents.filter((s) => !assignedIds.has(s.id))

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <Link href={`/panela/ikasgela/${id}`} className="panel-breadcrumb">
          ← {classroom.name}
        </Link>
        <div className="panel-eyebrow">Taldeak</div>
        <h1 className="panel-title">Taldeak antolatu</h1>
        <p className="panel-subtitle">
          Taldeak eskuz sortu eta ikasleak banatu. Talde berriko izena hautatu
          eta ikasleak goitibeherako menutik mugitu.
        </p>
      </section>

      <TeamsManager
        classroomId={id}
        initialTeams={initialTeams}
        initialUnassigned={unassigned}
      />
    </div>
  )
}
