'use client'

import { useState } from 'react'
import Link from 'next/link'
import BattleScreen from './BattleScreen'
import {
  DEFAULT_DIFFICULTY,
  DEFAULT_QUESTION_COUNT,
  MIN_QUESTION_COUNT,
  MAX_QUESTION_COUNT,
  MIN_HEARTS_LOSS,
  MAX_HEARTS_LOSS,
  DEFAULT_HEARTS_LOSS_INIT,
  computeSugaarHp,
  computeClassHp,
} from '@/lib/battle/balance'

type BattleSetupProps = {
  classroomId: string
  classroomName: string
  studentCount: number
}

export default function BattleSetup({
  classroomId,
  classroomName,
  studentCount,
}: BattleSetupProps) {
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT)
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY)
  const [heartsLoss, setHeartsLoss] = useState(DEFAULT_HEARTS_LOSS_INIT)
  const [started, setStarted] = useState(false)

  if (started) {
    return (
      <BattleScreen
        classroomId={classroomId}
        classroomName={classroomName}
        questionCount={questionCount}
        sugaarHp={computeSugaarHp(difficulty)}
        classHp={computeClassHp(difficulty)}
        heartsLossOnDefeat={heartsLoss}
      />
    )
  }

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <Link href={`/panela/ikasgela/${classroomId}`} className="panel-breadcrumb">
          ← Ikasgelara itzuli
        </Link>
        <div className="panel-eyebrow">Tresna · I</div>
        <h1 className="panel-title">Sugaarren aurkako borroka.</h1>
        <p className="panel-subtitle">
          {classroomName} ikasgela <strong>Sugaar</strong>en aurka borrokatuko da.
          Galderak ahoz egingo dituzu eta erantzun bakoitzaren emaitza markatuko
          duzu pantailan. Zuzenek HPa kentzen diote Sugaar-i; okerrek klaseari
          kalte egiten diote.
        </p>
      </section>

      <section className="panel-form-section">
        <div className="battle-setup-card">
          <div className="battle-setup-row">
            <label className="battle-setup-field">
              <span className="battle-setup-label">Galdera kopurua</span>
              <div className="battle-setup-numeric">
                <button
                  type="button"
                  className="battle-numeric-btn"
                  onClick={() =>
                    setQuestionCount((n) => Math.max(MIN_QUESTION_COUNT, n - 1))
                  }
                  disabled={questionCount <= MIN_QUESTION_COUNT}
                  aria-label="Bat gutxiago"
                >
                  −
                </button>
                <span className="battle-numeric-value">{questionCount}</span>
                <button
                  type="button"
                  className="battle-numeric-btn"
                  onClick={() =>
                    setQuestionCount((n) => Math.min(MAX_QUESTION_COUNT, n + 1))
                  }
                  disabled={questionCount >= MAX_QUESTION_COUNT}
                  aria-label="Bat gehiago"
                >
                  +
                </button>
              </div>
              <span className="battle-setup-hint">
                {MIN_QUESTION_COUNT}-{MAX_QUESTION_COUNT} galdera arteko
              </span>
            </label>
          </div>

          <div className="battle-setup-row">
            <label className="battle-setup-field">
              <span className="battle-setup-label">
                Sugaarren zailtasuna
                <span className="battle-setup-difficulty-value">{difficulty}</span>
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value, 10))}
                className="battle-setup-slider"
              />
              <div className="battle-setup-slider-marks">
                <span>Ahul</span>
                <span>Erdi</span>
                <span>Ahaltsu</span>
              </div>
              <span className="battle-setup-hint">
                Sugaar HP: <strong>{computeSugaarHp(difficulty)}</strong> ·
                Klasearen HP: <strong>{computeClassHp(difficulty)}</strong>
              </span>
            </label>
          </div>

          <div className="battle-setup-row">
            <label className="battle-setup-field">
              <span className="battle-setup-label">
                Galera kostua (galtzean kentzen diren bihotzak)
              </span>
              <div className="battle-setup-numeric">
                <button
                  type="button"
                  className="battle-numeric-btn"
                  onClick={() =>
                    setHeartsLoss((n) => Math.max(MIN_HEARTS_LOSS, n - 1))
                  }
                  disabled={heartsLoss <= MIN_HEARTS_LOSS}
                  aria-label="Bat gutxiago"
                >
                  −
                </button>
                <span className="battle-numeric-value">❤️ {heartsLoss}</span>
                <button
                  type="button"
                  className="battle-numeric-btn"
                  onClick={() =>
                    setHeartsLoss((n) => Math.min(MAX_HEARTS_LOSS, n + 1))
                  }
                  disabled={heartsLoss >= MAX_HEARTS_LOSS}
                  aria-label="Bat gehiago"
                >
                  +
                </button>
              </div>
              <span className="battle-setup-hint">
                Klaseak galtzen badu, ikasle bakoitzak bihotz kopuru hori
                galduko du.
              </span>
            </label>
          </div>

          <div className="battle-setup-info">
            <h3 className="battle-setup-info-title">Hiru egoera posible</h3>
            <ul className="battle-scenarios-list">
              <li className="battle-scenario battle-scenario-victory">
                <span className="battle-scenario-icon">⚔️</span>
                <div>
                  <strong>Garaipena:</strong> Sugaarrek HP guztia galtzen du eta
                  klaseak garaitzen du. Ikasle guztiek esperientzia irabaziko
                  dute.
                </div>
              </li>
              <li className="battle-scenario battle-scenario-tie">
                <span className="battle-scenario-icon">⚖️</span>
                <div>
                  <strong>Berdinketa:</strong> Galderak amaitzen badira eta inor
                  ez bada hil, klaseari galdera ezagun bat egingo zaio ahoz.
                  Erantzun zuzena → Sugaar garaitzen dute. Akatsa → Sugaar
                  ateratzen da garaile.
                </div>
              </li>
              <li className="battle-scenario battle-scenario-defeat">
                <span className="battle-scenario-icon">💔</span>
                <div>
                  <strong>Galera:</strong> Klaseak HP guztia galtzen du.
                  Sugaarrek ihes egiten dio eta ikasle bakoitzak{' '}
                  <strong>{heartsLoss}</strong> bihotz galtzen du.
                </div>
              </li>
            </ul>
          </div>

          <div className="battle-setup-info">
            <h3 className="battle-setup-info-title">Nola dabilen</h3>
            <ol className="battle-setup-info-list">
              <li>Galdera bat egiten duzu ahoz ikasleei.</li>
              <li>
                Norbaitek erantzun ondoren, sakatu <strong>ZUZEN</strong> edo{' '}
                <strong>OKER</strong>.
              </li>
              <li>
                Zuzena: Sugaarrek HP galtzen du (kritikoa edo hutsegitea ere
                posible).
              </li>
              <li>Okerra: Sugaarrek klaseari erasoten dio.</li>
              <li>
                Galderak amaitu edo bietako baten HP 0 iristen denean, batailak
                amaitzen dira.
              </li>
            </ol>
          </div>

          <div className="battle-setup-meta">
            <div>
              <strong>{studentCount}</strong> ikasle{' '}
              {studentCount === 1 ? 'parte hartuko du' : 'parte hartuko dute'}
            </div>
          </div>

          <div className="panel-form-actions">
            <Link
              href={`/panela/ikasgela/${classroomId}`}
              className="panel-btn-secondary"
            >
              Utzi
            </Link>
            <button
              type="button"
              className="panel-cta-btn battle-setup-start"
              onClick={() => setStarted(true)}
              disabled={studentCount === 0}
            >
              {studentCount === 0
                ? 'Ikaslerik gabe ezin da hasi'
                : 'Hasi borroka'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
