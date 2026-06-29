'use client'

import Link from 'next/link'
import type { NodeProgress, NodeStudent } from '@/lib/missions/node-progress'
import MissionMapBackground from '@/components/missions/MissionMapBackground'
import type { MissionMapId } from '@/lib/missions/maps'

type Props = {
  classroomId: string
  missionId: string
  missionName: string
  missionDescription: string
  backgroundId: MissionMapId
  nodes: NodeProgress[]
}

const AVATAR_COLORS = [
  '#4F8B3A',
  '#8B6F1A',
  '#3D5577',
  '#7B4A8B',
  '#C24617',
  '#2D7A1F',
  '#8B3A3A',
  '#3A7F95',
  '#5A4A8B',
  '#8B5A3A',
]

function nameHash(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

function Avatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[nameHash(name) % AVATAR_COLORS.length]
  return (
    <span className="garapena-avatar" style={{ background: color }}>
      {getInitials(name)}
    </span>
  )
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('eu-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function GarapenaView({
  classroomId,
  missionId,
  missionName,
  missionDescription,
  backgroundId,
  nodes,
}: Props) {
  const stats = computeGlobalStats(nodes)

  return (
    <div className="garapena-page">
      <Link
        href={`/panela/ikasgela/${classroomId}/misioak/${missionId}`}
        className="garapena-back-btn"
      >
        ← Editorera itzuli
      </Link>

      <header className="garapena-mission-card">
        <div className="garapena-mission-card-map">
          <MissionMapBackground mapId={backgroundId} />
          <div className="garapena-mission-card-map-overlay" />
        </div>
        <div className="garapena-mission-card-text">
          <span className="garapena-label">Klasearen garapena</span>
          <h1>{missionName}</h1>
          {missionDescription && <p>{missionDescription}</p>}
        </div>
      </header>

      <div className="garapena-stats-grid">
        <StatCard
          icon="👥"
          value={stats.totalStudents}
          label="Ikasleak guztira"
          variant="neutral"
        />
        <StatCard
          icon="🏆"
          value={stats.fullyCompleted}
          label="Misioa amaituta"
          variant="done"
        />
        <StatCard
          icon="🚀"
          value={stats.inProgress}
          label="Bidean"
          variant="progress"
        />
        <StatCard
          icon="⏳"
          value={stats.pendingTotal}
          label="Berrikuspen zain"
          variant="pending"
          highlight={stats.pendingTotal > 0}
        />
      </div>

      {nodes.length === 0 ? (
        <div className="garapena-empty">
          <p>Misio honek oraindik ez ditu helburuik.</p>
          <Link
            href={`/panela/ikasgela/${classroomId}/misioak/${missionId}`}
            className="panel-cta-btn"
          >
            Sortu helburuak
          </Link>
        </div>
      ) : (
        <div className="garapena-nodes">
          {nodes.map((node, idx) => (
            <NodeCard key={node.node_id} node={node} index={idx + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  variant,
  highlight,
}: {
  icon: string
  value: number
  label: string
  variant: 'neutral' | 'done' | 'progress' | 'pending'
  highlight?: boolean
}) {
  return (
    <div
      className={`garapena-stat-card garapena-stat-${variant} ${
        highlight ? 'garapena-stat-highlight' : ''
      }`}
    >
      <span className="garapena-stat-icon">{icon}</span>
      <div className="garapena-stat-body">
        <span className="garapena-stat-value">{value}</span>
        <span className="garapena-stat-label">{label}</span>
      </div>
    </div>
  )
}

function NodeCard({ node, index }: { node: NodeProgress; index: number }) {
  const completedCount = node.completed.length
  const total = node.total
  const pct = total > 0 ? Math.round((100 * completedCount) / total) : 0

  const groups: Array<{
    key: string
    variant: 'done' | 'pending' | 'failed' | 'available' | 'locked'
    label: string
    emoji: string
    students: NodeStudent[]
    showDate?: boolean
  }> = [
    {
      key: 'completed',
      variant: 'done',
      label: 'Osatuta',
      emoji: '✓',
      students: node.completed,
      showDate: true,
    },
    {
      key: 'pending',
      variant: 'pending',
      label: 'Berrikusi zain',
      emoji: '⏳',
      students: node.pending,
      showDate: true,
    },
    {
      key: 'failed',
      variant: 'failed',
      label: 'Hutsegitea',
      emoji: '✗',
      students: node.failed,
    },
    {
      key: 'available',
      variant: 'available',
      label: 'Eskuratuta, egin gabe',
      emoji: '📍',
      students: node.available,
    },
    {
      key: 'locked',
      variant: 'locked',
      label: 'Oraindik ez dute eskuratu',
      emoji: '🔒',
      students: node.locked,
    },
  ].filter((g) => g.students.length > 0)

  return (
    <article className="garapena-node-card">
      <header className="garapena-node-header">
        <span
          className={`garapena-node-index ${
            node.is_start ? 'garapena-node-index-start' : ''
          }`}
        >
          {node.is_start ? '★' : index}
        </span>
        <h2 className="garapena-node-title">{node.title}</h2>
        <div className="garapena-node-progress">
          <span className="garapena-node-progress-text">
            {completedCount} / {total}
          </span>
          <div className="garapena-node-bar">
            <div
              className="garapena-node-bar-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="garapena-node-pct">{pct}%</span>
        </div>
      </header>

      {groups.length === 0 ? (
        <p className="garapena-node-empty">Ikaslerik gabe aulan.</p>
      ) : (
        <div className="garapena-node-groups">
          {groups.map((g) => (
            <GroupBlock
              key={g.key}
              label={g.label}
              emoji={g.emoji}
              variant={g.variant}
              students={g.students}
              showDate={g.showDate}
            />
          ))}
        </div>
      )}
    </article>
  )
}

function GroupBlock({
  label,
  emoji,
  variant,
  students,
  showDate,
}: {
  label: string
  emoji: string
  variant: 'done' | 'pending' | 'failed' | 'available' | 'locked'
  students: NodeStudent[]
  showDate?: boolean
}) {
  return (
    <section className={`garapena-group garapena-group-${variant}`}>
      <header className="garapena-group-header">
        <span className="garapena-group-emoji">{emoji}</span>
        <span className="garapena-group-label">{label}</span>
        <span className="garapena-group-count">{students.length}</span>
      </header>
      <ul className="garapena-students">
        {students.map((s) => (
          <li key={s.id} className="garapena-student">
            <Avatar name={s.name} />
            <div className="garapena-student-info">
              <span className="garapena-student-name">{s.name}</span>
              {showDate && s.submitted_at && (
                <span className="garapena-student-date">
                  {formatDate(s.submitted_at)}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function computeGlobalStats(nodes: NodeProgress[]) {
  const totalStudents = nodes[0]?.total ?? 0

  const completedCount = new Map<string, number>()
  const anyProgress = new Set<string>()
  let pendingTotal = 0

  for (const node of nodes) {
    for (const s of node.completed) {
      completedCount.set(s.id, (completedCount.get(s.id) ?? 0) + 1)
      anyProgress.add(s.id)
    }
    for (const s of node.pending) {
      anyProgress.add(s.id)
      pendingTotal++
    }
    for (const s of node.failed) anyProgress.add(s.id)
    for (const s of node.available) anyProgress.add(s.id)
  }

  let fullyCompleted = 0
  for (const [, count] of completedCount) {
    if (count === nodes.length) fullyCompleted++
  }

  const inProgress = Math.max(0, anyProgress.size - fullyCompleted)

  return { totalStudents, fullyCompleted, inProgress, pendingTotal }
}
