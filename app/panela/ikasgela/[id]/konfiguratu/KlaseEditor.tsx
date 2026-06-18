'use client'

import { useState } from 'react'
import {
  updateClassroomSettings,
  type ClassroomSettings,
} from '@/lib/classroom/settings'

export default function KlaseEditor({
  settings,
}: {
  settings: ClassroomSettings
}) {
  const [name, setName] = useState(settings.name)
  const [weeklyMana, setWeeklyMana] = useState(settings.weekly_mana)
  const [weeklyHearts, setWeeklyHearts] = useState(settings.weekly_hearts)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function handleSave() {
    setMessage(null)
    setBusy(true)
    const result = await updateClassroomSettings({
      classroomId: settings.id,
      name,
      weeklyMana,
      weeklyHearts,
    })
    setBusy(false)
    if (!result.success) {
      setMessage({ kind: 'err', text: result.error ?? 'Errorea.' })
      return
    }
    setMessage({ kind: 'ok', text: 'Gordeta.' })
  }

  const dirty =
    name.trim() !== settings.name ||
    weeklyMana !== settings.weekly_mana ||
    weeklyHearts !== settings.weekly_hearts

  return (
    <div className="klase-editor">
      {message && (
        <div
          className={`konfiguratu-message konfiguratu-message-${message.kind}`}
          role="status"
        >
          {message.text}
        </div>
      )}

      <div className="klase-editor-field">
        <label className="klase-editor-label" htmlFor="name">
          Klasearen izena
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="klase-editor-input"
          disabled={busy}
          maxLength={80}
        />
      </div>

      <div className="klase-editor-row">
        <div className="klase-editor-field">
          <label className="klase-editor-label" htmlFor="weeklyMana">
            🔮 Asteko mana
          </label>
          <input
            id="weeklyMana"
            type="number"
            min={0}
            max={10}
            value={weeklyMana}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10)
              setWeeklyMana(isNaN(n) ? 0 : Math.max(0, Math.min(10, n)))
            }}
            className="klase-editor-input klase-editor-input-num"
            disabled={busy}
          />
          <p className="klase-editor-hint">
            Astero ikasle bakoitzari emango zaion mana kopurua (0-10).
          </p>
        </div>

        <div className="klase-editor-field">
          <label className="klase-editor-label" htmlFor="weeklyHearts">
            ❤️ Asteko bihotzak
          </label>
          <input
            id="weeklyHearts"
            type="number"
            min={0}
            max={10}
            value={weeklyHearts}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10)
              setWeeklyHearts(isNaN(n) ? 0 : Math.max(0, Math.min(10, n)))
            }}
            className="klase-editor-input klase-editor-input-num"
            disabled={busy}
          />
          <p className="klase-editor-hint">
            Astero ikasle bakoitzari emango zaion bihotz kopurua (0-10).
          </p>
        </div>
      </div>

      <div className="klase-editor-actions">
        <button
          type="button"
          className="panel-cta-btn"
          onClick={handleSave}
          disabled={busy || !dirty || !name.trim()}
        >
          {busy ? 'Gordetzen…' : 'Gorde aldaketak'}
        </button>
      </div>
    </div>
  )
}
