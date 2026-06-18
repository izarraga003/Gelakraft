'use client'

import { useState, useEffect } from 'react'
import { AVATAR_CATEGORIES } from '@/lib/students/avatars'
import { updateStudentAvatar } from '@/app/ikasle/panela/actions'

type Props = {
  currentAvatar: string
  onClose: () => void
  onChange: (newAvatar: string) => void
}

export default function AvatarPicker({
  currentAvatar,
  onClose,
  onChange,
}: Props) {
  const [selected, setSelected] = useState(currentAvatar)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Esc para cerrar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave() {
    if (selected === currentAvatar) {
      onClose()
      return
    }
    setSaving(true)
    setError(null)
    const result = await updateStudentAvatar(selected)
    setSaving(false)

    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    onChange(selected)
    onClose()
  }

  return (
    <div
      className="avatar-picker-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-picker-title"
    >
      <div className="avatar-picker-modal">
        <header className="avatar-picker-header">
          <h2 id="avatar-picker-title" className="avatar-picker-title">
            Hautatu zure avatara
          </h2>
          <button
            type="button"
            className="avatar-picker-close"
            onClick={onClose}
            aria-label="Itxi"
          >
            ✕
          </button>
        </header>

        <div className="avatar-picker-body">
          {AVATAR_CATEGORIES.map((cat) => (
            <section key={cat.key} className="avatar-picker-section">
              <h3 className="avatar-picker-section-title">{cat.label}</h3>
              <div className="avatar-picker-grid">
                {cat.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`avatar-picker-option ${
                      selected === emoji ? 'avatar-picker-option-selected' : ''
                    }`}
                    onClick={() => setSelected(emoji)}
                    aria-pressed={selected === emoji}
                    aria-label={`Avatara: ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {error && (
          <p className="avatar-picker-error" role="alert">
            {error}
          </p>
        )}

        <footer className="avatar-picker-footer">
          <button
            type="button"
            className="panel-btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Utzi
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || selected === currentAvatar}
          >
            {saving ? 'Gordetzen…' : 'Gorde'}
          </button>
        </footer>
      </div>
    </div>
  )
}
