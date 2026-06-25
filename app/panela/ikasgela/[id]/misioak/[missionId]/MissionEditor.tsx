'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import MissionMapBackground from '@/components/missions/MissionMapBackground'
import { MISSION_MAPS, type MissionMapId, getMissionMap } from '@/lib/missions/maps'
import type { Mission, MissionEdge, MissionNode } from '@/lib/missions/types'
import {
  createEdge,
  createNode,
  deleteEdge,
  deleteMission,
  deleteNode,
  setStartNode,
  updateMission,
  updateNode,
} from '@/lib/missions/actions'
import AsyncButton from '@/components/ui/AsyncButton'

type Props = {
  classroomId: string
  classroomName: string
  initialMission: Mission
  initialNodes: MissionNode[]
  initialEdges: MissionEdge[]
}

export default function MissionEditor({
  classroomId,
  classroomName,
  initialMission,
  initialNodes,
  initialEdges,
}: Props) {
  const [mission, setMission] = useState<Mission>(initialMission)
  const [nodes, setNodes] = useState<MissionNode[]>(initialNodes)
  const [edges, setEdges] = useState<MissionEdge[]>(initialEdges)
  const [editingNode, setEditingNode] = useState<MissionNode | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const mapRef = useRef<HTMLDivElement | null>(null)

  // Drag state para mover nodos
  const dragRef = useRef<{
    nodeId: string
    startX: number
    startY: number
    moved: boolean
  } | null>(null)

  // Auto-save de la misión (nombre, descripción, mapa, recompensas, activo)
  const saveTimerRef = useRef<number | null>(null)
  function scheduleMissionSave(patch: Partial<Mission>) {
    setMission((prev) => ({ ...prev, ...patch }))
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
    setSaveState('saving')
    saveTimerRef.current = window.setTimeout(async () => {
      const result = await updateMission(mission.id, patch)
      if (result.success) setSaveState('saved')
    }, 600)
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
    }
  }, [])

  async function handleAddNode(percentX: number, percentY: number) {
    const result = await createNode(mission.id, {
      title: 'Helburu berria',
      position_x: percentX,
      position_y: percentY,
      is_start: nodes.length === 0,
    })
    if (!result.success) {
      alert(result.error)
      return
    }
    setNodes((prev) => [...prev, result.node])
    setEditingNode(result.node)
  }

  function onMapClick(e: React.MouseEvent) {
    if (connectingFrom) {
      setConnectingFrom(null)
      return
    }
    if (!mapRef.current) return
    // Solo si el click es directo en el fondo del mapa
    if ((e.target as HTMLElement).closest('.mission-node-marker')) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    void handleAddNode(
      Math.max(2, Math.min(98, x)),
      Math.max(2, Math.min(98, y))
    )
  }

  function onNodePointerDown(e: React.PointerEvent, node: MissionNode) {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if (connectingFrom) {
      // Conectar: crea edge desde connectingFrom hasta este
      if (connectingFrom !== node.id) {
        void handleCreateEdge(connectingFrom, node.id)
      }
      setConnectingFrom(null)
      return
    }
    dragRef.current = {
      nodeId: node.id,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    }
    e.stopPropagation()
  }

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const drag = dragRef.current
      if (!drag || !mapRef.current) return
      const dx = e.clientX - drag.startX
      const dy = e.clientY - drag.startY
      if (!drag.moved && Math.hypot(dx, dy) < 5) return
      drag.moved = true
      const rect = mapRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setNodes((prev) =>
        prev.map((n) =>
          n.id === drag.nodeId
            ? {
                ...n,
                position_x: Math.max(2, Math.min(98, x)),
                position_y: Math.max(2, Math.min(98, y)),
              }
            : n
        )
      )
    }
    async function onUp() {
      const drag = dragRef.current
      dragRef.current = null
      if (!drag) return
      if (drag.moved) {
        const n = nodes.find((nn) => nn.id === drag.nodeId)
        if (n) {
          await updateNode(n.id, {
            position_x: n.position_x,
            position_y: n.position_y,
          })
        }
      } else {
        // Click sin arrastre: abrir editor
        const n = nodes.find((nn) => nn.id === drag.nodeId)
        if (n) setEditingNode(n)
      }
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
  }, [nodes])

  async function handleCreateEdge(fromId: string, toId: string) {
    // Evitar duplicados
    if (edges.some((e) => e.from_node_id === fromId && e.to_node_id === toId)) return
    const result = await createEdge(mission.id, {
      from_node_id: fromId,
      to_node_id: toId,
    })
    if (result.success) setEdges((prev) => [...prev, result.edge])
  }

  async function handleDeleteEdge(edgeId: string) {
    if (!window.confirm('Konexioa ezabatu?')) return
    const result = await deleteEdge(edgeId)
    if (result.success) setEdges((prev) => prev.filter((e) => e.id !== edgeId))
  }

  async function handleDeleteNode(nodeId: string) {
    if (!window.confirm('Helburu hau eta bere konexioak ezabatu?')) return
    const result = await deleteNode(nodeId)
    if (result.success) {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId))
      setEdges((prev) =>
        prev.filter((e) => e.from_node_id !== nodeId && e.to_node_id !== nodeId)
      )
      setEditingNode(null)
    }
  }

  async function handleSetStart(nodeId: string) {
    await setStartNode(mission.id, nodeId)
    setNodes((prev) =>
      prev.map((n) => ({ ...n, is_start: n.id === nodeId }))
    )
  }

  async function handleSaveNode(updated: MissionNode) {
    const result = await updateNode(updated.id, updated)
    if (!result.success) {
      alert(result.error)
      return
    }
    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    setEditingNode(null)
  }

  async function handleDeleteMission() {
    if (!window.confirm('Misio osoa ezabatuko da. Ziur?')) return
    const result = await deleteMission(mission.id)
    if (result.success) {
      window.location.href = `/panela/ikasgela/${classroomId}/misioak`
    }
  }

  const currentMap = getMissionMap(mission.background_id)

  return (
    <div className="mission-editor">
      <header className="mission-editor-header">
        <Link
          href={`/panela/ikasgela/${classroomId}/misioak`}
          className="panel-breadcrumb"
        >
          ← Misioak
        </Link>
        <h1 className="mission-editor-title">{mission.name || 'Misioa'}</h1>
        <span
          className={`mission-editor-state mission-editor-state-${
            mission.is_active ? 'active' : 'inactive'
          }`}
        >
          {mission.is_active ? '● Aktibo' : '○ Ezkutatuta'}
        </span>
        <span className="mission-editor-save">
          {saveState === 'saving' && 'Gordetzen…'}
          {saveState === 'saved' && '✓ Gordeta'}
        </span>
        <div className="mission-editor-header-actions">
          <button
            type="button"
            className="mission-editor-action"
            onClick={() => {
              if (connectingFrom) setConnectingFrom(null)
              else if (nodes[0]) setConnectingFrom(nodes[0].id)
              else alert('Sortu lehenik helburu bat.')
            }}
            title="Konektatu nodoak"
          >
            {connectingFrom ? '✕ Utzi konektatzea' : '🔗 Konektatu nodoak'}
          </button>
        </div>
      </header>

      <div className="mission-editor-body">
        {/* MAPA */}
        <div
          className="mission-editor-canvas"
          ref={mapRef}
          onClick={onMapClick}
        >
          <MissionMapBackground mapId={mission.background_id} />

          {/* SVG con las flechas/edges */}
          <svg
            className="mission-editor-edges"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="arrow-always"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFFDE7" />
              </marker>
              <marker
                id="arrow-success"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#7CD876" />
              </marker>
              <marker
                id="arrow-failure"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#FF8B6A" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const from = nodes.find((n) => n.id === edge.from_node_id)
              const to = nodes.find((n) => n.id === edge.to_node_id)
              if (!from || !to) return null
              const strokeColor =
                edge.condition === 'success'
                  ? '#7CD876'
                  : edge.condition === 'failure'
                  ? '#FF8B6A'
                  : '#FFFDE7'
              return (
                <line
                  key={edge.id}
                  x1={from.position_x}
                  y1={from.position_y}
                  x2={to.position_x}
                  y2={to.position_y}
                  stroke={strokeColor}
                  strokeWidth="0.4"
                  opacity="0.9"
                  markerEnd={`url(#arrow-${edge.condition})`}
                  onClick={(e) => {
                    e.stopPropagation()
                    void handleDeleteEdge(edge.id)
                  }}
                  style={{ cursor: 'pointer', pointerEvents: 'all' }}
                />
              )
            })}
          </svg>

          {/* Nodos */}
          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={`mission-node-marker ${
                node.is_start ? 'mission-node-marker-start' : ''
              } ${connectingFrom === node.id ? 'mission-node-marker-connecting' : ''}`}
              style={{
                left: `${node.position_x}%`,
                top: `${node.position_y}%`,
              }}
              onPointerDown={(e) => onNodePointerDown(e, node)}
            >
              <span className="mission-node-marker-icon">
                {node.is_start ? '★' : '📍'}
              </span>
              <span className="mission-node-marker-label">{node.title}</span>
              <span className="mission-node-marker-rewards">
                +{node.xp_reward}⚡
                {node.hearts_delta !== 0 && ` ${node.hearts_delta > 0 ? '+' : ''}${node.hearts_delta}❤`}
              </span>
            </button>
          ))}

          {nodes.length === 0 && (
            <div className="mission-editor-hint">
              Sakatu mapan helburu berri bat sortzeko
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="mission-editor-sidebar">
          <section className="mission-editor-section">
            <h3>Misioaren konfigurazioa</h3>
            <div className="form-field">
              <label htmlFor="mission-name">Izena</label>
              <input
                id="mission-name"
                type="text"
                value={mission.name}
                onChange={(e) => scheduleMissionSave({ name: e.target.value })}
                maxLength={120}
              />
            </div>
            <div className="form-field">
              <label htmlFor="mission-desc">Sarrera narratiboa</label>
              <textarea
                id="mission-desc"
                rows={3}
                value={mission.description}
                onChange={(e) =>
                  scheduleMissionSave({ description: e.target.value })
                }
              />
            </div>
            <label className="mission-editor-toggle">
              <input
                type="checkbox"
                checked={mission.is_active}
                onChange={(e) =>
                  scheduleMissionSave({ is_active: e.target.checked })
                }
              />
              <span>Aktibo (ikasleek ikus dezakete)</span>
            </label>
          </section>

          <section className="mission-editor-section">
            <h3>Mapa</h3>
            <div className="mission-map-picker-compact">
              {MISSION_MAPS.map((map) => (
                <label key={map.id} className="mission-map-option-compact">
                  <input
                    type="radio"
                    name="bg"
                    value={map.id}
                    checked={mission.background_id === map.id}
                    onChange={() =>
                      scheduleMissionSave({ background_id: map.id })
                    }
                  />
                  <span className="mission-map-option-preview-compact">
                    <MissionMapBackground mapId={map.id} />
                  </span>
                  <span>{map.name}</span>
                </label>
              ))}
            </div>
            <p className="mission-editor-current-map">
              Egungo mapa: <strong>{currentMap.name}</strong>
            </p>
          </section>

          <section className="mission-editor-section">
            <h3>Amaierako sariak</h3>
            <p className="mission-editor-hint-small">
              Misio osoa amaitzean (helburu guztiak osatuta) gehigarriak.
            </p>
            <div className="mission-editor-rewards-grid">
              <div className="form-field-compact">
                <label>⚡ XP</label>
                <input
                  type="number"
                  value={mission.final_xp_reward}
                  onChange={(e) =>
                    scheduleMissionSave({
                      final_xp_reward: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-field-compact">
                <label>❤ Bihotzak</label>
                <input
                  type="number"
                  value={mission.final_hearts_reward}
                  onChange={(e) =>
                    scheduleMissionSave({
                      final_hearts_reward: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-field-compact">
                <label>🔮 Mana</label>
                <input
                  type="number"
                  value={mission.final_mana_reward}
                  onChange={(e) =>
                    scheduleMissionSave({
                      final_mana_reward: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </section>

          <section className="mission-editor-section">
            <h3>Estatistikak</h3>
            <ul className="mission-editor-stats">
              <li>📍 {nodes.length} helburu</li>
              <li>🔗 {edges.length} konexio</li>
              <li>🏫 {classroomName}</li>
            </ul>
          </section>

          <section className="mission-editor-section mission-editor-danger">
            <AsyncButton
              className="mission-editor-delete-btn"
              onClick={handleDeleteMission}
            >
              🗑 Misioa ezabatu
            </AsyncButton>
          </section>
        </aside>
      </div>

      {/* Modal de edición de nodo */}
      {editingNode && (
        <NodeEditorModal
          node={editingNode}
          isOnlyNode={nodes.length === 1}
          allNodes={nodes}
          edges={edges}
          missionId={mission.id}
          onClose={() => setEditingNode(null)}
          onSave={handleSaveNode}
          onDelete={() => handleDeleteNode(editingNode.id)}
          onSetStart={() => handleSetStart(editingNode.id)}
          onCreateEdge={async (toId, condition) => {
            const result = await createEdge(mission.id, {
              from_node_id: editingNode.id,
              to_node_id: toId,
              condition,
            })
            if (result.success) setEdges((prev) => [...prev, result.edge])
          }}
          onDeleteEdge={async (edgeId) => {
            const result = await deleteEdge(edgeId)
            if (result.success)
              setEdges((prev) => prev.filter((e) => e.id !== edgeId))
          }}
        />
      )}
    </div>
  )
}

// ============================================================
// NodeEditorModal
// ============================================================
function NodeEditorModal({
  node,
  isOnlyNode,
  allNodes,
  edges,
  onClose,
  onSave,
  onDelete,
  onSetStart,
  onCreateEdge,
  onDeleteEdge,
}: {
  node: MissionNode
  isOnlyNode: boolean
  allNodes: MissionNode[]
  edges: MissionEdge[]
  missionId: string
  onClose: () => void
  onSave: (n: MissionNode) => Promise<void>
  onDelete: () => void
  onSetStart: () => void
  onCreateEdge: (
    toId: string,
    condition: 'always' | 'success' | 'failure'
  ) => Promise<void>
  onDeleteEdge: (edgeId: string) => Promise<void>
}) {
  const [draft, setDraft] = useState<MissionNode>(node)
  const [newEdgeTo, setNewEdgeTo] = useState<string>('')
  const [newEdgeCondition, setNewEdgeCondition] =
    useState<'always' | 'success' | 'failure'>('always')

  const outgoingEdges = edges.filter((e) => e.from_node_id === node.id)
  const availableTargets = allNodes.filter(
    (n) =>
      n.id !== node.id &&
      !outgoingEdges.some((e) => e.to_node_id === n.id)
  )

  return (
    <div
      className="avatar-picker-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="node-editor-modal">
        <header className="node-editor-header">
          <h2>{draft.is_start ? '★ ' : ''}{draft.title || 'Helburua'}</h2>
          <button
            type="button"
            className="node-editor-close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="node-editor-body">
          <div className="form-field">
            <label>Izenburua</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) =>
                setDraft({ ...draft, title: e.target.value })
              }
              maxLength={120}
            />
          </div>

          <div className="form-field">
            <label>Helburuaren azalpena (testua)</label>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              placeholder="Ikaslearentzako azalpen luzea."
            />
          </div>

          <div className="form-field-row">
            <div className="form-field">
              <label>Eduki mota</label>
              <select
                value={draft.content_type}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    content_type: e.target.value as MissionNode['content_type'],
                  })
                }
              >
                <option value="text">Testu hutsa</option>
                <option value="link">Esteka (URL)</option>
                <option value="pdf">PDF (URL)</option>
                <option value="image">Irudia (URL)</option>
                <option value="youtube">YouTube (URL)</option>
              </select>
            </div>
            {draft.content_type !== 'text' && (
              <div className="form-field form-field-grow">
                <label>URL</label>
                <input
                  type="url"
                  value={draft.content_url}
                  onChange={(e) =>
                    setDraft({ ...draft, content_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Onarpena</label>
            <div className="node-editor-radio-group">
              <label>
                <input
                  type="radio"
                  checked={draft.validation_type === 'auto'}
                  onChange={() =>
                    setDraft({ ...draft, validation_type: 'auto' })
                  }
                />
                <span>
                  <strong>Automatikoa</strong> — bidaltzean osatzen da
                </span>
              </label>
              <label>
                <input
                  type="radio"
                  checked={draft.validation_type === 'manual'}
                  onChange={() =>
                    setDraft({ ...draft, validation_type: 'manual' })
                  }
                />
                <span>
                  <strong>Eskuzkoa</strong> — irakasleak berretsi behar du
                </span>
              </label>
            </div>
          </div>

          <div className="node-editor-rewards">
            <div className="form-field-compact">
              <label>⚡ XP</label>
              <input
                type="number"
                value={draft.xp_reward}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    xp_reward: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="form-field-compact">
              <label>❤ Bihotzak (osatzean)</label>
              <input
                type="number"
                value={draft.hearts_delta}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    hearts_delta: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="form-field-compact">
              <label>🔮 Mana</label>
              <input
                type="number"
                value={draft.mana_reward}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    mana_reward: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="form-field-compact">
              <label>💔 Galtzean (-)</label>
              <input
                type="number"
                min={0}
                value={draft.hearts_penalty}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    hearts_penalty: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          {/* Conexiones salientes */}
          <div className="node-editor-section">
            <h4>Hurrengo nodoak (irteten diren konexioak)</h4>
            {outgoingEdges.length === 0 ? (
              <p className="node-editor-empty">
                Konexiorik gabe — azken nodoa da.
              </p>
            ) : (
              <ul className="node-editor-edges-list">
                {outgoingEdges.map((edge) => {
                  const target = allNodes.find((n) => n.id === edge.to_node_id)
                  return (
                    <li key={edge.id}>
                      <span
                        className={`node-editor-edge-tag node-editor-edge-tag-${edge.condition}`}
                      >
                        {edge.condition === 'always'
                          ? 'Beti'
                          : edge.condition === 'success'
                          ? 'Asmatzen'
                          : 'Hutsegitean'}
                      </span>
                      <span>→ {target?.title ?? '(ezabatua)'}</span>
                      <button
                        type="button"
                        onClick={() => void onDeleteEdge(edge.id)}
                        className="node-editor-edge-delete"
                        aria-label="Ezabatu"
                      >
                        ✕
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {availableTargets.length > 0 && (
              <div className="node-editor-edge-add">
                <select
                  value={newEdgeTo}
                  onChange={(e) => setNewEdgeTo(e.target.value)}
                >
                  <option value="">— Aukeratu hurrengo nodoa —</option>
                  {availableTargets.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
                </select>
                <select
                  value={newEdgeCondition}
                  onChange={(e) =>
                    setNewEdgeCondition(
                      e.target.value as 'always' | 'success' | 'failure'
                    )
                  }
                >
                  <option value="always">Beti</option>
                  <option value="success">Asmatzen badu</option>
                  <option value="failure">Huts egiten badu</option>
                </select>
                <AsyncButton
                  className="node-editor-edge-add-btn"
                  onClick={async () => {
                    if (!newEdgeTo) return
                    await onCreateEdge(newEdgeTo, newEdgeCondition)
                    setNewEdgeTo('')
                  }}
                  disabled={!newEdgeTo}
                >
                  + Konektatu
                </AsyncButton>
              </div>
            )}
          </div>

          {!draft.is_start && (
            <div className="node-editor-section">
              <button
                type="button"
                className="node-editor-set-start"
                onClick={onSetStart}
              >
                ★ Lehen nodo bezala markatu
              </button>
            </div>
          )}
        </div>

        <footer className="node-editor-footer">
          {!isOnlyNode && (
            <AsyncButton
              className="node-editor-delete-btn"
              onClick={onDelete}
            >
              🗑 Ezabatu
            </AsyncButton>
          )}
          <button
            type="button"
            className="panel-cta-btn-secondary"
            onClick={onClose}
          >
            Utzi
          </button>
          <AsyncButton
            className="panel-cta-btn"
            onClick={() => onSave(draft)}
          >
            Gorde
          </AsyncButton>
        </footer>
      </div>
    </div>
  )
}
