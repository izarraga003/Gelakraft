'use client'

import { useState } from 'react'
import AvatarRender from './AvatarRender'
import AvatarBuilder from './AvatarBuilder'
import {
  HERO_CLASS_LABELS,
  HERO_CLASS_DESCRIPTIONS,
  type HeroClass,
} from '@/lib/students/hero-class'
import { levelProgress } from '@/lib/students/level'
import {
  sanitizeAvatarConfig,
  type AvatarConfig,
} from '@/lib/students/avatar'

type HeroCardProps = {
  avatarConfig: AvatarConfig
  fullName: string
  username: string
  heroClass: HeroClass
  xp: number
  hearts: number
  maxHearts: number
  mana: number
  maxMana: number
}

export default function HeroCard({
  avatarConfig,
  fullName,
  username,
  heroClass,
  xp,
  hearts,
  maxHearts,
  mana,
  maxMana,
}: HeroCardProps) {
  const [builderOpen, setBuilderOpen] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState<AvatarConfig>(
    sanitizeAvatarConfig(avatarConfig, 99)
  )

  const progress = levelProgress(xp)

  return (
    <>
      <article className={`hero-card hero-card-${heroClass}`}>
        <button
          type="button"
          className="hero-avatar-btn"
          onClick={() => setBuilderOpen(true)}
          aria-label="Pertsonaia aldatu"
          title="Pertsonaia aldatu"
        >
          <AvatarRender config={currentAvatar} size={132} />
          <span className="hero-avatar-edit-hint" aria-hidden="true">
            ✏
          </span>
        </button>

        <div className="hero-card-info">
          <div className="hero-card-name-row">
            <h1 className="hero-card-name">{fullName}</h1>
            <span className="hero-card-username">@{username}</span>
          </div>

          <div className="hero-card-class">
            <span className={`student-hero-class hero-${heroClass}`}>
              {HERO_CLASS_LABELS[heroClass]}
            </span>
            <span className="hero-card-class-desc">
              {HERO_CLASS_DESCRIPTIONS[heroClass]}
            </span>
          </div>

          <div className="hero-card-level">
            <div className="hero-card-level-header">
              <div className="hero-card-level-info">
                <span className="hero-card-level-badge">
                  Maila {progress.level}
                </span>
                <span className="hero-card-level-title">{progress.title}</span>
              </div>
              <span className="hero-card-level-progress">
                {progress.currentXp} / {progress.neededXp} XP
              </span>
            </div>
            <div className="hero-card-xp-track">
              <div
                className="hero-card-xp-fill"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </div>

          <div className="hero-card-stats">
            <div className="hero-stat">
              <div className="hero-stat-icon">⚡</div>
              <div className="hero-stat-value">{xp}</div>
              <div className="hero-stat-label">XP guztira</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-icon">❤️</div>
              <div className="hero-stat-value">
                {hearts} <span className="hero-stat-max">/ {maxHearts}</span>
              </div>
              <div className="hero-stat-label">Bihotzak</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-icon">🔮</div>
              <div className="hero-stat-value">
                {mana} <span className="hero-stat-max">/ {maxMana}</span>
              </div>
              <div className="hero-stat-label">Mana</div>
            </div>
          </div>
        </div>
      </article>

      {builderOpen && (
        <AvatarBuilder
          currentConfig={currentAvatar}
          level={progress.level}
          onClose={() => setBuilderOpen(false)}
          onChange={(c) => setCurrentAvatar(c)}
        />
      )}
    </>
  )
}
