'use client'

import { useState } from 'react'
import Link from 'next/link'
import MissionMapBackground from '@/components/missions/MissionMapBackground'
import type { MissionMapId } from '@/lib/missions/maps'
import { submitStudentNode } from '@/lib/missions/student-actions'

type Mission = {
  id: string
  name: string
  description: string
  background_id: MissionMapId
  final_xp_reward: number
  final_hearts_reward: number
  final_mana_reward: number
}

type Node = {
  id: string
  title: string
  description: string
  position_x: number
  position_y: number
  content_type: 'text' | 'pdf' | 'image' | 'youtube' | 'link'
  content_url: string
  content_text: string
  validation_type: 'auto' | 'manual'
  xp_reward: number
  hearts_delta: number
  mana_reward: number
  is_start: boolean
}

type Edge = {
  from_node_id: string
  to_node_id: string
  condition: 'always' | 'success' | 'failure'
}

type Progress = {
  node_id: string
  status: 'available' | 'pending_review' | 'completed' | 'failed'
  submission_text: string
  submitted_at: string | null
}

type DetailData = {
  mission: Mission
  nodes: Node[]
  edges: Edge[]
  progress: Progress[]
}

type Props = {
  studentId: string
  initialData: DetailData
}

export default function StudentMissionView({ studentId, initialData }: Props) {
  const [data, setData] = useState<DetailData>(initialData)
  const [openNode, setOpenNode] = useState<Node | null>(null)

  function progressFor(nodeId: string): Progress | null {
    return data.progress.find((p) => p.node_id === nodeId) ?? null
  }

  function statusOf(nodeId: string):
    | 'locked'
    | 'available'
    | 'pending_review'
    | 'completed'
    | 'failed' {
    const prog = progressFor(nodeId)
    if (!prog) return 'locked'
    return prog.status
  }

  // El alumno solo ve nodos: completados, fallidos, disponibles, pending_review,
  // y los nodos siguientes inmediatos (para que vea hacia dónde va).
  function visibleNodes(): Node[] {
    const visibleIds = new Set<string>()
    for (const p of data.progress) visibleIds.add(p.node_id)
    // También añadimos los "siguientes" de nodos completados (pista visual)
    for (const p of data.progress) {
      if (p.status === 'completed') {
        for (const e of data.edges) {
          if (e.from_node_id === p.node_id) visibleIds.add(e.to_node_id)
        }
      }
    }
    return data.nodes.filter((n) => visibleIds.has(n.id))
  }

  // Edges visibles: solo entre nodos visibles
  function visibleEdges(): Edge[] {
    const visIds = new Set(visibleNodes().map((n) => n.id))
    return data.edges.filter(
      (e) => visIds.has(e.from_node_id) && visIds.has(e.to_node_id)
    )
  }

  async function handleSubmit(nodeId: string, text: string) {
    const result = await submitStudentNode(studentId, nodeId, text)
    if (!result.success) {
      alert(result.error)
      return
    }
    // Recargar datos
    const res = await fetch(`/ikasle/misioa/${data.mission.id}/api/refresh`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const fresh = await res.json()
      if (fresh.success) setData(fresh.data)
    }
    setOpenNode(null)
  }

  const visNodes = visibleNodes()
  const visEdges = visibleEdges()

  const completedCount = data.progress.filter(
    (p) => p.status === 'completed'
  ).length
  const totalNodes = data.nodes.length

  return (
    <div className="student-mission">
      <header className="student-mission-header">
        <Link href="/ikasle/panela" className="student-mission-back">
          ← Itzuli panelara
        </Link>
        <div className="student-mission-title-block">
          <h1>{data.mission.name}</h1>
          {data.mission.description && (
            <p>{data.mission.description}</p>
          )}
        </div>
        <div className="student-mission-progress">
          <span>
            {completedCount} / {totalNodes} osatuta
          </span>
          <div className="student-mission-progress-bar">
            <div
              className="student-mission-progress-fill"
              style={{
                width: `${totalNodes > 0 ? (completedCount / totalNodes) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </header>

      <div className="student-mission-map">
        <MissionMapBackground mapId={data.mission.background_id} />

        {/* Edges visibles */}
        <svg
          className="student-mission-edges"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <marker
              id="s-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 253, 231, 0.7)" />
            </marker>
          </defs>
          {visEdges.map((e, idx) => {
            const from = data.nodes.find((n) => n.id === e.from_node_id)
            const to = data.nodes.find((n) => n.id === e.to_node_id)
            if (!from || !to) return null
            const fromStatus = statusOf(from.id)
            const stroke =
              fromStatus === 'completed'
                ? 'rgba(125, 216, 118, 0.85)'
                : 'rgba(255, 253, 231, 0.45)'
            return (
              <line
                key={idx}
                x1={from.position_x}
                y1={from.position_y}
                x2={to.position_x}
                y2={to.position_y}
                stroke={stroke}
                strokeWidth="0.4"
                strokeDasharray={fromStatus === 'completed' ? 'none' : '1 1'}
                markerEnd="url(#s-arrow)"
              />
            )
          })}
        </svg>

        {/* Nodos visibles */}
        {visNodes.map((node) => {
          const status = statusOf(node.id)
          return (
            <button
              key={node.id}
              type="button"
              className={`student-mission-node student-mission-node-${status}`}
              style={{
                left: `${node.position_x}%`,
                top: `${node.position_y}%`,
              }}
              onClick={() => setOpenNode(node)}
              disabled={status === 'locked'}
              title={node.title}
            >
              <span className="student-mission-node-icon">
                {status === 'completed'
                  ? '✓'
                  : status === 'failed'
                  ? '✗'
                  : status === 'pending_review'
                  ? '⏳'
                  : status === 'available'
                  ? node.is_start
                    ? '★'
                    : '📍'
                  : '🔒'}
              </span>
              <span className="student-mission-node-label">{node.title}</span>
            </button>
          )
        })}
      </div>

      {openNode && (
        <StudentNodeModal
          node={openNode}
          progress={progressFor(openNode.id)}
          onClose={() => setOpenNode(null)}
          onSubmit={(text) => handleSubmit(openNode.id, text)}
        />
      )}
    </div>
  )
}

function StudentNodeModal({
  node,
  progress,
  onClose,
  onSubmit,
}: {
  node: Node
  progress: Progress | null
  onClose: () => void
  onSubmit: (text: string) => void | Promise<void>
}) {
  const [text, setText] = useState(progress?.submission_text ?? '')
  const [submitting, setSubmitting] = useState(false)
  const status = progress?.status ?? 'locked'

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    try {
      await onSubmit(text)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="avatar-picker-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="student-node-modal">
        <header className="student-node-modal-header">
          <h2>{node.title}</h2>
          <button
            type="button"
            className="student-node-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="student-node-modal-body">
          {node.description && (
            <p className="student-node-description">{node.description}</p>
          )}

          {/* Render del contenido según tipo */}
          {node.content_type === 'youtube' && node.content_url && (
            <div className="student-node-video">
              <iframe
                src={youtubeEmbedUrl(node.content_url)}
                title="YouTube"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {node.content_type === 'image' && node.content_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={node.content_url}
              alt={node.title}
              className="student-node-image"
            />
          )}
          {(node.content_type === 'pdf' || node.content_type === 'link') &&
            node.content_url && (
              <a
                href={node.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="student-node-link"
              >
                {node.content_type === 'pdf' ? '📄 Ireki PDF' : '🔗 Ireki esteka'}
              </a>
            )}

          <div className="student-node-rewards">
            <span>⚡ +{node.xp_reward} XP</span>
            {node.hearts_delta !== 0 && (
              <span>
                ❤ {node.hearts_delta > 0 ? '+' : ''}
                {node.hearts_delta}
              </span>
            )}
            {node.mana_reward !== 0 && <span>🔮 +{node.mana_reward} mana</span>}
          </div>

          {status === 'completed' && (
            <div className="student-node-status student-node-status-completed">
              ✓ Osatuta — Saria jasota
            </div>
          )}
          {status === 'failed' && (
            <div className="student-node-status student-node-status-failed">
              ✗ Huts egin duzu nodo honetan
            </div>
          )}
          {status === 'pending_review' && (
            <div className="student-node-status student-node-status-pending">
              ⏳ Irakasleak berrikusten du
            </div>
          )}

          {status === 'available' && (
            <div className="form-field">
              <label>Zure entrega / iruzkina</label>
              <textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Idatzi hemen zure entrega edo iruzkina…"
              />
              <p className="student-node-hint">
                {node.validation_type === 'auto'
                  ? 'Bidaltzean automatikoki osatuko da.'
                  : 'Irakasleak berretsi behar du zure entrega.'}
              </p>
            </div>
          )}
        </div>

        <footer className="student-node-modal-footer">
          <button
            type="button"
            className="panel-cta-btn-secondary"
            onClick={onClose}
          >
            Itxi
          </button>
          {status === 'available' && (
            <button
              type="button"
              className="panel-cta-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Bidaltzen…' : 'Bidali'}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

function youtubeEmbedUrl(url: string): string {
  // Convertir watch?v=XXX o youtu.be/XXX a /embed/XXX
  const m =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/i)
  if (m) return `https://www.youtube.com/embed/${m[1]}`
  return url
}
