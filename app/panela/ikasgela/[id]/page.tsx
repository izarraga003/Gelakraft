import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StudentsTable from './StudentsTable'
import {
  FlameIcon,
  SilenceMoonIcon,
  ChestIcon,
  HourglassIcon,
  StopwatchIcon,
  D20Icon,
} from '@/components/icons'

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

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name, stage, created_at')
    .eq('id', id)
    .single()

  if (!classroom) {
    notFound()
  }

  const { data: students } = await supabase
    .from('students')
    .select(
      'id, full_name, username, password_plain, hero_class, xp, hearts, max_hearts, mana, max_mana, created_at'
    )
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

      {/* Tools section: 4 herramientas activas */}
      {studentList.length > 0 && (
        <section className="panel-section">
          <div className="panel-section-header">
            <h2 className="panel-section-title">Tresnak</h2>
          </div>
          <div className="classroom-tools-grid">
            <Link
              href={`/panela/ikasgela/${id}/borroka`}
              className="classroom-tool-card classroom-tool-active"
            >
              <div className="classroom-tool-icon">
                <FlameIcon size={36} />
              </div>
              <div className="classroom-tool-roman">I</div>
              <h3 className="classroom-tool-name">Sugaarren aurkako borroka</h3>
              <p className="classroom-tool-desc">
                Galderak ahoz egin eta klasea Sugaarren aurka borrokatu.
              </p>
              <span className="classroom-tool-cta">Hasi →</span>
            </Link>

            <Link
              href={`/panela/ikasgela/${id}/isiltasuna`}
              className="classroom-tool-card classroom-tool-active"
            >
              <div className="classroom-tool-icon">
                <SilenceMoonIcon size={36} />
              </div>
              <div className="classroom-tool-roman">II</div>
              <h3 className="classroom-tool-name">Mariren isiltasun-erronka</h3>
              <p className="classroom-tool-desc">
                Klasea isilik mantendu Mari ez esnatzeko. Zarata-maila neurtzen da.
              </p>
              <span className="classroom-tool-cta">Hasi →</span>
            </Link>

            <Link
              href={`/panela/ikasgela/${id}/ustekabekoa`}
              className="classroom-tool-card classroom-tool-active"
            >
              <div className="classroom-tool-icon">
                <ChestIcon size={36} />
              </div>
              <div className="classroom-tool-roman">III</div>
              <h3 className="classroom-tool-name">Ustekabeko gertaera</h3>
              <p className="classroom-tool-desc">
                Mariren laino artean ezkutatutako gertaera bat aurkitu. Sorta editagarria.
              </p>
              <span className="classroom-tool-cta">Aurkitu →</span>
            </Link>

            <Link
              href={`/panela/ikasgela/${id}/kontaketa`}
              className="classroom-tool-card classroom-tool-active"
            >
              <div className="classroom-tool-icon">
                <HourglassIcon size={36} />
              </div>
              <div className="classroom-tool-roman">IV</div>
              <h3 className="classroom-tool-name">Atzerako kontaketa</h3>
              <p className="classroom-tool-desc">
                Denbora-mugarekin aritzeko cuenta atrás bisuala.
              </p>
              <span className="classroom-tool-cta">Hasi →</span>
            </Link>

            <Link
              href={`/panela/ikasgela/${id}/kronometroa`}
              className="classroom-tool-card classroom-tool-active"
            >
              <div className="classroom-tool-icon">
                <StopwatchIcon size={36} />
              </div>
              <div className="classroom-tool-roman">V</div>
              <h3 className="classroom-tool-name">Kronometroa</h3>
              <p className="classroom-tool-desc">
                Ariketen denbora neurtu, itzalpeak markatu.
              </p>
              <span className="classroom-tool-cta">Hasi →</span>
            </Link>

            <Link
              href={`/panela/ikasgela/${id}/hautatzailea`}
              className="classroom-tool-card classroom-tool-active"
            >
              <div className="classroom-tool-icon">
                <D20Icon size={36} />
              </div>
              <div className="classroom-tool-roman">VI</div>
              <h3 className="classroom-tool-name">Ausazko hautatzailea</h3>
              <p className="classroom-tool-desc">
                Ikasle bat ausaz aukeratzeko sistema.
              </p>
              <span className="classroom-tool-cta">Hasi →</span>
            </Link>
          </div>
        </section>
      )}

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
