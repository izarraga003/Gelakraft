'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { createStudents } from '@/lib/students/actions'

type Params = { id: string }

export default function AddStudentsPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id: classroomId } = use(params)
  const router = useRouter()
  const [namesText, setNamesText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<
    { fullName: string; username: string; passwordPlain: string }[] | null
  >(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const result = await createStudents(classroomId, namesText)

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setCreated(result.created)
  }

  function handleFinish() {
    router.push(`/panela/ikasgela/${classroomId}`)
  }

  // Estado de éxito: mostrar lista de creados con sus credenciales
  if (created) {
    return (
      <div className="panel-content">
        <section className="panel-welcome">
          <div className="panel-eyebrow">Egina</div>
          <h1 className="panel-title">{created.length} ikasle gehitu dira.</h1>
          <p className="panel-subtitle">
            Beheko zerrendan dauzkazu ikasle bakoitzaren erabiltzailea eta pasahitza.
            Edozein momentutan ikus ditzakezu ikasgelaren orrian.
          </p>
        </section>

        <section className="panel-section">
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Izen-abizenak</th>
                  <th>Erabiltzailea</th>
                  <th>Pasahitza</th>
                </tr>
              </thead>
              <tbody>
                {created.map((s) => (
                  <tr key={s.username}>
                    <td className="student-name">{s.fullName}</td>
                    <td>
                      <code className="student-code">{s.username}</code>
                    </td>
                    <td>
                      <code className="student-code">{s.passwordPlain}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel-form-actions" style={{ marginTop: 32 }}>
            <button
              type="button"
              className="panel-btn-secondary"
              onClick={() => {
                setCreated(null)
                setNamesText('')
              }}
            >
              Gehiago gehitu
            </button>
            <button
              type="button"
              className="panel-cta-btn"
              onClick={handleFinish}
            >
              Ikasgelara joan
            </button>
          </div>
        </section>
      </div>
    )
  }

  // Estado normal: form para pegar nombres
  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <Link href={`/panela/ikasgela/${classroomId}`} className="panel-breadcrumb">
          ← Ikasgelara itzuli
        </Link>
        <div className="panel-eyebrow">Ikasleak gehitu</div>
        <h1 className="panel-title">Itsatsi izenen zerrenda.</h1>
        <p className="panel-subtitle">
          Idatzi edo itsatsi ikasleen izen-abizenak, lerro bat ikasleko. Sistemak
          automatikoki sortuko ditu erabiltzaile-izen eta pasahitz bana, eta erakutsiko
          dizkizu ondoren.
        </p>
      </section>

      <section className="panel-form-section">
        <form onSubmit={handleSubmit} className="panel-form">
          <label className="panel-field">
            <span className="panel-label">
              Ikasleen izen-abizenak
              <span className="panel-field-counter">
                {namesText.split(/\r?\n/).filter((l) => l.trim()).length} ikasle
              </span>
            </span>
            <textarea
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              rows={12}
              placeholder={'Ane Etxebarria\nJulen Bilbao\nMaite García\nIker Larrañaga\n…'}
              required
              autoFocus
              className="panel-textarea"
            />
            <span className="panel-field-hint">
              Lerro bat ikasleko. Gehienez 50 ikasle aldi berean.
            </span>
          </label>

          {error && (
            <p className="panel-form-error" role="alert">
              {error}
            </p>
          )}

          <div className="panel-form-actions">
            <Link
              href={`/panela/ikasgela/${classroomId}`}
              className="panel-btn-secondary"
            >
              Utzi
            </Link>
            <button
              type="submit"
              className="panel-cta-btn"
              disabled={loading || !namesText.trim()}
            >
              {loading ? 'Sortzen…' : 'Ikasleak sortu'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
