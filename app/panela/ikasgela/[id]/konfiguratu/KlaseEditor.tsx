'use client'

import { useState } from 'react'
import {
  updateClassroomSettings,
  type ClassroomSettings,
} from '@/lib/classroom/settings'

const DAY_LABELS: { dow: number; short: string; full: string }[] = [
  { dow: 1, short: 'Al', full: 'Astelehena' },
  { dow: 2, short: 'As', full: 'Asteartea' },
  { dow: 3, short: 'Az', full: 'Asteazkena' },
  { dow: 4, short: 'Og', full: 'Osteguna' },
  { dow: 5, short: 'Or', full: 'Ostirala' },
]

export default function KlaseEditor({
  settings,
}: {
  settings: ClassroomSettings
}) {
  const [name, setName] = useState(settings.name)
  const [weeklyMana, setWeeklyMana] = useState(settings.weekly_mana)
  const [weeklyHearts, setWeeklyHearts] = useState(settings.weekly_hearts)
  const [grantDays, setGrantDays] = useState<Set<number>>(
    new Set(settings.grant_days ?? [1, 2, 3, 4, 5])
  )
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  function toggleDay(dow: number) {
    setGrantDays((prev) => {
      const next = new Set(prev)
      if (next.has(dow)) next.delete(dow)
      else next.add(dow)
      return next
    })
  }

  async function handleSave() {
    setMessage(null)
    if (grantDays.size === 0) {
      setMessage({ kind: 'err', text: 'Egun bat aukeratu behar duzu gutxienez.' })
      return
    }
    setBusy(true)
    const result = await updateClassroomSettings({
      classroomId: settings.id,
      name,
      weeklyMana,
      weeklyHearts,
      grantDays: Array.from(grantDays).sort((a, b) => a - b),
    })
    setBusy(false)
    if (!result.success) {
      setMessage({ kind: 'err', text: result.error ?? 'Errorea.' })
      return
    }
    setMessage({ kind: 'ok', text: 'Gordeta.' })
  }

  const originalDays = new Set(settings.grant_days ?? [1, 2, 3, 4, 5])
  const daysSetEqual =
    grantDays.size === originalDays.size &&
    [...grantDays].every((d) => originalDays.has(d))
  const dirty =
    name.trim() !== settings.name ||
    weeklyMana !== settings.weekly_mana ||
    weeklyHearts !== settings.weekly_hearts ||
    !daysSetEqual

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
          Ikasgelaren izena
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
            🔮 Egun bakoitzean ematen den mana
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
            Aukeratutako egun bakoitzean ikasle bakoitzari emango zaion kopurua.
          </p>
        </div>

        <div className="klase-editor-field">
          <label className="klase-editor-label" htmlFor="weeklyHearts">
            ❤️ Egun bakoitzean ematen diren bihotzak
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
            Aukeratutako egun bakoitzean ikasle bakoitzari emango zaiona.
          </p>
        </div>
      </div>

      <div className="klase-editor-field">
        <span className="klase-editor-label">Zein egunetan eman?</span>
        <div className="grant-days-row" role="group" aria-label="Astegunak">
          {DAY_LABELS.map((d) => {
            const selected = grantDays.has(d.dow)
            return (
              <button
                type="button"
                key={d.dow}
                onClick={() => toggleDay(d.dow)}
                className={`grant-day-btn ${selected ? 'grant-day-btn-on' : ''}`}
                disabled={busy}
                aria-pressed={selected}
                title={d.full}
              >
                <span className="grant-day-short">{d.short}</span>
                <span className="grant-day-full">{d.full}</span>
              </button>
            )
          })}
        </div>
        <p className="klase-editor-hint">
          Mana eta bihotzak aukeratutako egun horietan emango dira
          automatikoki, ikasleak sartzen direnean.
        </p>
      </div>

      <div className="klase-editor-actions">
        <button
          type="button"
          className="panel-cta-btn"
          onClick={handleSave}
          disabled={busy || !dirty || !name.trim() || grantDays.size === 0}
        >
          {busy ? 'Gordetzen…' : 'Gorde aldaketak'}
        </button>
      </div>
    </div>
  )
}
