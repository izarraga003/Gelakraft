'use client'

import { useState, useTransition } from 'react'
import { regeneratePassword, deleteStudent } from '@/lib/students/actions'
import {
  HERO_CLASS_LABELS,
  type HeroClass,
} from '@/lib/students/hero-class'

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
  created_at: string
}

type StudentsTableProps = {
  students: Student[]
  classroomId: string
}

export default function StudentsTable({
  students: initialStudents,
  classroomId,
}: StudentsTableProps) {
  const [students, setStudents] = useState(initialStudents)
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleRegenerate(studentId: string) {
    const confirmed = window.confirm(
      'Pasahitz berri bat sortu nahi duzu?\n\nIkasleak ezin izango du sartu pasahitz zaharrarekin.'
    )
    if (!confirmed) return

    setBusyId(studentId)
    const result = await regeneratePassword(studentId)
    setBusyId(null)

    if (result.success) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, password_plain: result.newPassword } : s
        )
      )
    } else {
      alert(`Errorea: ${result.error}`)
    }
  }

  function handleDelete(studentId: string) {
    const student = students.find((s) => s.id === studentId)
    if (!student) return
    const confirmed = window.confirm(
      `Seguru ${student.full_name} ezabatu nahi duzula?\n\nEkintza hau ezin da desegin.`
    )
    if (!confirmed) return

    startTransition(async () => {
      const result = await deleteStudent(studentId, classroomId)
      if (result.success) {
        setStudents((prev) => prev.filter((s) => s.id !== studentId))
      } else {
        alert(`Errorea: ${result.error}`)
      }
    })
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="students-table-wrapper">
      <table className="students-table">
        <thead>
          <tr>
            <th>Izen-abizenak</th>
            <th>Klasea</th>
            <th>Erabiltzailea</th>
            <th>Pasahitza</th>
            <th>XP</th>
            <th>Bihotzak</th>
            <th aria-label="Ekintzak"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td className="student-name">{s.full_name}</td>
              <td>
                <span className={`student-hero-class hero-${s.hero_class}`}>
                  {HERO_CLASS_LABELS[s.hero_class]}
                </span>
              </td>
              <td>
                <code className="student-code">{s.username}</code>
                <button
                  type="button"
                  className="student-copy-btn"
                  onClick={() => handleCopy(s.username)}
                  title="Kopiatu"
                  aria-label="Kopiatu erabiltzailea"
                >
                  📋
                </button>
              </td>
              <td>
                <code className="student-code">{s.password_plain}</code>
                <button
                  type="button"
                  className="student-copy-btn"
                  onClick={() => handleCopy(s.password_plain)}
                  title="Kopiatu"
                  aria-label="Kopiatu pasahitza"
                >
                  📋
                </button>
              </td>
              <td className="student-stat-xp">
                <span className="student-xp-value">{s.xp}</span>
              </td>
              <td className="student-stat-hearts">
                <span className="student-hearts">
                  {Array.from({ length: s.max_hearts }).map((_, i) => (
                    <span
                      key={i}
                      className={i < s.hearts ? 'heart-full' : 'heart-empty'}
                      aria-hidden
                    >
                      ♥
                    </span>
                  ))}
                </span>
                <span className="visually-hidden">
                  {s.hearts} / {s.max_hearts}
                </span>
              </td>
              <td className="student-actions">
                <button
                  type="button"
                  className="student-action-btn"
                  onClick={() => handleRegenerate(s.id)}
                  disabled={busyId === s.id || isPending}
                  title="Pasahitz berri bat sortu"
                >
                  {busyId === s.id ? '…' : 'Berria'}
                </button>
                <button
                  type="button"
                  className="student-action-btn student-action-danger"
                  onClick={() => handleDelete(s.id)}
                  disabled={isPending}
                  title="Ikaslea ezabatu"
                >
                  Ezabatu
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
