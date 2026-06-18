import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { listPendingRequests } from '@/lib/powers/actions'
import RequestsManager from './RequestsManager'

type Params = { id: string }

export default async function RequestsPage({
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

  const result = await listPendingRequests(id)
  const requests = result.success ? result.requests : []

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <Link href={`/panela/ikasgela/${id}`} className="panel-breadcrumb">
          ← {classroom.name}
        </Link>
        <div className="panel-eyebrow">Eskaerak</div>
        <h1 className="panel-title">Botere eskaerak</h1>
        <p className="panel-subtitle">
          Ikasleek bidalitako botereak onartzeko edo ukatzeko. Onartzean,
          klaseari aplikatu beharreko eragina (atsedena, egun gehiago, ezkutua,
          etab.) eskuz gauzatu beharko duzu.
        </p>
      </section>

      <RequestsManager classroomId={id} initialRequests={requests} />
    </div>
  )
}
