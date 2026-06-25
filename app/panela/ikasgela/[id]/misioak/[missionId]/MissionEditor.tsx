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

// IDs locales (no llegan al servidor hasta Gorde)
function localId() {
  return `local-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

function nodesEqual(a: MissionNode, b: MissionNode): boolean {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.position_x === b.position_x &&
    a.position_y === b.position_y &&
    a.content_type === b.content_type &&
    a.content_url === b.content_url &&
    a.content_text === b.content_text &&
    a.validation_type === b.validation_type &&
    a.xp_reward === b.xp_reward &&
    a.hearts_delta === b.hearts_delta &&
    a.mana_reward === b.mana_reward &&
    a.hearts_penalty === b.hearts_penalty &&
    a.is_start === b.is_start
  )
}

function missionEqual(a: Mission, b: Mission): boolean {
  return (
    a.name === b.name &&
    a.description === b.description &&
    a.background_id === b.background_id &&
    a.is_active === b.is_active &&
    a.final_xp_reward === b.final_xp_reward &&
    a.final_hearts_reward === b.final_hearts_reward &&
    a.final_mana_reward === b.final_mana_reward
  )
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

  // Estado "guardado" (último confirmado en server)
  const [savedMission, setSavedMission] = useState<Mission>(initialMission)
  const [savedNodes, setSavedNodes] = useState<MissionNode[]>(initialNodes)
  const [savedEdges, setSavedEdges] = useState<MissionEdge[]>(initialEdges)

  // Estado "draft" (lo que ve el usuario)
  const [draftMission, setDraftMission] = useState<Mission>(initialMission)
  const [draftNodes, setDraftNodes] = useState<MissionNode[]>(initialNodes)
  const [draftEdges, setDraftEdges] = useState<MissionEdge[]>(initialEdges)
  const [deletedEdgeIds, setDeletedEdgeIds] = useState<Set<string>>(new Set())

  const [editingNode, setEditingNode] = useState<MissionNode | null>(null)
  const [isNewNode, setIsNewNode] = useState(false)
  const [saveOk, setSaveOk] = useState<null | 'ok' | 'err'>(null)

  const mapRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{
    nodeId: string
    startX: number
    startY: number
    moved: boolean
  } | null>(null)

  const validationIssues = useMemo(
    () => validateMission(draftNodes, draftEdges),
    [draftNodes, draftEdges]
  )

  // Detectar cambios sin guardar
  const isDirty = useMemo(() => {
    if (!missionEqual(draftMission, savedMission)) return true
    if (draftNodes.length !== savedNodes.length) return true
    for (const d of draftNodes) {
      const s = savedNodes.find((n) => n.id === d.id)
      if (!s) return true
      if (!nodesEqual(s, d)) return true
    }
    // Edges nuevos (id local)
    if (draftEdges.some((e) => e.id.startsWith('local-'))) return true
    // Edges eliminados
    if (deletedEdgeIds.size > 0) return true
    return false
  }, [
    draftMission,
    savedMission,
    draftNodes,
    savedNodes,
    draftEdges,
    deletedEdgeIds,
  ])

  // Beforeunload warning
  useEffect(() => {
    if (!isDirty) return
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  // ============================================================
  // GUARDAR TODO
  // ============================================================
  async function handleSaveAll() {
    setSaveOk(null)
    try {
      // 1. Misión
      if (!missionEqual(draftMission, savedMission)) {
        const r = await updateMission(draftMission.id, {
          name: draftMission.name,
          description: draftMission.description,
          background_id: draftMission.background_id,
          is_active: draftMission.is_active,
          final_xp_reward: draftMission.final_xp_reward,
          final_hearts_reward: draftMission.final_hearts_reward,
          final_mana_reward: draftMission.final_mana_reward,
        })
        if (!r.success) throw new Error(r.error)
      }

      // 2. Nodos modificados (no nuevos — los nuevos ya están en server)
      for (const d of draftNodes) {
        const s = savedNodes.find((n) => n.id === d.id)
        if (!s) continue
        if (!nodesEqual(s, d)) {
          const r = await updateNode(d.id, {
            title: d.title,
            description: d.description,
            position_x: d.position_x,
            position_y: d.position_y,
            content_type: d.content_type,
            content_url: d.content_url,
            content_text: d.content_text,
            validation_type: d.validation_type,
            xp_reward: d.xp_reward,
            hearts_delta: d.hearts_delta,
            mana_reward: d.mana_reward,
            hearts_penalty: d.hearts_penalty,
          })
          if (!r.success) throw new Error(r.error)
        }
      }

      // 3. Start node si cambió
      const draftStart = draftNodes.find((n) => n.is_start)
      const savedStart = savedNodes.find((n) => n.is_start)
      if (draftStart && draftStart.id !== savedStart?.id) {
        await setStartNode(draftMission.id, draftStart.id)
      }

      // 4. Edges nuevos (con id local)
      const finalEdges: MissionEdge[] = []
      for (const e of draftEdges) {
        if (e.id.startsWith('local-')) {
          const r = await createEdge(draftMission.id, {
            from_node_id: e.from_node_id,
            to_node_id: e.to_node_id,
            condition: e.condition,
          })
          if (r.success) finalEdges.push(r.edge)
        } else {
          finalEdges.push(e)
        }
      }

      // 5. Edges eliminados (los reales)
      for (const edgeId of deletedEdgeIds) {
        await deleteEdge(edgeId)
      }

      // Confirmar estado guardado
      setSavedMission(draftMission)
      setSavedNodes(draftNodes)
      setSavedEdges(finalEdges)
      setDraftEdges(finalEdges)
      setDeletedEdgeIds(new Set())
      setSaveOk('ok')
      window.setTimeout(() => setSaveOk(null), 2200)
    } catch (err) {
      setSaveOk('err')
      const msg = err instanceof Error ? err.message : 'Errore ezezaguna'
      alert(`Errorea gordetzean: ${msg}`)
    }
  }

  // ============================================================
  // DESCARTAR cambios
  // ============================================================
  function handleDiscard() {
    if (!window.confirm('Gorde gabeko aldaketak galduko dira. Ziur?')) return
    setDraftMission(savedMission)
    setDraftNodes(savedNodes)
    setDraftEdges(savedEdges)
    setDeletedEdgeIds(new Set())
  }

  // ============================================================
  // DUPLICAR
  // ============================================================
  async function handleDuplicate() {
    if (isDirty) {
      if (
        !window.confirm(
          'Aldaketak gabe daude. Bikoiztu aurretik gorde nahi duzu? OK = bikoiztu hala ere, Utzi = gelditu.'
        )
      )
        return
    }
    const result = await duplicateMission(savedMission.id)
    if (!result.success) {
      alert(`Errorea: ${result.error}`)
      return
    }
    router.push(`/panela/ikasgela/${classroomId}/misioak/${result.newMissionId}`)
  }

  // ============================================================
  // NODOS
  // ============================================================
  // Crear nodo es síncrono (necesitamos el ID real)
  async function handleAddNode(percentX: number, percentY: number) {
    const isFirst = draftNodes.length === 0
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
    setSavedNodes((prev) => [...prev, result.node])
    setDraftNodes((prev) => [...prev, result.node])
    setIsNewNode(true)
    setEditingNode(result.node)
  }

  function onMapClick(e: React.MouseEvent) {
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
      // Solo en draft, no en server
      setDraftNodes((prev) =>
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
    function onUp() {
      const drag = dragRef.current
      dragRef.current = null
      if (!drag) return
      if (!drag.moved) {
        const n = draftNodes.find((nn) => nn.id === drag.nodeId)
        if (n) {
          setIsNewNode(false)
          setEditingNode(n)
        }
      }
      // Si moved, no hacemos nada — ya está en el draft local
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
  }, [draftNodes])

  // Eliminar nodo: síncrono (también limpia edges)
  async function handleDeleteNode(nodeId: string) {
    if (!window.confirm('Helburu hau eta bere konexioak ezabatu?')) return
    const result = await deleteNode(nodeId)
    if (result.success) {
      setSavedNodes((prev) => prev.filter((n) => n.id !== nodeId))
      setDraftNodes((prev) => prev.filter((n) => n.id !== nodeId))
      // Quitar edges del draft Y del saved que referencian este nodo
      setSavedEdges((prev) =>
        prev.filter((e) => e.from_node_id !== nodeId && e.to_node_id !== nodeId)
      )
      setDraftEdges((prev) =>
        prev.filter((e) => e.from_node_id !== nodeId && e.to_node_id !== nodeId)
      )
      // Limpiar deletedEdgeIds que ya no son válidos
      setDeletedEdgeIds(new Set())
      setEditingNode(null)
      setIsNewNode(false)
    }
  }

  // Cancelar nodo nuevo: lo eliminamos del server (porque ya está creado)
  async function handleCancelNewNode(nodeId: string) {
    const result = await deleteNode(nodeId)
    if (result.success) {
      setSavedNodes((prev) => prev.filter((n) => n.id !== nodeId))
      setDraftNodes((prev) => prev.filter((n) => n.id !== nodeId))
    }
    setEditingNode(null)
    setIsNewNode(false)
  }

  function handleSetStart(nodeId: string) {
    setDraftNodes((prev) => prev.map((n) => ({ ...n, is_start: n.id === nodeId })))
  }

  // Aplicar cambios del modal de nodo SOLO al draft local
  function handleApplyNodeEdit(updated: MissionNode, predecessorId?: string) {
    setDraftNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    if (predecessorId) {
      const newEdge: MissionEdge = {
        id: localId(),
        mission_id: savedMission.id,
        from_node_id: predecessorId,
        to_node_id: updated.id,
        condition: 'always',
      }
      setDraftEdges((prev) => [...prev, newEdge])
    }
    setEditingNode(null)
    setIsNewNode(false)
  }

  // ============================================================
  // EDGES (todo en draft)
  // ============================================================
  function handleAddEdgeLocal(
    fromId: string,
    toId: string,
    condition: 'always' | 'success' | 'failure'
  ) {
    if (
      draftEdges.some(
        (e) =>
          e.from_node_id === fromId &&
          e.to_node_id === toId &&
          e.condition === condition
      )
    )
      return
    const newEdge: MissionEdge = {
      id: localId(),
      mission_id: savedMission.id,
      from_node_id: fromId,
      to_node_id: toId,
      condition,
    }
    setDraftEdges((prev) => [...prev, newEdge])
  }

  function handleRemoveEdgeLocal(edgeId: string) {
    setDraftEdges((prev) => prev.filter((e) => e.id !== edgeId))
    if (!edgeId.startsWith('local-')) {
      setDeletedEdgeIds((prev) => new Set(prev).add(edgeId))
    }
  }

  // ============================================================
  // ELIMINAR MISIÓN — fix 404
  // ============================================================
  async function handleDeleteMission() {
    if (!window.confirm('Misio osoa ezabatuko da. Ziur?')) return
    // Navegamos ANTES de borrar para no quedar en la página borrada
    router.push(`/panela/ikasgela/${classroomId}/misioak`)
    // Esperar un tick para que la navegación arranque
    await new Promise((r) => window.setTimeout(r, 50))
    await deleteMission(savedMission.id)
    router.refresh()
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
          {isDirty && (
            <button
              type="button"
              className="mission-editor-discard-btn"
              onClick={handleDiscard}
              title="Aldaketak baztertu"
            >
              ↺ Baztertu
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
            onClick={handleSaveAll}
            disabled={!isDirty}
          >
            {saveOk === 'ok' ? '✓ Gordeta' : isDirty ? '● Gorde aldaketak' : 'Dena gordeta'}
          </AsyncButton>
        </div>
      </header>

      {isDirty && (
        <div className="mission-editor-dirty-banner">
          Gorde gabeko aldaketak dituzu. Sakatu «Gorde aldaketak» finkatzeko, edo «Baztertu» kentzeko.
        </div>
      )}

      {/* TABS */}
      <div className="mission-editor-tabs">
        <button
          type="button"
          className={`mission-editor-tab ${tab === 'map' ? 'mission-editor-tab-active' : ''}`}
          onClick={() => setTab('map')}
        >
          <span className="mission-editor-tab-icon">🗺️</span>
          <span>Mapa eta nodoak</span>
        </button>
        <button
          type="button"
          className={`mission-editor-tab ${tab === 'progress' ? 'mission-editor-tab-active' : ''}`}
          onClick={() => setTab('progress')}
        >
          <span className="mission-editor-tab-icon">📊</span>
          <span>Klasearen aurrerapena</span>
          {initialProgress.some((r) => r.pending_review > 0) && (
            <span className="mission-editor-tab-badge">
              {initialProgress.reduce((a, r) => a + r.pending_review, 0)}
            </span>
          )}
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
              {draftEdges.map((edge) => {
                const from = draftNodes.find((n) => n.id === edge.from_node_id)
                const to = draftNodes.find((n) => n.id === edge.to_node_id)
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
                      if (window.confirm('Konexioa kendu?')) {
                        handleRemoveEdgeLocal(edge.id)
                      }
                    }}
                    style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  />
                )
              })}
            </svg>

            {draftNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className={`mission-node-marker ${
                  node.is_start ? 'mission-node-marker-start' : ''
                }`}
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

            {draftNodes.length === 0 && (
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
                <li>📍 {draftNodes.length} helburu</li>
                <li>🔗 {draftEdges.length} konexio</li>
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
          isOnlyNode={draftNodes.length === 1}
          allNodes={draftNodes}
          edges={draftEdges}
          onClose={() => {
            if (isNewNode) {
              void handleCancelNewNode(editingNode.id)
            } else {
              setEditingNode(null)
            }
          }}
          onApply={handleApplyNodeEdit}
          onDelete={() => handleDeleteNode(editingNode.id)}
          onSetStart={() => handleSetStart(editingNode.id)}
          onAddEdge={(toId, condition) =>
            handleAddEdgeLocal(editingNode.id, toId, condition)
          }
          onRemoveEdge={(edgeId) => handleRemoveEdgeLocal(edgeId)}
        />
      )}
    </div>
  )
}

// ============================================================
// NodeEditorModal — ahora "Aplikatu" en lugar de "Gorde"
// ============================================================
function NodeEditorModal({
  node,
  isNewNode,
  isOnlyNode,
  allNodes,
  edges,
  onClose,
  onApply,
  onDelete,
  onSetStart,
  onAddEdge,
  onRemoveEdge,
}: {
  node: MissionNode
  isNewNode: boolean
  isOnlyNode: boolean
  allNodes: MissionNode[]
  edges: MissionEdge[]
  onClose: () => void
  onApply: (n: MissionNode, predecessorId?: string) => void
  onDelete: () => void
  onSetStart: () => void
  onAddEdge: (toId: string, condition: 'always' | 'success' | 'failure') => void
  onRemoveEdge: (edgeId: string) => void
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
      n.id !== node.id && !outgoingEdges.some((e) => e.to_node_id === n.id)
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
                          onClick={() => onRemoveEdge(edge.id)}
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
                  <button
                    type="button"
                    className="node-editor-edge-add-btn"
                    onClick={() => {
                      if (!newEdgeTo) return
                      onAddEdge(newEdgeTo, newEdgeCondition)
                      setNewEdgeTo('')
                    }}
                    disabled={!newEdgeTo}
                  >
                    + Konektatu
                  </button>
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
            {isNewNode ? 'Utzi (ezabatu)' : 'Itxi'}
          </button>
          <button
            type="button"
            className="panel-cta-btn"
            onClick={() =>
              onApply(draft, isNewNode ? predecessorId || undefined : undefined)
            }
          >
            {isNewNode ? 'Sortu nodoa' : 'Aplikatu'}
          </button>
        </footer>
      </div>
    </div>
  )
}
