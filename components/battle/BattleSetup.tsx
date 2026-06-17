'use client'

import { useState } from 'react'
import Link from 'next/link'
import BattleScreen from './BattleScreen'
import {
  DEFAULT_DIFFICULTY,
  DEFAULT_QUESTION_COUNT,
  MIN_QUESTION_COUNT,
  MAX_QUESTION_COUNT,
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
  const [started, setStarted] = useState(false)

  if (started) {
    return (
      <BattleScreen
        classroomId={classroomId}
        classroomName={classroomName}
        questionCount={questionCount}
        sugaarHp={computeSugaarHp(difficulty)}
        classHp={computeClassHp(difficulty)}
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
          {classroomName} ikasgela <strong>Sugaar</strong>en aurka borrokatuko da. Galderak
          ahoz egingo dituzu eta erantzun bakoitzaren emaitza markatuko duzu pantailan.
          Aciertoak HP-a kentzen diote Sugaar-i; akatsek klaseari kalte egiten diote.
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
                Sugaar HP: <strong>{computeSugaarHp(difficulty)}</strong> · Klasearen
                HP: <strong>{computeClassHp(difficulty)}</strong>
              </span>
            </label>
          </div>

          <div className="battle-setup-info">
            <h3 className="battle-setup-info-title">Nola dabilen</h3>
            <ol className="battle-setup-info-list">
              <li>
                Galdera bat egiten duzu ahoz ikasleei (ez du sistemak gordetzen).
              </li>
              <li>
                Norbaitek erantzun ondoren, sakatu <strong>ZUZEN</strong> edo{' '}
                <strong>OKER</strong>.
              </li>
              <li>
                Zuzena: Sugaarrek HP galtzen du (kaltea ausazkoa da — kritikoa edo
                hutsegitea ere posible).
              </li>
              <li>
                Okerra: Sugaarrek klaseari erasoten dio.
              </li>
              <li>
                Galderak amaitu edo bietako baten HP 0 iristen denean, batailak amaitzen
                dira.
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
              {studentCount === 0 ? 'Ikaslerik gabe ezin da hasi' : 'Hasi borroka'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
