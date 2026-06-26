'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import MissionMapBackground from '@/components/missions/MissionMapBackground'
import type { MissionMapId } from '@/lib/missions/maps'
import { submitStudentNode } from '@/lib/missions/student-actions'
import MissionVictoryOverlay from '@/components/missions/MissionVictoryOverlay'

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

type SubmitResponse = {
  success: boolean
  status?: string
  completion?: null | {
    completed: boolean
    already?: boolean
    mission_name?: string
    final_xp?: number
    final_hearts?: number
    final_mana?: number
  }
  unlocked?: Array<{ id: string; title: string }>
  rewards?: { xp: number; hearts: number; mana: number }
  error?: string
}

type Props = {
  studentId: string
  initialData: DetailData
}

type FloatingReward = {
  id: number
  nodeId: string
  text: string
  variant: 'gain' | 'loss'
}

type Toast = {
  id: number
  kind: 'unlocked' | 'completed'
  message: string
}

export default function StudentMissionView({ studentId, initialData }: Props) {
  const [data, setData] = useState<DetailData>(initialData)
  const [openNode, setOpenNode] = useState<Node | null>(null)
  const [floats, setFloats] = useState<FloatingReward[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [victory, setVictory] = useState<{
    name: string
    xp: number
    hearts: number
    mana: number
  } | null>(null)
  const [completionFlashNodeId, setCompletionFlashNodeId] = useState<string | null>(null)

  // Para no mostrar el overlay si ya estaba completada al entrar
  const alreadyCompletedRef = useRef<boolean>(
    initialData.nodes.length > 0 &&
      initialData.progress.filter((p) => p.status === 'completed').length ===
        initialData.nodes.length
  )

  function progressFor(nodeId: string): Progress | null {
    return data.progress.find((p) => p.node_id === nodeId) ?? null
  }

  function statusOf(
    nodeId: string
  ): 'locked' | 'available' | 'pending_review' | 'completed' | 'failed' {
    const prog = progressFor(nodeId)
    if (!prog) return 'locked'
    return prog.status
  }

  function pushToast(kind: Toast['kind'], message: string) {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, kind, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }

  function pushFloat(nodeId: string, text: string, variant: 'gain' | 'loss') {
    const id = Date.now() + Math.random()
    setFloats((prev) => [...prev, { id, nodeId, text, variant }])
    window.setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id))
    }, 2200)
  }

  async function handleSubmit(node: Node, text: string) {
    const result = (await submitStudentNode(
      studentId,
      node.id,
      text
    )) as SubmitResponse

    if (!result.success) {
      alert(result.error)
      return
    }

    // Recargar datos
    const res = await fetch(`/ikasle/misioa/${data.mission.id}/api/refresh`, {
      cache: 'no-store',
    })
    let fresh: DetailData | null = null
    if (res.ok) {
      const j = await res.json()
      if (j.success) {
        fresh = j.data
        setData(fresh!)
      }
    }

    // Animaciones según resultado
    if (result.status === 'completed') {
      // Flash verde sobre el nodo
      setCompletionFlashNodeId(node.id)
      window.setTimeout(() => setCompletionFlashNodeId(null), 1800)

      const rewards = result.rewards ?? { xp: 0, hearts: 0, mana: 0 }
      if (rewards.xp !== 0) {
        pushFloat(node.id, `+${rewards.xp} XP`, 'gain')
      }
      if (rewards.hearts !== 0) {
        const txt = `${rewards.hearts > 0 ? '+' : ''}${rewards.hearts} ❤`
        pushFloat(node.id, txt, rewards.hearts > 0 ? 'gain' : 'loss')
      }
      if (rewards.mana !== 0) {
        pushFloat(node.id, `+${rewards.mana} 🔮`, 'gain')
      }

      // Notificación de nodos desbloqueados
      const unlocked = result.unlocked ?? []
      if (unlocked.length > 0) {
        const titles = unlocked.map((u) => u.title).join(', ')
        pushToast('unlocked', `🔓 Helburu berriak: ${titles}`)
      }

      // Victoria
      if (
        result.completion?.completed &&
        !result.completion.already &&
        !alreadyCompletedRef.current
      ) {
        alreadyCompletedRef.current = true
        // Pequeña pausa para que se vea la animación del nodo primero
        window.setTimeout(() => {
          setVictory({
            name: result.completion?.mission_name ?? data.mission.name,
            xp: result.completion?.final_xp ?? 0,
            hearts: result.completion?.final_hearts ?? 0,
            mana: result.completion?.final_mana ?? 0,
          })
        }, 1200)
      }
    } else if (result.status === 'pending_review') {
      pushToast('completed', '⏳ Entregatuta. Irakasleak berrikusiko du.')
    }

    setOpenNode(null)
  }

  const visNodes = data.nodes
  const visEdges = data.edges
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
          {data.mission.description && <p>{data.mission.description}</p>}
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
            <marker
              id="s-arrow-locked"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 253, 231, 0.25)" />
            </marker>
          </defs>
          {visEdges.map((e, idx) => {
            const from = data.nodes.find((n) => n.id === e.from_node_id)
            const to = data.nodes.find((n) => n.id === e.to_node_id)
            if (!from || !to) return null
            const fromStatus = statusOf(from.id)
            const isLocked = fromStatus === 'locked'
            const stroke =
              fromStatus === 'completed'
                ? 'rgba(125, 216, 118, 0.85)'
                : isLocked
                ? 'rgba(255, 253, 231, 0.22)'
                : 'rgba(255, 253, 231, 0.55)'
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
                markerEnd={isLocked ? 'url(#s-arrow-locked)' : 'url(#s-arrow)'}
              />
            )
          })}
        </svg>

        {visNodes.map((node) => {
          const status = statusOf(node.id)
          const nodeFloats = floats.filter((f) => f.nodeId === node.id)
          const isFlashing = completionFlashNodeId === node.id
          return (
            <div
              key={node.id}
              className="student-mission-node-wrapper"
              style={{ left: `${node.position_x}%`, top: `${node.position_y}%` }}
            >
              <button
                type="button"
                className={`student-mission-node student-mission-node-${status} ${
                  isFlashing ? 'student-mission-node-flash' : ''
                }`}
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
              {/* Floating rewards */}
              {nodeFloats.length > 0 && (
                <div className="student-mission-node-floats" aria-hidden="true">
                  {nodeFloats.map((f) => (
                    <span
                      key={f.id}
                      className={`student-mission-float student-mission-float-${f.variant}`}
                    >
                      {f.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {visNodes.length === 0 && (
          <div className="student-mission-empty">
            Misio honek oraindik ez du helburuik. Itzuli geroago.
          </div>
        )}
      </div>

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="mission-toasts" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`mission-toast mission-toast-${t.kind}`}>
              {t.message}
            </div>
          ))}
        </div>
      )}

      {openNode && (
        <StudentNodeModal
          node={openNode}
          progress={progressFor(openNode.id)}
          status={statusOf(openNode.id)}
          onClose={() => setOpenNode(null)}
          onSubmit={(text) => handleSubmit(openNode, text)}
        />
      )}

      {victory && (
        <MissionVictoryOverlay
          missionName={victory.name}
          finalXp={victory.xp}
          finalHearts={victory.hearts}
          finalMana={victory.mana}
          onClose={() => setVictory(null)}
        />
      )}
    </div>
  )
}

function StudentNodeModal({
  node,
  progress,
  status,
  onClose,
  onSubmit,
}: {
  node: Node
  progress: Progress | null
  status: 'locked' | 'available' | 'pending_review' | 'completed' | 'failed'
  onClose: () => void
  onSubmit: (text: string) => void | Promise<void>
}) {
  const [text, setText] = useState(progress?.submission_text ?? '')
  const [submitting, setSubmitting] = useState(false)

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
          {status === 'locked' && (
            <div className="student-node-status student-node-status-locked">
              🔒 Aurreko helburuak osatu behar dituzu hau desblokeatzeko
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
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/i)
  if (m) return `https://www.youtube.com/embed/${m[1]}`
  return url
}
