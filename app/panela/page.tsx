import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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

export default async function PanelPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Lista de ikasgelak con conteo de alumnos
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('id, name, stage, created_at, students(count)')
    .order('created_at', { ascending: false })

  const classroomList = classrooms ?? []
  const hasClassrooms = classroomList.length > 0

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <div className="panel-eyebrow">Ongi etorri</div>
        <h1 className="panel-title">Zure kobazulora sartu zara.</h1>
        <p className="panel-subtitle">
          Hau zure kontrol-panela da. Hemendik kudeatuko dituzu zure ikasgelak,
          ikasleak eta tresnak.
        </p>
      </section>

      <section className="panel-section">
        <div className="panel-section-header">
          <h2 className="panel-section-title">Zure ikasgelak</h2>
          <Link href="/panela/ikasgela-berria" className="panel-cta-btn">
            + Ikasgela berria
          </Link>
        </div>

        {hasClassrooms ? (
          <div className="panel-classrooms-grid">
            {classroomList.map((c) => {
              // Supabase devuelve el count como un array con un objeto {count: N}
              const studentCount = Array.isArray(c.students)
                ? (c.students[0]?.count ?? 0)
                : 0
              return (
                <Link
                  key={c.id}
                  href={`/panela/ikasgela/${c.id}`}
                  className="panel-classroom-card"
                >
                  <div className="panel-classroom-stage">
                    {STAGE_LABELS[c.stage] ?? 'Ikasgela'}
                  </div>
                  <h3>{c.name}</h3>
                  <p className="panel-classroom-meta">
                    {studentCount === 0
                      ? 'Ikaslerik gabe'
                      : studentCount === 1
                        ? '1 ikasle'
                        : `${studentCount} ikasle`}
                  </p>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="panel-empty-state">
            <p>Oraindik ez duzu ikasgelarik sortu.</p>
            <p className="panel-empty-hint">
              Sakatu &laquo;Ikasgela berria&raquo; zure lehen ikasgela sortzeko.
            </p>
          </div>
        )}
      </section>

      <section className="panel-section">
        <div className="panel-section-header">
          <h2 className="panel-section-title">Tresnak</h2>
          <span className="panel-section-hint">Datozen astetan eskuragarri</span>
        </div>

        <div className="panel-tools-grid">
          <PanelToolPlaceholder
            roman="I"
            name="Sugaarren aurkako borroka"
            icon={<FlameIcon size={32} />}
          />
          <PanelToolPlaceholder
            roman="II"
            name="Mariren isiltasun-erronka"
            icon={<SilenceMoonIcon size={32} />}
          />
          <PanelToolPlaceholder
            roman="III"
            name="Ustekabeko gertaera"
            icon={<ChestIcon size={32} />}
          />
          <PanelToolPlaceholder
            roman="IV"
            name="Atzerako kontaketa"
            icon={<HourglassIcon size={32} />}
          />
          <PanelToolPlaceholder
            roman="V"
            name="Kronometroa"
            icon={<StopwatchIcon size={32} />}
          />
          <PanelToolPlaceholder
            roman="VI"
            name="Ausazko hautatzailea"
            icon={<D20Icon size={32} />}
          />
        </div>
      </section>

      <section className="panel-meta">
        <p>
          Zure ikasleak hemen sartuko dira:{' '}
          <strong>gelakraft.eus/ikasle/sartu</strong> — beren erabiltzailea eta
          pasahitzarekin.
        </p>
      </section>
    </div>
  )
}

function PanelToolPlaceholder({
  roman,
  name,
  icon,
}: {
  roman: string
  name: string
  icon: React.ReactNode
}) {
  return (
    <article className="panel-tool-card">
      <div className="panel-tool-header">
        <span className="panel-tool-icon">{icon}</span>
        <span className="panel-tool-roman">{roman}</span>
      </div>
      <h3 className="panel-tool-name">{name}</h3>
      <span className="panel-soon-badge">laster</span>
    </article>
  )
}
