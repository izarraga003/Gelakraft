import { HERO_CLASS_LABELS, type HeroClass } from '@/lib/students/hero-class'
import { xpToLevel } from '@/lib/students/level'
import { sanitizeAvatarConfig, type AvatarConfig } from '@/lib/students/avatar'
import AvatarRender from './AvatarRender'

type Member = {
  id: string
  full_name: string
  hero_class: HeroClass
  avatar_config: AvatarConfig
  xp: number
}

type Team = {
  id: string
  name: string
  position: number
  members: Member[]
}

type Props = {
  team: Team | null
  currentStudentId: string
}

export default function MyTeam({ team, currentStudentId }: Props) {
  if (!team) {
    return (
      <section className="my-team-section my-team-empty">
        <header className="student-section-header">
          <h2 className="student-section-title">Nire taldea</h2>
        </header>
        <p className="my-team-empty-text">
          Oraindik ez zaude talde batean. Irakasleak talde-banaketa egitean
          esleitu beharko zaitu.
        </p>
      </section>
    )
  }

  return (
    <section className="my-team-section">
      <header className="student-section-header">
        <h2 className="student-section-title">Nire taldea</h2>
        <span className="my-team-name">{team.name}</span>
      </header>

      <ul className="my-team-members">
        {team.members.map((m) => {
          const isMe = m.id === currentStudentId
          const cfg = sanitizeAvatarConfig(m.avatar_config, 99)
          return (
            <li
              key={m.id}
              className={`my-team-member ${isMe ? 'my-team-member-me' : ''}`}
            >
              <span className="my-team-avatar">
                <AvatarRender config={cfg} size={48} />
              </span>
              <div className="my-team-info">
                <span className="my-team-member-name">
                  {m.full_name}
                  {isMe && <span className="my-team-you"> · zu</span>}
                </span>
                <span className={`student-hero-class hero-${m.hero_class}`}>
                  {HERO_CLASS_LABELS[m.hero_class]}
                </span>
              </div>
              <span className="my-team-level">Mla {xpToLevel(m.xp)}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
