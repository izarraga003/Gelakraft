import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { countPendingReviewsByClassroom } from '@/lib/missions/extra-actions'
import EmptyState from '@/components/ui/EmptyState'

export const dynamic = 'force-dynamic'

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
  const classroomIds = classroomList.map((c) => c.id)

  // Conteos pendientes: power_requests + patuak + misioak revisar
  const pendingByClassroom: Record<string, number> = {}

  if (classroomIds.length > 0) {
    const { data: pendingPowers } = await supabase
      .from('power_requests')
      .select('classroom_id')
      .in('classroom_id', classroomIds)
      .eq('status', 'pending')
    if (pendingPowers) {
      for (const row of pendingPowers) {
        pendingByClassroom[row.classroom_id] =
          (pendingByClassroom[row.classroom_id] ?? 0) + 1
      }
    }

    const { data: pendingDeath } = await supabase
      .from('students')
      .select('classroom_id')
      .in('classroom_id', classroomIds)
      .eq('pending_death', true)
    if (pendingDeath) {
      for (const row of pendingDeath) {
        pendingByClassroom[row.classroom_id] =
          (pendingByClassroom[row.classroom_id] ?? 0) + 1
      }
    }

    // Misiones: revisiones pendientes por aula
    const missionsReviews = await countPendingReviewsByClassroom(classroomIds)
    for (const [cId, count] of Object.entries(missionsReviews)) {
      pendingByClassroom[cId] = (pendingByClassroom[cId] ?? 0) + count
    }
  }

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
              const pending = pendingByClassroom[c.id] ?? 0
              return (
                <Link
                  key={c.id}
                  href={`/panela/ikasgela/${c.id}`}
                  className="panel-classroom-card panel-classroom-card-prominent"
                >
                  <div className="panel-classroom-stage-row">
                    <div className="panel-classroom-stage">
                      {STAGE_LABELS[c.stage] ?? 'Ikasgela'}
                    </div>
                    {pending > 0 && (
                      <span
                        className="panel-classroom-pending"
                        title={`${pending} zain dagoen ekintza`}
                      >
                        {pending} zain
                      </span>
                    )}
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
          <EmptyState
            variant="students"
            title="Oraindik ez duzu ikasgelarik sortu."
            description="Ikasgela bat sortu zure lehen alumnoak gehitzeko, eta tresna guztiak bertan eskuragarri izango dituzu."
            action={
              <Link href="/panela/ikasgela-berria" className="panel-cta-btn">
                + Lehen ikasgela sortu
              </Link>
            }
          />
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
