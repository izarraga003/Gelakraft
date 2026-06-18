import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { listBehaviors } from '@/lib/behaviors/actions'
import BehaviorsEditor from './BehaviorsEditor'

type Params = { id: string }

export default async function BehaviorsPage({
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

  const result = await listBehaviors(id)
  const initialBehaviors = result.success ? result.behaviors : []

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <Link href={`/panela/ikasgela/${id}`} className="panel-breadcrumb">
          ← {classroom.name}
        </Link>
        <div className="panel-eyebrow">Konfigurazioa</div>
        <h1 className="panel-title">Jokabideak</h1>
        <p className="panel-subtitle">
          Konfigura itzazu ikasleek lor ditzaketen sariak eta aplikatuko zaizkien
          abisuak. Jokabide bakoitzak XP edo bihotzak gehitu edo kentzen ditu.
        </p>
      </section>

      <BehaviorsEditor classroomId={id} initial={initialBehaviors} />
    </div>
  )
}
