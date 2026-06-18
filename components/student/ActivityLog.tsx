'use client'

import { useState } from 'react'
import { relativeTimeEu } from '@/lib/utils/relative-time'

type Activity = {
  id: string
  activity_type: 'battle' | 'silence' | 'event' | 'reward' | 'adjustment' | 'power_used'
  outcome: 'victory' | 'defeat' | 'success' | 'failure' | 'neutral'
  xp_delta: number
  hearts_delta: number
  metadata: Record<string, unknown>
  created_at: string
  is_personal: boolean
  affected_count: number | null
}

type Props = {
  activities: Activity[]
}

const ACTIVITY_LABELS: Record<Activity['activity_type'], string> = {
  battle: 'Sugaarren aurkako borroka',
  silence: 'Mariren isiltasun-erronka',
  event: 'Ustekabeko gertaera',
  reward: 'Saria',
  adjustment: 'Irakaslearen doiketa',
  power_used: 'Poderea erabilita',
}

const ACTIVITY_ICONS: Record<Activity['activity_type'], string> = {
  battle: '⚔️',
  silence: '🌙',
  event: '📜',
  reward: '🎁',
  adjustment: '✋',
  power_used: '✨',
}

const OUTCOME_LABELS: Record<Activity['outcome'], string> = {
  victory: 'Garaipena',
  defeat: 'Galera',
  success: 'Lortu da',
  failure: 'Huts egin da',
  neutral: 'Egin da',
}

type Filter = 'all' | 'personal' | 'classroom'

export default function ActivityLog({ activities }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = activities.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'personal') return a.is_personal
    return !a.is_personal
  })

  return (
    <section className="activity-section">
      <header className="student-section-header">
        <h2 className="student-section-title">Jarduera-historia</h2>
        <span className="activity-count">{activities.length} jarduera</span>
      </header>

      <div className="activity-filters" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          className={`activity-filter ${filter === 'all' ? 'activity-filter-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Dena
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'personal'}
          className={`activity-filter ${filter === 'personal' ? 'activity-filter-active' : ''}`}
          onClick={() => setFilter('personal')}
        >
          Niretzat
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'classroom'}
          className={`activity-filter ${filter === 'classroom' ? 'activity-filter-active' : ''}`}
          onClick={() => setFilter('classroom')}
        >
          Ikasgelarena
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="activity-empty">
          <p>Iragazki honetan ez dago jarduerarik.</p>
        </div>
      ) : (
        <ol className="activity-list">
          {filtered.map((a) => {
            const isPositive = a.outcome === 'victory' || a.outcome === 'success'
            const isNegative = a.outcome === 'defeat' || a.outcome === 'failure'
            const note =
              (a.metadata?.note as string | undefined) ||
              (a.metadata?.power_name as string | undefined) ||
              null
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
                    {note || ACTIVITY_LABELS[a.activity_type]}
                    <span
                      className={`activity-scope ${
                        a.is_personal ? 'activity-scope-personal' : 'activity-scope-class'
                      }`}
                    >
                      {a.is_personal ? '👤 Niretzat' : '🏛️ Aula'}
                    </span>
                  </span>
                  <span className="activity-outcome">
                    {note ? ACTIVITY_LABELS[a.activity_type] : OUTCOME_LABELS[a.outcome]}
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
      )}
    </section>
  )
}
