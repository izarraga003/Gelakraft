'use client'

import { useState, useTransition } from 'react'
import { regeneratePassword, deleteStudent } from '@/lib/students/actions'
import { updateStudentHeroClass } from '@/lib/classroom/settings'
import {
  HERO_CLASS_LABELS,
  type HeroClass,
} from '@/lib/students/hero-class'
import { xpToLevel } from '@/lib/students/level'

type Student = {
  id: string
  full_name: string
  username: string
  password_plain: string
  hero_class: HeroClass
  xp: number
  hearts: number
  max_hearts: number
  mana: number
  max_mana: number
}

type Props = {
  classroomId: string
  students: Student[]
}

export default function IkasleakTable({ classroomId, students: initial }: Props) {
  const [students, setStudents] = useState<Student[]>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleChangeClass(studentId: string, newClass: HeroClass) {
    setBusy(true)
    setError(null)
    const result = await updateStudentHeroClass(studentId, newClass, classroomId)
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, hero_class: newClass } : s))
    )
  }

  async function handleRegenerate(id: string) {
    if (
      !window.confirm(
        'Pasahitz berri bat sortu?\n\nIkasleak ezin izango du sartu pasahitz zaharrarekin.'
      )
    )
      return
    setBusy(true)
    setError(null)
    const result = await regeneratePassword(id)
    setBusy(false)
    if (result.success) {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, password_plain: result.newPassword } : s))
      )
    } else {
      setError(result.error ?? 'Errorea.')
    }
  }

  function handleDelete(s: Student) {
    if (
      !window.confirm(
        `Ziur ${s.full_name} ezabatu nahi duzula?\n\nEkintza hau ezin da desegin.`
      )
    )
      return
    startTransition(async () => {
      const result = await deleteStudent(s.id, classroomId)
      if (result.success) {
        setStudents((prev) => prev.filter((x) => x.id !== s.id))
      } else {
        setError(result.error ?? 'Errorea.')
      }
    })
  }

  return (
    <>
      {error && (
        <div className="behaviors-error" role="alert">
          {error}
        </div>
      )}

      <div className="ikasleak-table-wrapper">
        <table className="ikasleak-table">
          <thead>
            <tr>
              <th>Izena</th>
              <th>Erabiltzailea</th>
              <th>Pasahitza</th>
              <th>Klasea</th>
              <th>Mla</th>
              <th>XP</th>
              <th>🔮</th>
              <th>❤️</th>
              <th>Ekintzak</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const level = xpToLevel(s.xp)
              const isRevealed = revealed.has(s.id)
              return (
                <tr key={s.id}>
                  <td className="ikasleak-name">{s.full_name}</td>
                  <td>
                    <code className="ikasleak-mono">{s.username}</code>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="ikasleak-pass-btn"
                      onClick={() => toggleReveal(s.id)}
                      title={isRevealed ? 'Ezkutatu' : 'Erakutsi'}
                    >
                      <code className="ikasleak-mono">
                        {isRevealed ? s.password_plain : '••••••••'}
                      </code>
                    </button>
                  </td>
                  <td>
                    <select
                      value={s.hero_class}
                      onChange={(e) =>
                        handleChangeClass(s.id, e.target.value as HeroClass)
                      }
                      className={`ikasleak-class-select ikasleak-class-${s.hero_class}`}
                      disabled={busy}
                      aria-label="Klasea aldatu"
                    >
                      <option value="sorgina">Sorgina</option>
                      <option value="lamia">Lamia</option>
                      <option value="jentila">Jentila</option>
                    </select>
                  </td>
                  <td className="ikasleak-num">{level}</td>
                  <td className="ikasleak-num">{s.xp}</td>
                  <td className="ikasleak-num">
                    {s.mana}/{s.max_mana}
                  </td>
                  <td className="ikasleak-num">
                    {s.hearts}/{s.max_hearts}
                  </td>
                  <td>
                    <div className="ikasleak-actions">
                      <button
                        type="button"
                        className="ikasleak-action-btn"
                        onClick={() => handleRegenerate(s.id)}
                        disabled={busy}
                        title="Pasahitz berria"
                      >
                        🔁
                      </button>
                      <button
                        type="button"
                        className="ikasleak-action-btn ikasleak-action-danger"
                        onClick={() => handleDelete(s)}
                        disabled={busy}
                        title="Ezabatu"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={9} className="ikasleak-empty">
                  Ez dago ikaslerik.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Aviso de héroes ausentes */}
      {(() => {
        const has = { sorgina: false, lamia: false, jentila: false }
        for (const s of students) has[s.hero_class] = true
        const missing = (Object.keys(has) as HeroClass[]).filter((k) => !has[k])
        if (missing.length === 0) return null
        return (
          <p className="ikasleak-missing-warn">
            ⚠️ Falta dira: {missing.map((m) => HERO_CLASS_LABELS[m]).join(', ')}.
            Taldeak sor ditzakezu hala ere.
          </p>
        )
      })()}
    </>
  )
}
