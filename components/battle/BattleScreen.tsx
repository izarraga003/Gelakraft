'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import SugaarArt from './SugaarArt'
import HealthBar from './HealthBar'
import { playSound } from './sounds'
import {
  rollPlayerHit,
  rollEnemyAttack,
  type HitResult,
} from '@/lib/battle/balance'
import { applyBattleResult } from '@/lib/battle/actions'

type BattleScreenProps = {
  classroomId: string
  classroomName: string
  questionCount: number
  sugaarHp: number
  classHp: number
}

type Phase = 'fighting' | 'finishing' | 'won' | 'lost'

type FloatingNumber = {
  id: number
  value: string
  variant: 'damage' | 'crit' | 'miss' | 'enemy'
}

let floatingIdCounter = 0

export default function BattleScreen({
  classroomId,
  classroomName,
  questionCount,
  sugaarHp: maxSugaarHp,
  classHp: maxClassHp,
}: BattleScreenProps) {
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>('fighting')
  const [sugaarHp, setSugaarHp] = useState(maxSugaarHp)
  const [classHp, setClassHp] = useState(maxClassHp)
  const [questionIdx, setQuestionIdx] = useState(0) // preguntas respondidas
  const [animation, setAnimation] = useState<
    'idle' | 'hit' | 'crit' | 'miss' | 'attack' | 'defeated'
  >('idle')
  const [floating, setFloating] = useState<FloatingNumber[]>([])
  const [muted, setMuted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [reward, setReward] = useState<{
    outcome: 'victory' | 'defeat'
    xpDelta: number
    heartsDelta: number
    perfect: boolean
  } | null>(null)

  const play = useCallback(
    (sound: Parameters<typeof playSound>[0]) => {
      if (!muted) playSound(sound)
    },
    [muted]
  )

  const addFloating = useCallback((value: string, variant: FloatingNumber['variant']) => {
    const id = ++floatingIdCounter
    setFloating((prev) => [...prev, { id, value, variant }])
    setTimeout(() => {
      setFloating((prev) => prev.filter((f) => f.id !== id))
    }, 1100)
  }, [])

  // Finalizar la batalla cuando llega a una condición terminal
  useEffect(() => {
    if (phase !== 'fighting') return

    let nextPhase: Phase | null = null

    if (sugaarHp <= 0) {
      nextPhase = 'finishing'
      setAnimation('defeated')
      setTimeout(() => play('victory'), 300)
    } else if (classHp <= 0) {
      nextPhase = 'finishing'
      setTimeout(() => play('defeat'), 300)
    } else if (questionIdx >= questionCount) {
      // Se acabaron las preguntas: gana quien tenga más HP relativa
      nextPhase = 'finishing'
      if (sugaarHp / maxSugaarHp <= classHp / maxClassHp) {
        // La clase ganó por puntos (más HP relativa)
        setAnimation('defeated')
        setTimeout(() => play('victory'), 300)
      } else {
        setTimeout(() => play('defeat'), 300)
      }
    }

    if (nextPhase) {
      setPhase(nextPhase)
      const outcome: 'victory' | 'defeat' =
        sugaarHp <= 0 ||
        (questionIdx >= questionCount && sugaarHp / maxSugaarHp <= classHp / maxClassHp)
          ? 'victory'
          : 'defeat'
      void applyResult(outcome)
    }
  }, [sugaarHp, classHp, questionIdx, questionCount, phase, maxSugaarHp, maxClassHp, play])

  async function applyResult(outcome: 'victory' | 'defeat') {
    setBusy(true)
    const result = await applyBattleResult({
      classroomId,
      outcome,
      questionCount,
      classHpStart: maxClassHp,
      classHpEnd: classHp,
    })
    setBusy(false)

    if (result.success) {
      setReward(result.reward)
    }
    setPhase(outcome === 'victory' ? 'won' : 'lost')
  }

  function handleCorrect() {
    if (phase !== 'fighting' || busy) return
    const hit: HitResult = rollPlayerHit()

    if (hit.kind === 'miss') {
      play('hit-miss')
      setAnimation('miss')
      addFloating('Hutsegite!', 'miss')
    } else if (hit.kind === 'crit') {
      play('hit-crit')
      setAnimation('crit')
      addFloating(`KRITIKO! -${hit.damage}`, 'crit')
      setSugaarHp((hp) => Math.max(0, hp - hit.damage))
    } else {
      play('hit-normal')
      setAnimation('hit')
      addFloating(`-${hit.damage}`, 'damage')
      setSugaarHp((hp) => Math.max(0, hp - hit.damage))
    }

    setQuestionIdx((q) => q + 1)
    setTimeout(() => setAnimation('idle'), 600)
  }

  function handleIncorrect() {
    if (phase !== 'fighting' || busy) return
    const attack = rollEnemyAttack()

    play('enemy-attack')
    setAnimation('attack')
    addFloating(`Sugaar erasoan! -${attack.damage}`, 'enemy')
    setClassHp((hp) => Math.max(0, hp - attack.damage))

    setQuestionIdx((q) => q + 1)
    setTimeout(() => setAnimation('idle'), 700)
  }

  function handleExit() {
    const confirmed = window.confirm(
      'Batailatik atera nahi duzu? Ez da inolako emaitzarik gordeko.'
    )
    if (confirmed) {
      router.push(`/panela/ikasgela/${classroomId}`)
    }
  }

  function handleReturnAfterEnd() {
    router.push(`/panela/ikasgela/${classroomId}`)
    router.refresh()
  }

  // ============== PANTALLA DE RESULTADO ==============
  if (phase === 'won' || phase === 'lost') {
    return (
      <div className={`battle-result battle-result-${phase}`}>
        <div className="battle-result-content">
          {phase === 'won' ? (
            <>
              <div className="battle-result-eyebrow">Garaipena</div>
              <h1 className="battle-result-title">SUGAAR MENDERATU DUZUE!</h1>
              <p className="battle-result-sub">
                {classroomName}-eko ikasleek Sugaar suntsitu dute.
              </p>
              {reward && (
                <div className="battle-result-rewards">
                  <div className="battle-reward-item">
                    <div className="battle-reward-icon">⚡</div>
                    <div className="battle-reward-value">+{reward.xpDelta} XP</div>
                    <div className="battle-reward-label">ikasle bakoitzeko</div>
                  </div>
                  {reward.perfect && (
                    <div className="battle-reward-perfect">
                      ✨ Borroka ezin hobea — bonusa irabazi duzue
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="battle-result-eyebrow">Galera</div>
              <h1 className="battle-result-title">SUGAARREK GARAITU ZAITUZTE.</h1>
              <p className="battle-result-sub">
                {classroomName} oraingoan ezin izan du Sugaar menderatu. Hurrengoan
                izango da.
              </p>
              {reward && (
                <div className="battle-result-rewards">
                  <div className="battle-reward-item battle-reward-loss">
                    <div className="battle-reward-icon">💔</div>
                    <div className="battle-reward-value">
                      {reward.heartsDelta} bihotz
                    </div>
                    <div className="battle-reward-label">ikasle bakoitzari</div>
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="button"
            className="btn-primary battle-result-btn"
            onClick={handleReturnAfterEnd}
            disabled={busy}
          >
            {busy ? 'Gordetzen…' : 'Itzuli ikasgelara'}
          </button>
        </div>
      </div>
    )
  }

  // ============== PANTALLA DE BATALLA ==============
  return (
    <div className="battle-screen">
      <header className="battle-header">
        <div className="battle-classroom-name">{classroomName}</div>
        <div className="battle-question-counter">
          Galdera <strong>{Math.min(questionIdx + 1, questionCount)}</strong> /{' '}
          {questionCount}
        </div>
        <div className="battle-header-actions">
          <button
            type="button"
            className="battle-icon-btn"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Aktibatu soinua' : 'Isildu'}
            title={muted ? 'Aktibatu soinua' : 'Isildu'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            className="battle-icon-btn battle-exit-btn"
            onClick={handleExit}
            title="Atera batailatik"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="battle-stage">
        <div className="battle-hp-enemy">
          <HealthBar label="Sugaar" current={sugaarHp} max={maxSugaarHp} variant="enemy" />
        </div>

        <div className="battle-sugaar-wrapper">
          <SugaarArt animation={animation} />
          <div className="battle-floating-numbers">
            {floating.map((f) => (
              <span key={f.id} className={`floating-num floating-${f.variant}`}>
                {f.value}
              </span>
            ))}
          </div>
        </div>

        <div className="battle-hp-class">
          <HealthBar
            label={classroomName}
            current={classHp}
            max={maxClassHp}
            variant="ally"
          />
        </div>
      </div>

      <div className="battle-controls">
        <button
          type="button"
          className="battle-btn battle-btn-correct"
          onClick={handleCorrect}
          disabled={phase !== 'fighting' || busy}
        >
          <span className="battle-btn-icon">✓</span>
          ZUZEN
          <span className="battle-btn-hint">Sugaarri erasotu</span>
        </button>
        <button
          type="button"
          className="battle-btn battle-btn-incorrect"
          onClick={handleIncorrect}
          disabled={phase !== 'fighting' || busy}
        >
          <span className="battle-btn-icon">✗</span>
          OKER
          <span className="battle-btn-hint">Sugaarrek erasotuko du</span>
        </button>
      </div>
    </div>
  )
}
