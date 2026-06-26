'use client'

import { useState } from 'react'
import type { NodeProgress, NodeStudent } from '@/lib/missions/node-progress'

type Props = {
  nodes: NodeProgress[]
  refreshing?: boolean
}

export default function NodeProgressList({ nodes, refreshing }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (nodes.length === 0) {
    return (
      <div className="npl-empty">
        <p>Misio honek oraindik ez ditu nodorik. Sortu helburuak mapan.</p>
      </div>
    )
  }

  return (
    <div className={`node-progress-list ${refreshing ? 'npl-refreshing' : ''}`}>
      {nodes.map((node, idx) => {
        const isExpanded = expandedId === node.node_id
        const total = node.total
        const completedCount = node.completed.length
        const pct = total > 0 ? Math.round((100 * completedCount) / total) : 0

        return (
          <div
            key={node.node_id}
            className={`npl-item ${isExpanded ? 'npl-item-open' : ''}`}
          >
            <button
              type="button"
              className="npl-header"
              onClick={() =>
                setExpandedId(isExpanded ? null : node.node_id)
              }
            >
              <span className="npl-index">
                {node.is_start ? '★' : idx + 1}
              </span>

              <span className="npl-title">{node.title}</span>

              <span className="npl-counts">
                {node.completed.length > 0 && (
                  <span className="npl-count npl-count-done" title="Osatuta">
                    {node.completed.length} ✓
                  </span>
                )}
                {node.pending.length > 0 && (
                  <span
                    className="npl-count npl-count-pending"
                    title="Berrikusi zain"
                  >
                    {node.pending.length} ⏳
                  </span>
                )}
                {node.failed.length > 0 && (
                  <span className="npl-count npl-count-failed" title="Hutsegitea">
                    {node.failed.length} ✗
                  </span>
                )}
                {node.locked.length > 0 && (
                  <span
                    className="npl-count npl-count-locked"
                    title="Blokeatuta"
                  >
                    {node.locked.length} 🔒
                  </span>
                )}
              </span>

              <span className="npl-progress-block">
                <span className="npl-bar">
                  <span className="npl-bar-fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="npl-pct">{pct}%</span>
              </span>

              <span className="npl-chevron">{isExpanded ? '▴' : '▾'}</span>
            </button>

            {isExpanded && (
              <div className="npl-body">
                {node.completed.length === 0 &&
                node.pending.length === 0 &&
                node.failed.length === 0 &&
                node.available.length === 0 &&
                node.locked.length === 0 ? (
                  <p className="npl-empty-inline">
                    Ikaslerik gabe aulan. Gehitu ikasleak ikasgelara.
                  </p>
                ) : (
                  <>
                    {node.completed.length > 0 && (
                      <Group
                        label="Osatuta"
                        emoji="✓"
                        variant="done"
                        students={node.completed}
                        showDate
                      />
                    )}
                    {node.pending.length > 0 && (
                      <Group
                        label="Berrikusi zain"
                        emoji="⏳"
                        variant="pending"
                        students={node.pending}
                        showDate
                      />
                    )}
                    {node.failed.length > 0 && (
                      <Group
                        label="Hutsegitea"
                        emoji="✗"
                        variant="failed"
                        students={node.failed}
                      />
                    )}
                    {node.available.length > 0 && (
                      <Group
                        label="Eskuratuta, oraindik egin gabe"
                        emoji="📍"
                        variant="available"
                        students={node.available}
                      />
                    )}
                    {node.locked.length > 0 && (
                      <Group
                        label="Oraindik ez dute eskuratu"
                        emoji="🔒"
                        variant="locked"
                        students={node.locked}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Group({
  label,
  emoji,
  variant,
  students,
  showDate = false,
}: {
  label: string
  emoji: string
  variant: 'done' | 'pending' | 'failed' | 'available' | 'locked'
  students: NodeStudent[]
  showDate?: boolean
}) {
  return (
    <div className={`npl-group npl-group-${variant}`}>
      <h4>
        <span className="npl-group-emoji">{emoji}</span>
        {label}
        <span className="npl-group-count">({students.length})</span>
      </h4>
      <ul>
        {students.map((s) => (
          <li key={s.id}>
            <span className="npl-student-name">{s.name}</span>
            {showDate && s.submitted_at && (
              <span className="npl-student-date">{formatDate(s.submitted_at)}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('eu-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}
