import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
        <h1 className="panel-title">Zure ikasgelak.</h1>
        <p className="panel-subtitle">
          Sakatu ikasgela bat ikasleak kudeatzeko eta tresnak abiarazteko.
          Tresna guztiak ikasgela bakoitzaren barruan daude.
        </p>
      </section>

      <section className="panel-section">
        <div className="panel-section-header">
          <h2 className="panel-section-title">Ikasgelak</h2>
          <Link href="/panela/ikasgela-berria" className="panel-cta-btn">
            + Ikasgela berria
          </Link>
        </div>

        {hasClassrooms ? (
          <div className="panel-classrooms-grid">
            {classroomList.map((c) => {
              const studentCount = Array.isArray(c.students)
                ? (c.students[0]?.count ?? 0)
                : 0
              return (
                <Link
                  key={c.id}
                  href={`/panela/ikasgela/${c.id}`}
                  className="panel-classroom-card panel-classroom-card-prominent"
                >
                  <div className="panel-classroom-stage">
                    {STAGE_LABELS[c.stage] ?? 'Ikasgela'}
                  </div>
                  <h3>{c.name}</h3>
                  <div className="panel-classroom-card-footer">
                    <p className="panel-classroom-meta">
                      {studentCount === 0
                        ? 'Ikaslerik gabe'
                        : studentCount === 1
                          ? '1 ikasle'
                          : `${studentCount} ikasle`}
                    </p>
                    <span className="panel-classroom-cta">Sartu →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="panel-empty-state panel-empty-state-large">
            <p className="panel-empty-headline">
              Oraindik ez duzu ikasgelarik sortu.
            </p>
            <p className="panel-empty-hint">
              Ikasgela bat sortu zure lehen alumnoak gehitzeko, eta tresna guztiak
              bertan eskuragarri izango dituzu.
            </p>
            <Link href="/panela/ikasgela-berria" className="panel-cta-btn">
              + Lehen ikasgela sortu
            </Link>
          </div>
        )}
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
