import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { listBehaviors } from '@/lib/behaviors/actions'
import { getStudentTeamMap } from '@/lib/teams/actions'
import { countPendingRequests } from '@/lib/powers/actions'
import { listPendingDeaths } from '@/lib/patuak/actions'
import StudentsGrid from './StudentsGrid'
import PendingDeathsPanel from './PendingDeathsPanel'
import {
  FlameIcon,
  SilenceMoonIcon,
  ChestIcon,
  HourglassIcon,
  StopwatchIcon,
  D20Icon,
} from '@/components/icons'

// Forzar renderizado dinámico para que el profe vea siempre valores frescos
// (no quedarse con un snapshot con mana/hearts antiguos).
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
  if (!user) redirect('/saioa-hasi')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name, stage, created_at')
    .eq('id', id)
    .single()
  if (!classroom) notFound()

  // Aplicar grants semanales pendientes a todos los alumnos del aula
  // para que el profe vea valores sincronizados con los del alumno.
  await supabase.rpc('apply_weekly_grants_for_classroom', {
    p_classroom_id: id,
  })

  const { data: students } = await supabase
    .from('students')
    .select(
      'id, full_name, username, password_plain, hero_class, avatar_config, xp, hearts, max_hearts, mana, max_mana, created_at'
    )
    .eq('classroom_id', id)
    .order('full_name', { ascending: true })

  const studentList = students ?? []

  // Cargar behaviors, team_map, pending requests y pending deaths en paralelo
  const [behaviorsResult, teamMap, pendingCount, pendingDeathsResult] = await Promise.all([
    listBehaviors(id),
    getStudentTeamMap(id),
    countPendingRequests(id),
    listPendingDeaths(id),
  ])
  const behaviors = behaviorsResult.success ? behaviorsResult.behaviors : []
  const teamByStudent: Record<string, { teamId: string; teamName: string }> = {}
  teamMap.forEach((info, studentId) => {
    teamByStudent[studentId] = { teamId: info.teamId, teamName: info.teamName }
  })
  const pendingDeaths = pendingDeathsResult.success ? pendingDeathsResult.students : []

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

      {/* Navegación rápida a sub-páginas */}
      {studentList.length > 0 && (
        <section className="classroom-nav">
          <Link
            href={`/panela/ikasgela/${id}/konfiguratu`}
            className="classroom-nav-link"
          >
            <span className="classroom-nav-icon">⚙️</span>
            <span>
              <strong>Klasea konfiguratu</strong>
              <small>
                Ikasleak, sariak, zigorrak, botereak, taldeak, gertaerak…
              </small>
            </span>
          </Link>
          <Link
            href={`/panela/ikasgela/${id}/eskaerak`}
            className={`classroom-nav-link ${pendingCount > 0 ? 'classroom-nav-link-attention' : ''}`}
          >
            <span className="classroom-nav-icon">✨</span>
            <span>
              <strong>
                Botere eskaerak
                {pendingCount > 0 && (
                  <span className="classroom-nav-badge">{pendingCount}</span>
                )}
              </strong>
              <small>Ikasleen botereak onartu edo ukatu</small>
            </span>
          </Link>
          <Link
            href={`/proiektatu/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="classroom-nav-link"
          >
            <span className="classroom-nav-icon">🎥</span>
            <span>
              <strong>Proiektatu</strong>
              <small>Pantaila handian erakusteko bertsioa (klasean)</small>
            </span>
          </Link>
        </section>
      )}

      {/* Patuak pendientes */}
      {pendingDeaths.length > 0 && (
        <PendingDeathsPanel
          classroomId={id}
          students={pendingDeaths}
        />
      )}

      {/* ALUMNOS */}
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
          <StudentsGrid
            students={studentList}
            classroomId={id}
            behaviors={behaviors}
            teamByStudent={teamByStudent}
          />
        )}
      </section>

      {/* HERRAMIENTAS */}
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
              desc="Klasea isilik mantendu Mari ez esnatzeko."
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
              desc="Denbora-mugarekin aritzeko."
            />
            <ToolCard
              href={`/panela/ikasgela/${id}/kronometroa`}
              icon={<StopwatchIcon size={36} />}
              roman="V"
              name="Kronometroa"
              desc="Ariketen denbora neurtu eta markak markatu."
            />
            <ToolCard
              href={`/panela/ikasgela/${id}/hautatzailea`}
              icon={<D20Icon size={36} />}
              roman="VI"
              name="Ausazko hautatzailea"
              desc="Ikasle bat ausaz aukeratu."
            />
          </div>
        </section>
      )}

      <section className="panel-meta">
        <p>
          Ikasleek <strong>gelakraft.eus/ikasle/sartu</strong> helbidean sartu
          behar dute.
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
