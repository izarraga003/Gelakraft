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

  // Contar alumnos por hero_class para mostrar al profesor si puede generar
  const { data: counts } = await supabase
    .from('students')
    .select('hero_class')
    .eq('classroom_id', id)

  const byClass = { sorgina: 0, lamia: 0, jentila: 0 }
  for (const c of counts ?? []) {
    if (c.hero_class === 'sorgina') byClass.sorgina += 1
    else if (c.hero_class === 'lamia') byClass.lamia += 1
    else if (c.hero_class === 'jentila') byClass.jentila += 1
  }
  const maxTeams = Math.min(byClass.sorgina, byClass.lamia, byClass.jentila)

  const result = await listTeams(id)
  const initialTeams = result.success ? result.teams : []

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <Link href={`/panela/ikasgela/${id}`} className="panel-breadcrumb">
          ← {classroom.name}
        </Link>
        <div className="panel-eyebrow">Taldeak</div>
        <h1 className="panel-title">Taldeak antolatu</h1>
        <p className="panel-subtitle">
          Taldeak automatikoki sortzen dira: talde bakoitzak gutxienez sorgina,
          lamia eta jentila bana izango du.
        </p>
      </section>

      <TeamsManager
        classroomId={id}
        initialTeams={initialTeams}
        countsByClass={byClass}
        maxTeams={maxTeams}
      />
    </div>
  )
}
