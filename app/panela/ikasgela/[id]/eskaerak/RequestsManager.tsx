'use client'

import { useState } from 'react'
import {
  approveRequest,
  denyRequest,
  type PowerRequestWithStudents,
} from '@/lib/powers/actions'
import { findPowerById } from '@/lib/powers/catalog'
import { relativeTimeEu } from '@/lib/utils/relative-time'

type Props = {
  classroomId: string
  initialRequests: PowerRequestWithStudents[]
}

export default function RequestsManager({
  classroomId,
  initialRequests,
}: Props) {
  const [requests, setRequests] = useState<PowerRequestWithStudents[]>(initialRequests)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove(r: PowerRequestWithStudents) {
    setBusy(true)
    setError(null)
    const result = await approveRequest(r.id, classroomId)
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    setRequests((prev) => prev.filter((x) => x.id !== r.id))
  }

  async function handleDeny(r: PowerRequestWithStudents) {
    if (!window.confirm(`Eskaera ukatu? "${r.power_name}" — ${r.student_name}\n\nManoa itzuliko zaio ikasleari.`))
      return
    setBusy(true)
    setError(null)
    const result = await denyRequest(r.id, classroomId)
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    setRequests((prev) => prev.filter((x) => x.id !== r.id))
  }

  if (requests.length === 0) {
    return (
      <div className="panel-empty-state">
        <p>Ez dago eskaera zain.</p>
        <p className="panel-empty-hint">
          Ikasleek poderak erabiltzean hemen agertuko zaizkizu onartzeko.
        </p>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="behaviors-error" role="alert">
          {error}
        </div>
      )}

      <ul className="requests-list">
        {requests.map((r) => {
          const power = findPowerById(r.power_id)
          return (
            <li key={r.id} className="request-item">
              <div className="request-icon" aria-hidden="true">
                {power?.icon ?? '✨'}
              </div>
              <div className="request-info">
                <div className="request-line-main">
                  <strong className="request-student">{r.student_name}</strong>
                  <span className="request-arrow">→</span>
                  <span className="request-power-name">{r.power_name}</span>
                </div>
                {power && (
                  <p className="request-desc">{power.description}</p>
                )}
                <div className="request-meta">
                  {r.target_student_name && (
                    <span className="request-target">
                      🎯 Helburua: <strong>{r.target_student_name}</strong>
                    </span>
                  )}
                  <span className="request-cost">🔮 {r.mana_cost} mana</span>
                  <span className="request-time">
                    {relativeTimeEu(r.created_at)}
                  </span>
                </div>
              </div>
              <div className="request-actions">
                <button
                  type="button"
                  className="request-approve-btn"
                  onClick={() => handleApprove(r)}
                  disabled={busy}
                >
                  ✓ Onartu
                </button>
                <button
                  type="button"
                  className="request-deny-btn"
                  onClick={() => handleDeny(r)}
                  disabled={busy}
                >
                  ✕ Ukatu
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
