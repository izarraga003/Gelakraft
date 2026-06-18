import { HERO_CLASS_LABELS, type HeroClass } from '@/lib/students/hero-class'
import { xpToLevel } from '@/lib/students/level'

type RankingEntry = {
  id: string
  full_name: string
  avatar: string
  hero_class: HeroClass
  xp: number
  hearts: number
  max_hearts: number
}

type Props = {
  ranking: RankingEntry[]
  currentStudentId: string
  position: number
}

export default function ClassroomRanking({
  ranking,
  currentStudentId,
  position,
}: Props) {
  if (ranking.length === 0) {
    return null
  }

  const top10 = ranking.slice(0, 10)
  const meInTop10 = top10.some((r) => r.id === currentStudentId)
  const me = ranking.find((r) => r.id === currentStudentId)

  return (
    <section className="ranking-section">
      <header className="student-section-header">
        <h2 className="student-section-title">Ikasgelaren sailkapena</h2>
        {!meInTop10 && me && (
          <span className="ranking-my-pos">
            Zure posizioa: <strong>{position}</strong>
          </span>
        )}
      </header>

      <ol className="ranking-list">
        {top10.map((entry, idx) => {
          const isMe = entry.id === currentStudentId
          const place = idx + 1
          const medal =
            place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : null
          return (
            <li
              key={entry.id}
              className={`ranking-item ${isMe ? 'ranking-item-me' : ''}`}
            >
              <span className="ranking-place">
                {medal ?? `#${place}`}
              </span>
              <span className="ranking-avatar" aria-hidden="true">
                {entry.avatar}
              </span>
              <div className="ranking-info">
                <span className="ranking-name">
                  {entry.full_name}
                  {isMe && <span className="ranking-you"> · zu</span>}
                </span>
                <span className="ranking-meta">
                  {HERO_CLASS_LABELS[entry.hero_class]} · Maila{' '}
                  {xpToLevel(entry.xp)}
                </span>
              </div>
              <span className="ranking-xp">
                <span className="ranking-xp-value">{entry.xp}</span>
                <span className="ranking-xp-label">XP</span>
              </span>
            </li>
          )
        })}

        {/* Si el alumno no está en top 10, mostrarlo destacado al final */}
        {!meInTop10 && me && (
          <>
            <li className="ranking-divider" aria-hidden="true">
              ⋯
            </li>
            <li className="ranking-item ranking-item-me">
              <span className="ranking-place">#{position}</span>
              <span className="ranking-avatar" aria-hidden="true">
                {me.avatar}
              </span>
              <div className="ranking-info">
                <span className="ranking-name">
                  {me.full_name}
                  <span className="ranking-you"> · zu</span>
                </span>
                <span className="ranking-meta">
                  {HERO_CLASS_LABELS[me.hero_class]} · Maila {xpToLevel(me.xp)}
                </span>
              </div>
              <span className="ranking-xp">
                <span className="ranking-xp-value">{me.xp}</span>
                <span className="ranking-xp-label">XP</span>
              </span>
            </li>
          </>
        )}
      </ol>
    </section>
  )
}
