import { relativeTimeEu } from '@/lib/utils/relative-time'

type Activity = {
  id: string
  activity_type: 'battle' | 'silence' | 'event' | 'reward'
  outcome: 'victory' | 'defeat' | 'success' | 'failure' | 'neutral'
  xp_delta: number
  hearts_delta: number
  metadata: Record<string, unknown>
  created_at: string
}

type Props = {
  activities: Activity[]
}

const ACTIVITY_LABELS: Record<Activity['activity_type'], string> = {
  battle: 'Sugaarren aurkako borroka',
  silence: 'Mariren isiltasun-erronka',
  event: 'Ustekabeko gertaera',
  reward: 'Saria',
}

const ACTIVITY_ICONS: Record<Activity['activity_type'], string> = {
  battle: '⚔️',
  silence: '🌙',
  event: '📜',
  reward: '🎁',
}

const OUTCOME_LABELS: Record<Activity['outcome'], string> = {
  victory: 'Garaipena',
  defeat: 'Galera',
  success: 'Lortu da',
  failure: 'Huts egin da',
  neutral: 'Egin da',
}

export default function ActivityLog({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <section className="activity-section">
        <header className="student-section-header">
          <h2 className="student-section-title">Azken jarduerak</h2>
        </header>
        <div className="activity-empty">
          <p>Oraindik ez da jardueratik. Lehen batailak laster etorriko dira.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="activity-section">
      <header className="student-section-header">
        <h2 className="student-section-title">Azken jarduerak</h2>
        <span className="activity-count">{activities.length} jarduera</span>
      </header>

      <ol className="activity-list">
        {activities.map((a) => {
          const isPositive =
            a.outcome === 'victory' || a.outcome === 'success'
          const isNegative =
            a.outcome === 'defeat' || a.outcome === 'failure'

          return (
            <li
              key={a.id}
              className={`activity-item ${
                isPositive
                  ? 'activity-item-positive'
                  : isNegative
                    ? 'activity-item-negative'
                    : ''
              }`}
            >
              <span className="activity-icon" aria-hidden="true">
                {ACTIVITY_ICONS[a.activity_type]}
              </span>
              <div className="activity-info">
                <span className="activity-title">
                  {ACTIVITY_LABELS[a.activity_type]}
                </span>
                <span className="activity-outcome">
                  {OUTCOME_LABELS[a.outcome]}
                  <span className="activity-time">
                    {' · '}
                    {relativeTimeEu(a.created_at)}
                  </span>
                </span>
              </div>
              <div className="activity-deltas">
                {a.xp_delta !== 0 && (
                  <span
                    className={`activity-delta ${
                      a.xp_delta > 0 ? 'delta-positive' : 'delta-negative'
                    }`}
                  >
                    {a.xp_delta > 0 ? '+' : ''}
                    {a.xp_delta} XP
                  </span>
                )}
                {a.hearts_delta !== 0 && (
                  <span
                    className={`activity-delta ${
                      a.hearts_delta > 0 ? 'delta-positive' : 'delta-negative'
                    }`}
                  >
                    {a.hearts_delta > 0 ? '+' : ''}
                    {a.hearts_delta} ♥
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
