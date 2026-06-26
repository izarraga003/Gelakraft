'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MissionMapBackground from '@/components/missions/MissionMapBackground'
import { MISSION_MAPS, getMissionMap } from '@/lib/missions/maps'
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
import {
  duplicateMission,
  type StudentProgressRow,
} from '@/lib/missions/extra-actions'
import { validateMission } from '@/lib/missions/validate'
import AsyncButton from '@/components/ui/AsyncButton'
import ClassroomProgressTable from '@/components/missions/ClassroomProgressTable'
import MissionValidationBadge from '@/components/missions/MissionValidationBadge'

type Tab = 'map' | 'progress'

type Props = {
  classroomId: string
  classroomName: string
  initialMission: Mission
  initialNodes: MissionNode[]
  initialEdges: MissionEdge[]
  initialProgress: StudentProgressRow[]
}

export default function MissionEditor({
  classroomId,
  classroomName,
  initialMission,
  initialNodes,
  initialEdges,
  initialProgress,
}: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('map')

  const [savedMission, setSavedMission] = useState<Mission>(initialMission)
  const [draftMission, setDraftMission] = useState<Mission>(initialMission)
  const [nodes, setNodes] = useState<MissionNode[]>(initialNodes)
  const [edges, setEdges] = useState<MissionEdge[]>(initialEdges)

  const [editingNode, setEditingNode] = useState<MissionNode | null>(null)
  const [isNewNode, setIsNewNode] = useState(false)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveOk, setSaveOk] = useState<null | 'ok' | 'err'>(null)

  const mapRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{
    nodeId: string
    startX: number
    startY: number
    moved: boolean
  } | null>(null)

  const validationIssues = useMemo(
    () => validateMission(nodes, edges),
    [nodes, edges]
  )

  const isDirty = useMemo(
    () =>
      JSON.stringify({
        name: draftMission.name,
        description: draftMission.description,
        background_id: draftMission.background_id,
        is_active: draftMission.is_active,
        final_xp_reward: draftMission.final_xp_reward,
        final_hearts_reward: draftMission.final_hearts_reward,
        final_mana_reward: draftMission.final_mana_reward,
      }) !==
      JSON.stringify({
        name: savedMission.name,
        description: savedMission.description,
        background_id: savedMission.background_id,
        is_active: savedMission.is_active,
        final_xp_reward: savedMission.final_xp_reward,
        final_hearts_reward: savedMission.final_hearts_reward,
        final_mana_reward: savedMission.final_mana_reward,
      }),
    [draftMission, savedMission]
  )

  useEffect(() => {
    if (!isDirty) return
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  async function handleSaveMission() {
    setSaving(true)
    setSaveOk(null)
    const result = await updateMission(draftMission.id, {
      name: draftMission.name,
      description: draftMission.description,
      background_id: draftMission.background_id,
      is_active: draftMission.is_active,
      final_xp_reward: draftMission.final_xp_reward,
      final_hearts_reward: draftMission.final_hearts_reward,
      final_mana_reward: draftMission.final_mana_reward,
    })
    setSaving(false)
    if (result.success) {
      setSavedMission(draftMission)
      setSaveOk('ok')
      window.setTimeout(() => setSaveOk(null), 2200)
    } else {
      setSaveOk('err')
      alert(`Errorea gordetzean: ${result.error}`)
    }
  }

  async function handleDuplicate() {
    if (!window.confirm('Misio honen kopia bat sortu nahi duzu?')) return
    const result = await duplicateMission(savedMission.id)
    if (!result.success) {
      alert(`Errorea: ${result.error}`)
      return
    }
    router.push(`/panela/ikasgela/${classroomId}/misioak/${result.newMissionId}`)
  }

  async function handleAddNode(percentX: number, percentY: number) {
    const isFirst = nodes.length === 0
    const result = await createNode(savedMission.id, {
      title: isFirst ? 'Lehen helburua' : 'Helburu berria',
      position_x: percentX,
      position_y: percentY,
      is_start: isFirst,
    })
    if (!result.success) {
      alert(result.error)
      return
    }
    setNodes((prev) => [...prev, result.node])
    setIsNewNode(true)
    setEditingNode(result.node)
  }

  function onMapClick(e: React.MouseEvent) {
    if (connectingFrom) {
      setConnectingFrom(null)
      return
    }
    if (!mapRef.current) return
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
      if (connectingFrom !== node.id) {
        void handleCreateEdge(connectingFrom, node.id, 'always')
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
        const n = nodes.find((nn) => nn.id === drag.nodeId)
        if (n) {
          setIsNewNode(false)
          setEditingNode(n)
        }
      }
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
  }, [nodes])

  async function handleCreateEdge(
    fromId: string,
    toId: string,
    condition: 'always' | 'success' | 'failure' = 'always'
  ) {
    if (
      edges.some(
        (e) =>
          e.from_node_id === fromId &&
          e.to_node_id === toId &&
          e.condition === condition
      )
    )
      return
    const result = await createEdge(savedMission.id, {
      from_node_id: fromId,
      to_node_id: toId,
      condition,
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
    await setStartNode(savedMission.id, nodeId)
    setNodes((prev) => prev.map((n) => ({ ...n, is_start: n.id === nodeId })))
  }

  async function handleSaveNode(updated: MissionNode, predecessorId?: string) {
    const result = await updateNode(updated.id, updated)
    if (!result.success) {
      alert(result.error)
      return
    }
    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    if (predecessorId) {
      await handleCreateEdge(predecessorId, updated.id, 'always')
    }
    setEditingNode(null)
    setIsNewNode(false)
  }

  async function handleCancelNewNode(nodeId: string) {
    const result = await deleteNode(nodeId)
    if (result.success) {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId))
    }
    setEditingNode(null)
    setIsNewNode(false)
  }

  async function handleDeleteMission() {
    if (!window.confirm('Misio osoa ezabatuko da. Ziur?')) return
    const result = await deleteMission(savedMission.id)
    if (result.success) {
      window.location.href = `/panela/ikasgela/${classroomId}/misioak`
    }
  }

  const currentMap = getMissionMap(draftMission.background_id)

  return (
    <div className="mission-editor">
      <header className="mission-editor-header">
        <Link
          href={`/panela/ikasgela/${classroomId}/misioak`}
          className="panel-breadcrumb"
        >
          ← Misioak
        </Link>
        <h1 className="mission-editor-title">{draftMission.name || 'Misioa'}</h1>
        <span
          className={`mission-editor-state mission-editor-state-${
            savedMission.is_active ? 'active' : 'inactive'
          }`}
        >
          {savedMission.is_active ? '● Aktibo' : '○ Ezkutatuta'}
        </span>
        <MissionValidationBadge issues={validationIssues} />

        <div className="mission-editor-header-actions">
          {tab === 'map' && (
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
          )}
          <button
            type="button"
            className="mission-editor-action"
            onClick={handleDuplicate}
            title="Misio honen kopia sortu"
          >
            📋 Bikoiztu
          </button>

          <AsyncButton
            className={`mission-editor-save-btn ${
              isDirty ? 'mission-editor-save-btn-dirty' : ''
            }`}
            onClick={handleSaveMission}
            disabled={!isDirty || saving}
          >
            {saveOk === 'ok'
              ? '✓ Gordeta'
              : isDirty
              ? '● Gorde aldaketak'
              : 'Gordeta'}
          </AsyncButton>
        </div>
      </header>

      {isDirty && (
        <div className="mission-editor-dirty-banner">
          Aldaketak gorde gabe daude. Sakatu «Gorde aldaketak» finkatzeko.
        </div>
      )}

      {/* TABS */}
      <div className="mission-editor-tabs">
        <button
          type="button"
          className={`mission-editor-tab ${tab === 'map' ? 'mission-editor-tab-active' : ''}`}
          onClick={() => setTab('map')}
        >
          🗺️ Mapa eta nodoak
        </button>
        <button
          type="button"
          className={`mission-editor-tab ${tab === 'progress' ? 'mission-editor-tab-active' : ''}`}
          onClick={() => setTab('progress')}
        >
          📊 Klasearen aurrerapena
        </button>
      </div>

      {tab === 'map' && (
        <div className="mission-editor-body">
          <div
            className="mission-editor-canvas"
            ref={mapRef}
            onClick={onMapClick}
          >
            <MissionMapBackground mapId={draftMission.background_id} />

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
                  {node.hearts_delta !== 0 &&
                    ` ${node.hearts_delta > 0 ? '+' : ''}${node.hearts_delta}❤`}
                </span>
              </button>
            ))}

            {nodes.length === 0 && (
              <div className="mission-editor-hint">
                Sakatu mapan lehen helburua sortzeko
              </div>
            )}
          </div>

          <aside className="mission-editor-sidebar">
            <section className="mission-editor-section">
              <h3>Misioaren konfigurazioa</h3>
              <div className="form-field">
                <label htmlFor="mission-name">Izena</label>
                <input
                  id="mission-name"
                  type="text"
                  value={draftMission.name}
                  onChange={(e) =>
                    setDraftMission({ ...draftMission, name: e.target.value })
                  }
                  maxLength={120}
                />
              </div>
              <div className="form-field">
                <label htmlFor="mission-desc">Sarrera narratiboa</label>
                <textarea
                  id="mission-desc"
                  rows={3}
                  value={draftMission.description}
                  onChange={(e) =>
                    setDraftMission({
                      ...draftMission,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <label className="mission-editor-toggle">
                <input
                  type="checkbox"
                  checked={draftMission.is_active}
                  onChange={(e) =>
                    setDraftMission({
                      ...draftMission,
                      is_active: e.target.checked,
                    })
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
                      checked={draftMission.background_id === map.id}
                      onChange={() =>
                        setDraftMission({
                          ...draftMission,
                          background_id: map.id,
                        })
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
                Misio osoa amaitzean gehigarriak (helburu guztiak osatuta).
              </p>
              <div className="mission-editor-rewards-grid">
                <div className="form-field-compact">
                  <label>⚡ XP</label>
                  <input
                    type="number"
                    value={draftMission.final_xp_reward}
                    onChange={(e) =>
                      setDraftMission({
                        ...draftMission,
                        final_xp_reward: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="form-field-compact">
                  <label>❤ Bihotzak</label>
                  <input
                    type="number"
                    value={draftMission.final_hearts_reward}
                    onChange={(e) =>
                      setDraftMission({
                        ...draftMission,
                        final_hearts_reward: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="form-field-compact">
                  <label>🔮 Mana</label>
                  <input
                    type="number"
                    value={draftMission.final_mana_reward}
                    onChange={(e) =>
                      setDraftMission({
                        ...draftMission,
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
      )}

      {tab === 'progress' && (
        <div className="mission-editor-progress-tab">
          <ClassroomProgressTable rows={initialProgress} />
        </div>
      )}

      {editingNode && (
        <NodeEditorModal
          node={editingNode}
          isNewNode={isNewNode}
          isOnlyNode={nodes.length === 1}
          allNodes={nodes}
          edges={edges}
          onClose={() => {
            if (isNewNode) {
              void handleCancelNewNode(editingNode.id)
            } else {
              setEditingNode(null)
            }
          }}
          onSave={handleSaveNode}
          onDelete={() => handleDeleteNode(editingNode.id)}
          onSetStart={() => handleSetStart(editingNode.id)}
          onCreateEdge={async (toId, condition) => {
            await handleCreateEdge(editingNode.id, toId, condition)
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
// NodeEditorModal (idéntico al de v2)
// ============================================================
function NodeEditorModal({
  node,
  isNewNode,
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
  isNewNode: boolean
  isOnlyNode: boolean
  allNodes: MissionNode[]
  edges: MissionEdge[]
  onClose: () => void
  onSave: (n: MissionNode, predecessorId?: string) => Promise<void>
  onDelete: () => void
  onSetStart: () => void
  onCreateEdge: (
    toId: string,
    condition: 'always' | 'success' | 'failure'
  ) => Promise<void>
  onDeleteEdge: (edgeId: string) => Promise<void>
}) {
  const [draft, setDraft] = useState<MissionNode>(node)
  const [predecessorId, setPredecessorId] = useState<string>('')
  const [newEdgeTo, setNewEdgeTo] = useState<string>('')
  const [newEdgeCondition, setNewEdgeCondition] =
    useState<'always' | 'success' | 'failure'>('always')

  const candidatePredecessors = allNodes.filter((n) => n.id !== node.id)
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
          <h2>
            {isNewNode ? '+ Helburu berria' : ''}
            {!isNewNode && draft.is_start ? '★ ' : ''}
            {!isNewNode && (draft.title || 'Helburua')}
          </h2>
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
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              maxLength={120}
              autoFocus
            />
          </div>

          {isNewNode && candidatePredecessors.length > 0 && (
            <div className="form-field node-editor-predecessor">
              <label>Aurreko nodoa</label>
              <select
                value={predecessorId}
                onChange={(e) => setPredecessorId(e.target.value)}
              >
                <option value="">— Hau erro-nodoa da (aurrekorik gabe) —</option>
                {candidatePredecessors.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.is_start ? '★ ' : ''}
                    {n.title}
                  </option>
                ))}
              </select>
              <p className="node-editor-hint-inline">
                Aukeratu zein nodotik desblokeatzen den hau.
              </p>
            </div>
          )}

          {isNewNode && candidatePredecessors.length === 0 && (
            <div className="node-editor-info-banner">
              ✨ Hau misioko lehen nodoa da. Automatikoki hasierakoa izango da.
            </div>
          )}

          <div className="form-field">
            <label>Helburuaren azalpena</label>
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
              <label>❤ Bihotzak</label>
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

          {!isNewNode && (
            <div className="node-editor-section">
              <h4>Hurrengo nodoak</h4>
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
                    <option value="">— Hurrengo nodoa —</option>
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
          )}

          {!isNewNode && !draft.is_start && (
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
          {!isNewNode && !isOnlyNode && (
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
            {isNewNode ? 'Utzi (ezabatu)' : 'Utzi'}
          </button>
          <AsyncButton
            className="panel-cta-btn"
            onClick={() =>
              onSave(draft, isNewNode ? predecessorId || undefined : undefined)
            }
          >
            {isNewNode ? 'Sortu nodoa' : 'Gorde'}
          </AsyncButton>
        </footer>
      </div>
    </div>
  )
}
