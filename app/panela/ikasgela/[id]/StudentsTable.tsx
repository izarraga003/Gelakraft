'use client'

import { useState, useTransition } from 'react'
import { regeneratePassword, deleteStudent } from '@/lib/students/actions'

type Student = {
  id: string
  full_name: string
  username: string
  password_plain: string
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
  // Mantenemos una copia local para mostrar nuevas contraseñas
  // sin esperar al refresh
  const [students, setStudents] = useState(initialStudents)
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleRegenerate(studentId: string) {
    const confirmed = window.confirm(
      '¿Seguru pasahitz berri bat sortu nahi duzula?\n\n¿Sortu nahi duzu pasahitz berri bat?'
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

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        // Feedback simple: nada porque ya hay un visual en el botón
      },
      () => {
        alert(`Ezin izan da kopiatu: ${label}`)
      }
    )
  }

  return (
    <div className="students-table-wrapper">
      <table className="students-table">
        <thead>
          <tr>
            <th>Izen-abizenak</th>
            <th>Erabiltzailea</th>
            <th>Pasahitza</th>
            <th aria-label="Ekintzak"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td className="student-name">{s.full_name}</td>
              <td>
                <code className="student-code">{s.username}</code>
                <button
                  type="button"
                  className="student-copy-btn"
                  onClick={() => handleCopy(s.username, 'erabiltzailea')}
                  aria-label="Kopiatu erabiltzailea"
                  title="Kopiatu"
                >
                  📋
                </button>
              </td>
              <td>
                <code className="student-code">{s.password_plain}</code>
                <button
                  type="button"
                  className="student-copy-btn"
                  onClick={() => handleCopy(s.password_plain, 'pasahitza')}
                  aria-label="Kopiatu pasahitza"
                  title="Kopiatu"
                >
                  📋
                </button>
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
