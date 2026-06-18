'use client'

import { useState, useEffect } from 'react'
import AvatarRender from './AvatarRender'
import {
  AVATAR_CATEGORIES,
  type AvatarConfig,
  type AvatarOption,
} from '@/lib/students/avatar'
import { updateStudentAvatar } from '@/app/ikasle/panela/actions'

type Props = {
  currentConfig: AvatarConfig
  level: number
  onClose: () => void
  onChange: (newConfig: AvatarConfig) => void
}

export default function AvatarBuilder({
  currentConfig,
  level,
  onClose,
  onChange,
}: Props) {
  const [config, setConfig] = useState<AvatarConfig>(currentConfig)
  const [activeCategory, setActiveCategory] = useState<keyof AvatarConfig>('bgColor')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function setOption(category: keyof AvatarConfig, optionId: string) {
    setConfig((prev) => {
      if (category === 'accessory' && optionId === 'none') {
        return { ...prev, accessory: null }
      }
      return { ...prev, [category]: optionId }
    })
  }

  async function handleSave() {
    setError(null)
    setSaving(true)
    const result = await updateStudentAvatar(config)
    setSaving(false)

    if (!result.success) {
      setError(result.error ?? 'Errorea.')
      return
    }
    onChange(config)
    onClose()
  }

  const activeCat = AVATAR_CATEGORIES.find((c) => c.key === activeCategory)!

  function getSelectedOption(category: keyof AvatarConfig): string {
    const current = config[category]
    if (category === 'accessory' && (current === null || current === undefined)) {
      return 'none'
    }
    return (current as string) ?? ''
  }

  return (
    <div
      className="avatar-picker-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-builder-title"
    >
      <div className="avatar-builder-modal">
        <header className="avatar-picker-header">
          <h2 id="avatar-builder-title" className="avatar-picker-title">
            Pertsonaiari forma eman
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

        <div className="avatar-builder-body">
          {/* Preview grande a la izquierda */}
          <div className="avatar-builder-preview">
            <div className="avatar-builder-preview-stage">
              <AvatarRender config={config} size={220} />
            </div>
            <div className="avatar-builder-level-info">
              Maila <strong>{level}</strong>
            </div>
          </div>

          {/* Selector de capas + opciones */}
          <div className="avatar-builder-controls">
            <div className="avatar-builder-tabs" role="tablist">
              {AVATAR_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat.key}
                  className={`avatar-builder-tab ${
                    activeCategory === cat.key ? 'avatar-builder-tab-active' : ''
                  }`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="avatar-builder-options-grid">
              {activeCat.options.map((opt) => {
                const locked = opt.unlockLevel > level
                const selected = getSelectedOption(activeCategory) === opt.id
                return (
                  <OptionButton
                    key={opt.id}
                    option={opt}
                    category={activeCategory}
                    config={config}
                    selected={selected}
                    locked={locked}
                    level={level}
                    onClick={() => !locked && setOption(activeCategory, opt.id)}
                  />
                )
              })}
            </div>
          </div>
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
            disabled={saving}
          >
            {saving ? 'Gordetzen…' : 'Gorde'}
          </button>
        </footer>
      </div>
    </div>
  )
}

/**
 * Botón individual de opción que muestra un mini-preview del avatar con esa
 * opción aplicada. Si está bloqueada, muestra candado.
 */
function OptionButton({
  option,
  category,
  config,
  selected,
  locked,
  level,
  onClick,
}: {
  option: AvatarOption
  category: keyof AvatarConfig
  config: AvatarConfig
  selected: boolean
  locked: boolean
  level: number
  onClick: () => void
}) {
  // Generar preview de cómo se vería con esta opción
  const previewConfig: AvatarConfig = {
    ...config,
    [category]: category === 'accessory' && option.id === 'none' ? null : option.id,
  }

  return (
    <button
      type="button"
      className={`avatar-builder-option ${selected ? 'avatar-builder-option-selected' : ''} ${
        locked ? 'avatar-builder-option-locked' : ''
      }`}
      onClick={onClick}
      disabled={locked}
      aria-pressed={selected}
      title={locked ? `Maila ${option.unlockLevel}-en askatzen da` : option.label}
    >
      <span className="avatar-builder-option-preview">
        <AvatarRender config={previewConfig} size={56} />
      </span>
      <span className="avatar-builder-option-label">{option.label}</span>
      {locked && (
        <span className="avatar-builder-option-lock" aria-hidden="true">
          🔒 Mla {option.unlockLevel}
        </span>
      )}
    </button>
  )
}
