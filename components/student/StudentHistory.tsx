'use client'

import { useEffect, useState } from 'react'
import {
  getStudentHistory,
  type HistoryEntry,
} from '@/lib/students/history'

type Props = {
  studentId: string
  studentName: string
}

type Filter = 'all' | 'reward' | 'punishment' | 'battle' | 'event' | 'silence' | 'power' | 'patua' | 'adjustment'

const FILTERS: { id: Filter; label: string; icon: string }[] = [
  { id: 'all', label: 'Dena', icon: '📜' },
  { id: 'reward', label: 'Sariak', icon: '👍' },
  { id: 'punishment', label: 'Zigorrak', icon: '⚠️' },
  { id: 'battle', label: 'Borrokak', icon: '🐉' },
  { id: 'event', label: 'Gertaerak', icon: '🌌' },
  { id: 'silence', label: 'Isiltasun', icon: '🌙' },
  { id: 'power', label: 'Botereak', icon: '✨' },
  { id: 'patua', label: 'Patuak', icon: '🎲' },
]

function relativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'oraintxe'
  if (diffMin < 60) return `duela ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `duela ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `duela ${diffD} egun`
  // Mostrar fecha completa
  return d.toLocaleDateString('eu-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleString('eu-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function describeEntry(e: HistoryEntry): { icon: string; title: string; sub: string } {
  const m = e.metadata as Record<string, unknown>
  const note = m.note as string | undefined
  const power = m.power_name as string | undefined
  const patua = m.patua as string | undefined

  if (e.activity_type === 'battle') {
    return {
      icon: e.outcome === 'victory' ? '⚔️' : e.outcome === 'defeat' ? '💔' : '⚖️',
      title:
        e.outcome === 'victory'
          ? 'Sugaarren borroka — Garaipena'
          : e.outcome === 'defeat'
          ? 'Sugaarren borroka — Galera'
          : 'Sugaarren borroka — Berdinketa',
      sub: 'Klasea',
    }
  }
  if (e.activity_type === 'silence') {
    return {
      icon: '🌙',
      title:
        e.outcome === 'success'
          ? 'Mariren isiltasun-erronka lortuta'
          : 'Mariren isiltasun-erronka hutsegitea',
      sub: 'Klasea',
    }
  }
  if (e.activity_type === 'event') {
    const title = (m.event_title as string) ?? 'Ustekabeko gertaera'
    return { icon: '🌌', title, sub: 'Klasea' }
  }
  if (m.kind === 'death_sentence' || patua) {
    return {
      icon: '🎲',
      title: 'Patua exekutatuta',
      sub: patua ?? 'Mariren erronka',
    }
  }
  if (m.kind === 'power_used') {
    return {
      icon: '✨',
      title: power ?? 'Boterea erabilita',
      sub: 'Automatiko aplikatuta',
    }
  }
  if (m.kind === 'power_request') {
    return {
      icon: '✨',
      title: power ?? 'Botere eskaera',
      sub: 'Onartuta',
    }
  }
  if (e.activity_type === 'adjustment') {
    return {
      icon: e.xp_delta > 0 || e.hearts_delta > 0 ? '👍' : '⚠️',
      title: note ?? 'Doiketa',
      sub: e.scope === 'individual' ? 'Banakakoa' : 'Klasea',
    }
  }
  if (e.activity_type === 'reward') {
    return {
      icon: '🎁',
      title: note ?? 'Saria',
      sub: e.scope === 'individual' ? 'Banakakoa' : 'Klasea',
    }
  }
  return {
    icon: '•',
    title: note ?? 'Ekintza',
    sub: '',
  }
}

export default function StudentHistory({ studentId, studentName }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const result = await getStudentHistory(studentId, { kind: filter })
      if (cancelled) return
      setLoading(false)
      if (!result.success) {
        setError(result.error)
        return
      }
      setEntries(result.entries)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [studentId, filter])

  // Stats agregadas
  const totalXp = entries.reduce((acc, e) => acc + e.xp_delta, 0)
  const totalHearts = entries.reduce((acc, e) => acc + e.hearts_delta, 0)

  return (
    <div className="history-tab">
      <header className="history-header">
        <div>
          <h3 className="history-title">{studentName}-ren historiala</h3>
          <p className="history-stats">
            <span className={totalXp >= 0 ? 'history-stat-pos' : 'history-stat-neg'}>
              {totalXp >= 0 ? '+' : ''}{totalXp} XP
            </span>
            <span className={totalHearts >= 0 ? 'history-stat-pos' : 'history-stat-neg'}>
              {totalHearts >= 0 ? '+' : ''}{totalHearts} ❤
            </span>
            <span className="history-stat-count">{entries.length} ekintza</span>
          </p>
        </div>
      </header>

      <div className="history-filters" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`history-filter ${filter === f.id ? 'history-filter-active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            <span className="history-filter-icon" aria-hidden="true">{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="behaviors-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="history-loading">Kargatzen…</p>
      ) : entries.length === 0 ? (
        <p className="history-empty">
          {filter === 'all'
            ? 'Oraindik ez dago ekintzarik erregistratuta.'
            : 'Ez dago mota honetako ekintzarik.'}
        </p>
      ) : (
        <ul className="history-list">
          {entries.map((e) => {
            const desc = describeEntry(e)
            return (
              <li
                key={e.id}
                className={`history-item history-item-${
                  e.xp_delta > 0 || e.hearts_delta > 0
                    ? 'pos'
                    : e.xp_delta < 0 || e.hearts_delta < 0
                    ? 'neg'
                    : 'neutral'
                }`}
              >
                <span className="history-item-icon" aria-hidden="true">{desc.icon}</span>
                <div className="history-item-text">
                  <span className="history-item-title">{desc.title}</span>
                  <span className="history-item-sub">
                    {desc.sub}
                    {desc.sub && ' · '}
                    <span title={fullDate(e.created_at)}>
                      {relativeDate(e.created_at)}
                    </span>
                    {e.scope === 'classroom' && (
                      <span className="history-item-scope"> · klase osoari</span>
                    )}
                  </span>
                </div>
                <div className="history-item-deltas">
                  {e.xp_delta !== 0 && (
                    <span
                      className={`history-delta ${
                        e.xp_delta > 0 ? 'history-delta-pos' : 'history-delta-neg'
                      }`}
                    >
                      {e.xp_delta > 0 ? '+' : ''}{e.xp_delta} XP
                    </span>
                  )}
                  {e.hearts_delta !== 0 && (
                    <span
                      className={`history-delta ${
                        e.hearts_delta > 0 ? 'history-delta-pos' : 'history-delta-neg'
                      }`}
                    >
                      {e.hearts_delta > 0 ? '+' : ''}{e.hearts_delta} ❤
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
