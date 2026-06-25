import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { listMissions } from '@/lib/missions/actions'
import { getMissionMap } from '@/lib/missions/maps'
import EmptyState from '@/components/ui/EmptyState'
import MissionMapBackground from '@/components/missions/MissionMapBackground'

export const dynamic = 'force-dynamic'

export default async function MisioakPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: classroomId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/saioa-hasi')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name, teacher_id')
    .eq('id', classroomId)
    .single()
  if (!classroom || classroom.teacher_id !== user.id) notFound()

  const { missions, nodeCounts } = await listMissions(classroomId)

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <Link href={`/panela/ikasgela/${classroomId}`} className="panel-breadcrumb">
          ← {classroom.name}
        </Link>
        <div className="panel-eyebrow">Abentura</div>
        <h1 className="panel-title">Misioak</h1>
        <p className="panel-subtitle">
          Sortu ikasleentzako abentura mapak: helburu bakoitza ariketa edo
          erronka bat, sariekin eta zigorrekin. Ikasleek banaka aurreratzen
          dute, mapako nodoetan zehar.
        </p>
      </section>

      <section className="panel-section">
        <div className="panel-section-header">
          <h2 className="panel-section-title">Zure misioak</h2>
          <Link
            href={`/panela/ikasgela/${classroomId}/misioak/berria`}
            className="panel-cta-btn"
          >
            + Misio berria
          </Link>
        </div>

        {missions.length === 0 ? (
          <EmptyState
            variant="events"
            title="Oraindik ez duzu misiorik sortu."
            description="Misio bat sortu, mapa bat aukeratu eta helburuak gehitu. Ikasleek mapan zehar aurreratuko dira."
            action={
              <Link
                href={`/panela/ikasgela/${classroomId}/misioak/berria`}
                className="panel-cta-btn"
              >
                + Lehen misioa sortu
              </Link>
            }
          />
        ) : (
          <div className="missions-grid">
            {missions.map((m) => {
              const map = getMissionMap(m.background_id)
              const count = nodeCounts[m.id] ?? 0
              return (
                <Link
                  key={m.id}
                  href={`/panela/ikasgela/${classroomId}/misioak/${m.id}`}
                  className={`mission-card ${!m.is_active ? 'mission-card-inactive' : ''}`}
                >
                  <div className="mission-card-preview">
                    <MissionMapBackground mapId={m.background_id} />
                    {!m.is_active && (
                      <span className="mission-card-inactive-tag">Ezkutatuta</span>
                    )}
                  </div>
                  <div className="mission-card-body">
                    <h3 className="mission-card-name">{m.name}</h3>
                    {m.description && (
                      <p className="mission-card-desc">{m.description}</p>
                    )}
                    <div className="mission-card-meta">
                      <span>🗺️ {map.name}</span>
                      <span>📍 {count} helburu</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
