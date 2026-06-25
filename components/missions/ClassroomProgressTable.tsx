import type { StudentProgressRow } from '@/lib/missions/extra-actions'

type Props = {
  rows: StudentProgressRow[]
}

export default function ClassroomProgressTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="classroom-progress-empty">
        Ikaslerik gabe edo oraindik ez du inork misioa abiarazi.
      </p>
    )
  }

  // Estadísticas resumidas
  const total = rows.length
  const completed = rows.filter((r) => r.fully_completed).length
  const inProgress = rows.filter(
    (r) => !r.fully_completed && (r.completed > 0 || r.available > 0 || r.pending_review > 0)
  ).length
  const notStarted = rows.filter(
    (r) =>
      !r.fully_completed &&
      r.completed === 0 &&
      r.available === 0 &&
      r.pending_review === 0
  ).length

  return (
    <div className="classroom-progress">
      <div className="classroom-progress-summary">
        <div className="cp-stat">
          <span className="cp-stat-value">{completed}</span>
          <span className="cp-stat-label">Amaituta</span>
        </div>
        <div className="cp-stat">
          <span className="cp-stat-value">{inProgress}</span>
          <span className="cp-stat-label">Bidean</span>
        </div>
        <div className="cp-stat">
          <span className="cp-stat-value">{notStarted}</span>
          <span className="cp-stat-label">Hasi gabe</span>
        </div>
        <div className="cp-stat cp-stat-total">
          <span className="cp-stat-value">{total}</span>
          <span className="cp-stat-label">Ikasle guztira</span>
        </div>
      </div>

      <div className="classroom-progress-table-wrapper">
        <table className="classroom-progress-table">
          <thead>
            <tr>
              <th>Ikaslea</th>
              <th>Aurrerapena</th>
              <th>Egungo nodoa</th>
              <th>Egoera</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pct =
                r.total_nodes > 0 ? Math.round((r.completed / r.total_nodes) * 100) : 0
              return (
                <tr key={r.student_id}>
                  <td>{r.student_name}</td>
                  <td>
                    <div className="cp-row-progress">
                      <div className="cp-row-progress-bar">
                        <div
                          className={`cp-row-progress-fill ${
                            r.fully_completed ? 'cp-row-progress-fill-done' : ''
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="cp-row-progress-text">
                        {r.completed}/{r.total_nodes}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="cp-row-current">
                      {r.fully_completed
                        ? '✓ Amaituta'
                        : r.current_node_title ?? '—'}
                    </span>
                  </td>
                  <td>
                    <div className="cp-row-badges">
                      {r.pending_review > 0 && (
                        <span className="cp-badge cp-badge-pending">
                          ⏳ {r.pending_review} zain
                        </span>
                      )}
                      {r.failed > 0 && (
                        <span className="cp-badge cp-badge-failed">
                          ✗ {r.failed}
                        </span>
                      )}
                      {r.fully_completed && (
                        <span className="cp-badge cp-badge-done">★ Bukatuta</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
