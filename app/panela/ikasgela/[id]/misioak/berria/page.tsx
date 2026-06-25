import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createMission } from '@/lib/missions/actions'
import { MISSION_MAPS, type MissionMapId } from '@/lib/missions/maps'
import MissionMapBackground from '@/components/missions/MissionMapBackground'

export const dynamic = 'force-dynamic'

export default async function MisioBerriaPage({
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

  async function handleCreate(formData: FormData) {
    'use server'
    const name = String(formData.get('name') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const background_id = String(formData.get('background_id') ?? 'anboto') as MissionMapId
    if (!name) return
    const result = await createMission(classroomId, {
      name,
      description,
      background_id,
    })
    if (result.success) {
      redirect(`/panela/ikasgela/${classroomId}/misioak/${result.mission.id}`)
    }
  }

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <Link
          href={`/panela/ikasgela/${classroomId}/misioak`}
          className="panel-breadcrumb"
        >
          ← Misioak
        </Link>
        <div className="panel-eyebrow">Berria</div>
        <h1 className="panel-title">Misio berria sortu</h1>
        <p className="panel-subtitle">
          Aukeratu izena, deskribapena eta mapa. Geroago gehituko dituzu
          helburuak/nodoak.
        </p>
      </section>

      <form action={handleCreate} className="mission-create-form">
        <div className="form-field">
          <label htmlFor="name">Misioaren izena</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={120}
            placeholder="Adib. Sugaarren aztarnak"
          />
        </div>

        <div className="form-field">
          <label htmlFor="description">Sarrera narratiboa</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Sarrera laburra ikasleek mapan ikusiko dutena. Adib. «Mariren tronu zaharra galdu da. Aurkitu beharko duzu Anboton barrena.»"
          />
        </div>

        <div className="form-field">
          <label>Mapa aukeratu</label>
          <div className="mission-map-picker">
            {MISSION_MAPS.map((map, i) => (
              <label key={map.id} className="mission-map-option">
                <input
                  type="radio"
                  name="background_id"
                  value={map.id}
                  defaultChecked={i === 0}
                />
                <div className="mission-map-option-preview">
                  <MissionMapBackground mapId={map.id} />
                </div>
                <div className="mission-map-option-info">
                  <span className="mission-map-option-name">{map.name}</span>
                  <span className="mission-map-option-desc">
                    {map.description}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <Link
            href={`/panela/ikasgela/${classroomId}/misioak`}
            className="panel-cta-btn-secondary"
          >
            Utzi
          </Link>
          <button type="submit" className="panel-cta-btn">
            Sortu misioa
          </button>
        </div>
      </form>
    </div>
  )
}
