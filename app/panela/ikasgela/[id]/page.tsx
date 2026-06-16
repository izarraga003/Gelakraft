import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StudentsTable from './StudentsTable'

const STAGE_LABELS: Record<string, string> = {
  lehen: 'Lehen Hezkuntza',
  dbh: 'DBH',
  batxilergoa: 'Batxilergoa',
  lh: 'Lanbide Heziketa',
  unibertsitatea: 'Unibertsitatea',
  beste: 'Beste bat',
}

type Params = { id: string }

export default async function ClassroomDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/saioa-hasi')
  }

  // Carga la ikasgela (RLS filtra automáticamente)
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name, stage, created_at')
    .eq('id', id)
    .single()

  if (!classroom) {
    notFound()
  }

  // Carga los alumnos de esta ikasgela (RLS filtra)
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, username, password_plain, created_at')
    .eq('classroom_id', id)
    .order('full_name', { ascending: true })

  const studentList = students ?? []

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <Link href="/panela" className="panel-breadcrumb">
          ← Panela
        </Link>
        <div className="panel-eyebrow">{STAGE_LABELS[classroom.stage] ?? 'Ikasgela'}</div>
        <h1 className="panel-title">{classroom.name}</h1>
        <p className="panel-subtitle">
          {studentList.length === 0
            ? 'Oraindik ez duzu ikaslerik gehitu ikasgela honetan.'
            : `${studentList.length} ikasle.`}
        </p>
      </section>

      <section className="panel-section">
        <div className="panel-section-header">
          <h2 className="panel-section-title">Ikasleak</h2>
          <Link
            href={`/panela/ikasgela/${id}/ikasle-berria`}
            className="panel-cta-btn"
          >
            + Ikasleak gehitu
          </Link>
        </div>

        {studentList.length === 0 ? (
          <div className="panel-empty-state">
            <p>Ez dago ikaslerik oraindik.</p>
            <p className="panel-empty-hint">
              Sakatu &laquo;Ikasleak gehitu&raquo; izenen zerrenda bat itsasteko.
            </p>
          </div>
        ) : (
          <StudentsTable students={studentList} classroomId={id} />
        )}
      </section>

      <section className="panel-meta">
        <p>
          Ikasleek beren erabiltzaile-izena eta pasahitzarekin sartuko dira{' '}
          <strong>gelakraft.eus/ikasle/sartu</strong> helbidean.
        </p>
      </section>
    </div>
  )
}
