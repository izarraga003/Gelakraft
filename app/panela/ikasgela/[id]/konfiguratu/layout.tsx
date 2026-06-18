import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import KonfiguratuSidebar from './KonfiguratuSidebar'

type Params = { id: string }

export default async function KonfiguratuLayout({
  children,
  params,
}: {
  children: React.ReactNode
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

  return (
    <div className="panel-content konfiguratu-content">
      <header className="konfiguratu-header">
        <Link href={`/panela/ikasgela/${id}`} className="panel-breadcrumb">
          ← {classroom.name}
        </Link>
        <h1 className="konfiguratu-title">{classroom.name}: klasea konfiguratu</h1>
      </header>

      <div className="konfiguratu-layout">
        <KonfiguratuSidebar classroomId={id} />
        <main className="konfiguratu-main">{children}</main>
      </div>
    </div>
  )
}
