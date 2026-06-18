import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StudentsGrid from './StudentsGrid'
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
      'id, full_name, username, password_plain, hero_class, avatar_config, xp, hearts, max_hearts, mana, max_mana, created_at'
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

      {/* SECCIÓN 1: ALUMNOS (ARRIBA) */}
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
          <StudentsGrid students={studentList} classroomId={id} />
        )}
      </section>

      {/* SECCIÓN 2: HERRAMIENTAS (DEBAJO) */}
      {studentList.length > 0 && (
        <section className="panel-section">
          <div className="panel-section-header">
            <h2 className="panel-section-title">Tresnak</h2>
          </div>
          <div className="classroom-tools-grid">
            <ToolCard
              href={`/panela/ikasgela/${id}/borroka`}
              icon={<FlameIcon size={36} />}
              roman="I"
              name="Sugaarren aurkako borroka"
              desc="Galderak ahoz egin eta klasea Sugaarren aurka borrokatu."
            />
            <ToolCard
              href={`/panela/ikasgela/${id}/isiltasuna`}
              icon={<SilenceMoonIcon size={36} />}
              roman="II"
              name="Mariren isiltasun-erronka"
              desc="Klasea isilik mantendu Mari ez esnatzeko. Zarata-maila neurtzen da."
            />
            <ToolCard
              href={`/panela/ikasgela/${id}/ustekabekoa`}
              icon={<ChestIcon size={36} />}
              roman="III"
              name="Ustekabeko gertaera"
              desc="Mariren laino artean ezkutatutako gertaera bat aurkitu."
            />
            <ToolCard
              href={`/panela/ikasgela/${id}/kontaketa`}
              icon={<HourglassIcon size={36} />}
              roman="IV"
              name="Atzerako kontaketa"
              desc="Denbora-mugarekin aritzeko cuenta atrás bisuala."
            />
            <ToolCard
              href={`/panela/ikasgela/${id}/kronometroa`}
              icon={<StopwatchIcon size={36} />}
              roman="V"
              name="Kronometroa"
              desc="Ariketen denbora neurtu, markak markatu."
            />
            <ToolCard
              href={`/panela/ikasgela/${id}/hautatzailea`}
              icon={<D20Icon size={36} />}
              roman="VI"
              name="Ausazko hautatzailea"
              desc="Ikasle bat ausaz aukeratzeko sistema."
            />
          </div>
        </section>
      )}

      <section className="panel-meta">
        <p>
          Ikasleek beren erabiltzaile-izena eta pasahitzarekin sartuko dira{' '}
          <strong>gelakraft.eus/ikasle/sartu</strong> helbidean.
        </p>
      </section>
    </div>
  )
}

function ToolCard({
  href,
  icon,
  roman,
  name,
  desc,
}: {
  href: string
  icon: React.ReactNode
  roman: string
  name: string
  desc: string
}) {
  return (
    <Link href={href} className="classroom-tool-card classroom-tool-active">
      <div className="classroom-tool-icon">{icon}</div>
      <div className="classroom-tool-roman">{roman}</div>
      <h3 className="classroom-tool-name">{name}</h3>
      <p className="classroom-tool-desc">{desc}</p>
      <span className="classroom-tool-cta">Hasi →</span>
    </Link>
  )
}
