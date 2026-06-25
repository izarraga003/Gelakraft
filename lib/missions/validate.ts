import type { MissionNode, MissionEdge } from './types'

export type ValidationIssue = {
  severity: 'error' | 'warning'
  kind:
    | 'no_nodes'
    | 'no_start'
    | 'multiple_starts'
    | 'orphan'
    | 'no_content'
    | 'unreachable'
    | 'dead_end'
  nodeId?: string
  nodeTitle?: string
  message: string
}

/**
 * Valida una misión en cliente.
 * Devuelve issues con severity 'error' (bloquean lógicamente la experiencia
 * del alumno) y 'warning' (no rompen pero conviene arreglar).
 */
export function validateMission(
  nodes: MissionNode[],
  edges: MissionEdge[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (nodes.length === 0) {
    issues.push({
      severity: 'error',
      kind: 'no_nodes',
      message: 'Misioak ez du helbururik. Sortu gutxienez bat.',
    })
    return issues
  }

  // Nodo inicial
  const starts = nodes.filter((n) => n.is_start)
  if (starts.length === 0) {
    issues.push({
      severity: 'error',
      kind: 'no_start',
      message: 'Ez dago hasierako nodorik markaturik (★).',
    })
  } else if (starts.length > 1) {
    issues.push({
      severity: 'warning',
      kind: 'multiple_starts',
      message: `${starts.length} hasierako nodo daude. Bakarra izan beharko luke.`,
    })
  }

  // BFS desde el start node para detectar unreachable
  const startId = starts[0]?.id ?? nodes[0]?.id
  const reachable = new Set<string>()
  if (startId) {
    const queue = [startId]
    reachable.add(startId)
    while (queue.length > 0) {
      const cur = queue.shift()!
      for (const e of edges) {
        if (e.from_node_id === cur && !reachable.has(e.to_node_id)) {
          reachable.add(e.to_node_id)
          queue.push(e.to_node_id)
        }
      }
    }
  }

  for (const n of nodes) {
    const hasIncoming = edges.some((e) => e.to_node_id === n.id)
    const hasOutgoing = edges.some((e) => e.from_node_id === n.id)

    // Huérfano: sin incoming, no es start, ni tiene outgoing
    if (!hasIncoming && !n.is_start && !hasOutgoing) {
      issues.push({
        severity: 'warning',
        kind: 'orphan',
        nodeId: n.id,
        nodeTitle: n.title,
        message: `«${n.title}» loturarik gabe dago.`,
      })
    }

    // Inalcanzable: no se llega desde el start
    if (!reachable.has(n.id) && !n.is_start) {
      issues.push({
        severity: 'warning',
        kind: 'unreachable',
        nodeId: n.id,
        nodeTitle: n.title,
        message: `«${n.title}» ezin da hasierako nodotik iritsi.`,
      })
    }

    // Sin contenido: description vacía Y content_url vacío
    if (!n.description?.trim() && !n.content_url?.trim()) {
      issues.push({
        severity: 'warning',
        kind: 'no_content',
        nodeId: n.id,
        nodeTitle: n.title,
        message: `«${n.title}» edukirik gabe dago (ez azalpenik, ez URLrik).`,
      })
    }
  }

  return issues
}
