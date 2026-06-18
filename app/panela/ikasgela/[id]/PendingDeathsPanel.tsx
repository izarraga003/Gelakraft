'use client'

import { useState } from 'react'
import { executeSentence, type PendingDeathStudent } from '@/lib/patuak/actions'
import { sanitizeAvatarConfig, type AvatarConfig } from '@/lib/students/avatar'
import AvatarRender from '@/components/student/AvatarRender'

type Props = {
  classroomId: string
  students: PendingDeathStudent[]
}

export default function PendingDeathsPanel({ classroomId, students: initial }: Props) {
  const [students, setStudents] = useState<PendingDeathStudent[]>(initial)
  const [busy, setBusy] = useState(false)
  const [revealed, setRevealed] = useState<{
    studentName: string
    consequence: string
  } | null>(null)

  async function handleExecute(studentId: string) {
    setBusy(true)
    const result = await executeSentence(studentId, classroomId)
    setBusy(false)
    if (!result.success) {
      alert(`Errorea: ${result.error}`)
      return
    }
    setStudents((prev) => prev.filter((s) => s.id !== studentId))
    setRevealed({
      studentName: result.studentName,
      consequence: result.consequence,
    })
  }

  return (
    <section className="patua-panel" aria-label="Patua zain duten ikasleak">
      <header className="patua-panel-header">
        <span className="patua-panel-icon" aria-hidden="true">🎲</span>
        <div>
          <h2 className="patua-panel-title">
            Patua zain · {students.length}{' '}
            {students.length === 1 ? 'ikasle' : 'ikasle'}
          </h2>
          <p className="patua-panel-hint">
            Ikasle hauek bihotz guztiak galdu dituzte. Sakatu botoia patua
            ausaz exekutatzeko eta bihotzak berreskuratzeko.
          </p>
        </div>
      </header>

      <ul className="patua-list">
        {students.map((s) => {
          const cfg = sanitizeAvatarConfig(
            s.avatar_config as AvatarConfig,
            99
          )
          return (
            <li key={s.id} className="patua-item">
              <span className="patua-item-avatar">
                <AvatarRender config={cfg} size={48} />
              </span>
              <span className="patua-item-name">{s.full_name}</span>
              <button
                type="button"
                className="patua-execute-btn"
                onClick={() => handleExecute(s.id)}
                disabled={busy}
              >
                🎲 Patua exekutatu
              </button>
            </li>
          )
        })}
      </ul>

      {revealed && (
        <div
          className="avatar-picker-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRevealed(null)
          }}
          role="dialog"
        >
          <div className="patua-reveal-modal">
            <div className="patua-reveal-dice">🎲</div>
            <h3 className="patua-reveal-title">
              Mariren patua {revealed.studentName} ikaslearentzat:
            </h3>
            <p className="patua-reveal-text">{revealed.consequence}</p>
            <button
              type="button"
              className="panel-cta-btn"
              onClick={() => setRevealed(null)}
            >
              Ulertuta
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
