import Link from 'next/link'
import MissionMapBackground from './MissionMapBackground'
import type { MissionMapId } from '@/lib/missions/maps'

type Props = {
  missions: Array<{
    id: string
    name: string
    description: string
    background_id: string
  }>
}

export default function StudentMissionsSection({ missions }: Props) {
  return (
    <section className="student-missions-section">
      <h3 className="student-missions-title">🗺️ Zure misioak</h3>
      <p className="student-missions-subtitle">
        Sakatu misio bat mapan abiarazteko.
      </p>
      <div className="student-missions-grid">
        {missions.map((m) => (
          <Link
            key={m.id}
            href={`/ikasle/misioa/${m.id}`}
            className="student-mission-card"
          >
            <div className="student-mission-card-preview">
              <MissionMapBackground mapId={m.background_id as MissionMapId} />
            </div>
            <div className="student-mission-card-body">
              <h4>{m.name}</h4>
              {m.description && <p>{m.description}</p>}
              <span className="student-mission-card-cta">Abiarazi →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
