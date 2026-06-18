'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { playToolSound } from './sounds'
import MariSleeping from './MariSleeping'
import { applyRewardToClassroom } from '@/lib/students/actions'

type IsiltasunErronkaProps = {
  classroomId: string
  classroomName: string
}

type Phase =
  | 'setup'
  | 'requesting-mic'
  | 'mic-denied'
  | 'running'
  | 'succeeded'
  | 'failed'

type Config = {
  durationMinutes: number
  noiseLimit: number // 0-100
  loseHearts: boolean
  heartsLoss: number
  xpReward: number
}

const DEFAULT_CONFIG: Config = {
  durationMinutes: 5,
  noiseLimit: 40,
  loseHearts: true,
  heartsLoss: 1,
  xpReward: 30,
}

// Sensibilidad del micrófono — multiplica el RMS para convertir a escala 0-100.
// Ajustable; con 220 funciona razonablemente para micros de portátil.
const MIC_SENSITIVITY = 220

// Suavizado del nivel mostrado (0-1): más alto = más suave (con latencia)
const LEVEL_SMOOTHING = 0.45

export default function IsiltasunErronka({
  classroomId,
  classroomName,
}: IsiltasunErronkaProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [muted, setMuted] = useState(false)
  const [level, setLevel] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [busy, setBusy] = useState(false)

  // Refs para no causar re-renders en cada frame
  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const smoothedLevelRef = useRef(0)
  const phaseRef = useRef<Phase>('setup')

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Limpieza al desmontar / cambiar de fase terminal
  useEffect(() => {
    return () => {
      stopMicrophone()
    }
  }, [])

  function stopMicrophone() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    analyserRef.current = null
  }

  async function startMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // queremos detectar el ruido, no que lo suprima
          autoGainControl: false,
        },
      })
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new AudioCtor()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024

      source.connect(analyser)

      streamRef.current = stream
      audioCtxRef.current = ctx
      analyserRef.current = analyser

      // Empezar el loop de medición
      tickLoop()

      return true
    } catch (err) {
      console.error('Mic access denied or failed:', err)
      return false
    }
  }

  function tickLoop() {
    const analyser = analyserRef.current
    if (!analyser) return

    const buffer = new Uint8Array(analyser.fftSize)

    const loop = () => {
      // Solo seguimos midiendo si la fase sigue siendo running
      if (phaseRef.current !== 'running') {
        rafRef.current = null
        return
      }

      analyser.getByteTimeDomainData(buffer)

      // RMS
      let sum = 0
      for (let i = 0; i < buffer.length; i++) {
        const v = (buffer[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / buffer.length)
      const rawLevel = Math.min(100, rms * MIC_SENSITIVITY)

      // Suavizado exponencial
      smoothedLevelRef.current =
        smoothedLevelRef.current * LEVEL_SMOOTHING +
        rawLevel * (1 - LEVEL_SMOOTHING)

      setLevel(smoothedLevelRef.current)

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  async function handleStart() {
    setPhase('requesting-mic')
    const ok = await startMicrophone()
    if (!ok) {
      setPhase('mic-denied')
      return
    }
    setRemainingSeconds(config.durationMinutes * 60)
    setLevel(0)
    smoothedLevelRef.current = 0
    setPhase('running')
  }

  // Loop de countdown (independiente del de audio)
  useEffect(() => {
    if (phase !== 'running') return

    const interval = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) {
          // Tiempo agotado: éxito
          handleSuccess()
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Detección de "Mari se despierta"
  useEffect(() => {
    if (phase !== 'running') return
    if (level > config.noiseLimit) {
      handleFailure()
    }
  }, [level, phase, config.noiseLimit])

  async function handleSuccess() {
    if (phase === 'succeeded' || phase === 'failed') return
    setPhase('succeeded')
    stopMicrophone()
    if (!muted) playToolSound('mari-success')

    setBusy(true)
    await applyRewardToClassroom(classroomId, config.xpReward, 0, {
      type: 'silence',
      outcome: 'success',
      metadata: {
        duration_minutes: config.durationMinutes,
        noise_limit: config.noiseLimit,
      },
    })
    setBusy(false)
  }

  async function handleFailure() {
    if (phase === 'succeeded' || phase === 'failed') return
    setPhase('failed')
    stopMicrophone()
    if (!muted) playToolSound('mari-wake')

    if (config.loseHearts) {
      setBusy(true)
      await applyRewardToClassroom(classroomId, 0, -config.heartsLoss, {
        type: 'silence',
        outcome: 'failure',
        metadata: {
          duration_minutes: config.durationMinutes,
          noise_limit: config.noiseLimit,
        },
      })
      setBusy(false)
    } else {
      // Aún así registramos la actividad para el historial
      setBusy(true)
      await applyRewardToClassroom(classroomId, 0, 0, {
        type: 'silence',
        outcome: 'failure',
        metadata: {
          duration_minutes: config.durationMinutes,
          noise_limit: config.noiseLimit,
          hearts_loss_disabled: true,
        },
      })
      setBusy(false)
    }
  }

  function handleExit() {
    stopMicrophone()
    router.push(`/panela/ikasgela/${classroomId}`)
  }

  function handleRestart() {
    stopMicrophone()
    setLevel(0)
    smoothedLevelRef.current = 0
    setPhase('setup')
  }

  // ====================== SETUP ======================
  if (phase === 'setup') {
    return (
      <div className="tool-screen tool-isiltasuna-screen">
        <header className="tool-header">
          <div className="tool-classroom-name">{classroomName}</div>
          <div className="tool-title-mini">Mariren isiltasun-erronka</div>
          <div className="tool-header-actions">
            <button
              type="button"
              className="tool-icon-btn"
              onClick={handleExit}
              title="Atera"
            >
              ✕
            </button>
          </div>
        </header>

        <main className="tool-setup-main">
          <h1 className="tool-setup-title">Konfiguratu erronka.</h1>

          <div className="isiltasun-setup-card">
            <div className="isiltasun-setup-row">
              <label className="isiltasun-setup-field">
                <span className="isiltasun-setup-label">
                  Iraupena
                  <span className="isiltasun-setup-value">
                    {config.durationMinutes} min
                  </span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={config.durationMinutes}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      durationMinutes: parseInt(e.target.value, 10),
                    }))
                  }
                  className="battle-setup-slider"
                />
                <div className="battle-setup-slider-marks">
                  <span>1 min</span>
                  <span>15 min</span>
                  <span>30 min</span>
                </div>
              </label>
            </div>

            <div className="isiltasun-setup-row">
              <label className="isiltasun-setup-field">
                <span className="isiltasun-setup-label">
                  Zarata-muga
                  <span className="isiltasun-setup-value">{config.noiseLimit}</span>
                </span>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={config.noiseLimit}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      noiseLimit: parseInt(e.target.value, 10),
                    }))
                  }
                  className="battle-setup-slider"
                />
                <div className="battle-setup-slider-marks">
                  <span>Isila</span>
                  <span>Erdi</span>
                  <span>Zaratatsu</span>
                </div>
                <span className="battle-setup-hint">
                  Klasea isiltasun horretatik gora pasatzen bada, Mari esnatuko da.
                </span>
              </label>
            </div>

            <div className="isiltasun-setup-row">
              <span className="isiltasun-setup-label">Sariak eta zigorrak</span>

              <div className="isiltasun-rewards">
                <div className="isiltasun-reward-row">
                  <span className="isiltasun-reward-icon">⚡</span>
                  <span className="isiltasun-reward-text">
                    Lortzen badute, ikasle bakoitzak
                  </span>
                  <div className="isiltasun-numeric">
                    <button
                      type="button"
                      className="tool-numeric-btn"
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          xpReward: Math.max(0, c.xpReward - 5),
                        }))
                      }
                    >
                      −
                    </button>
                    <span className="isiltasun-numeric-value">
                      {config.xpReward}
                    </span>
                    <button
                      type="button"
                      className="tool-numeric-btn"
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          xpReward: Math.min(500, c.xpReward + 5),
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                  <span className="isiltasun-reward-suffix">XP irabaziko du</span>
                </div>

                <label className="isiltasun-reward-row isiltasun-toggle-row">
                  <input
                    type="checkbox"
                    checked={config.loseHearts}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, loseHearts: e.target.checked }))
                    }
                  />
                  <span className="isiltasun-reward-icon">💔</span>
                  <span className="isiltasun-reward-text">
                    Mari esnatzen bada, ikasle bakoitzak galduko du
                  </span>
                  <div className="isiltasun-numeric">
                    <button
                      type="button"
                      className="tool-numeric-btn"
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          heartsLoss: Math.max(1, c.heartsLoss - 1),
                        }))
                      }
                      disabled={!config.loseHearts}
                    >
                      −
                    </button>
                    <span className="isiltasun-numeric-value">
                      {config.heartsLoss}
                    </span>
                    <button
                      type="button"
                      className="tool-numeric-btn"
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          heartsLoss: Math.min(5, c.heartsLoss + 1),
                        }))
                      }
                      disabled={!config.loseHearts}
                    >
                      +
                    </button>
                  </div>
                  <span className="isiltasun-reward-suffix">bihotz</span>
                </label>
              </div>
            </div>
          </div>

          <div className="panel-form-actions" style={{ marginTop: 32 }}>
            <button
              type="button"
              className="panel-btn-secondary"
              onClick={handleExit}
            >
              Utzi
            </button>
            <button
              type="button"
              className="panel-cta-btn"
              onClick={handleStart}
            >
              Hasi erronka
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ====================== PIDIENDO MICRÓFONO ======================
  if (phase === 'requesting-mic') {
    return (
      <div className="tool-screen tool-isiltasuna-screen">
        <main className="tool-isiltasuna-waiting">
          <div className="tool-isiltasuna-d20">🎤</div>
          <h1 className="tool-isiltasuna-waiting-title">Mikrofonoa eskatzen…</h1>
          <p className="tool-isiltasuna-waiting-text">
            Onartu nabigatzaileko mikrofonoaren baimena erronka hasteko.
          </p>
        </main>
      </div>
    )
  }

  // ====================== MIC DENIED ======================
  if (phase === 'mic-denied') {
    return (
      <div className="tool-screen tool-isiltasuna-screen">
        <header className="tool-header">
          <div className="tool-classroom-name">{classroomName}</div>
          <div className="tool-title-mini">Mariren isiltasun-erronka</div>
          <div className="tool-header-actions">
            <button
              type="button"
              className="tool-icon-btn"
              onClick={handleExit}
              title="Atera"
            >
              ✕
            </button>
          </div>
        </header>

        <main className="tool-isiltasuna-waiting">
          <div className="tool-isiltasuna-d20" style={{ opacity: 0.4 }}>
            🎤
          </div>
          <h1 className="tool-isiltasuna-waiting-title">
            Mikrofonoa beharrezkoa da.
          </h1>
          <p className="tool-isiltasuna-waiting-text">
            Erronka honek zarata neurtzeko mikrofonoa behar du. Eman baimena
            nabigatzailearen ikonotik eta saiatu berriro.
          </p>
          <div className="panel-form-actions" style={{ marginTop: 32 }}>
            <button
              type="button"
              className="panel-btn-secondary"
              onClick={handleExit}
            >
              Atera
            </button>
            <button
              type="button"
              className="panel-cta-btn"
              onClick={handleStart}
            >
              Saiatu berriro
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ====================== RUNNING ======================
  if (phase === 'running') {
    const mm = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, '0')
    const ss = (remainingSeconds % 60).toString().padStart(2, '0')
    const isOverLimit = level > config.noiseLimit
    const isNear = !isOverLimit && level > config.noiseLimit * 0.85

    return (
      <div
        className={`tool-screen tool-isiltasuna-running ${
          isOverLimit ? 'isiltasuna-over' : isNear ? 'isiltasuna-near' : ''
        }`}
      >
        <header className="tool-header">
          <div className="tool-classroom-name">{classroomName}</div>
          <div className="tool-title-mini">
            <span className="isiltasuna-countdown">
              {mm}:{ss}
            </span>
          </div>
          <div className="tool-header-actions">
            <button
              type="button"
              className="tool-icon-btn"
              onClick={() => setMuted((m) => !m)}
              title={muted ? 'Aktibatu soinua' : 'Isildu'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <button
              type="button"
              className="tool-icon-btn"
              onClick={handleExit}
              title="Atera"
            >
              ✕
            </button>
          </div>
        </header>

        <main className="isiltasuna-stage">
          <div className="isiltasuna-mari-wrapper">
            <MariSleeping state="sleeping" />
          </div>

          <div className="isiltasuna-meter">
            <div className="isiltasuna-meter-labels">
              <span>Zarata-maila</span>
              <span className="isiltasuna-meter-value">{Math.round(level)}</span>
            </div>
            <div className="isiltasuna-meter-track">
              <div
                className="isiltasuna-meter-fill"
                style={{ width: `${Math.min(100, level)}%` }}
              />
              <div
                className="isiltasuna-meter-threshold"
                style={{ left: `${config.noiseLimit}%` }}
                aria-label="Muga"
              >
                <span className="isiltasuna-meter-threshold-label">
                  Muga · {config.noiseLimit}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ====================== SUCCEEDED ======================
  if (phase === 'succeeded') {
    return (
      <div className="tool-screen tool-isiltasuna-result tool-isiltasuna-result-success">
        <main className="tool-isiltasuna-result-content">
          <div className="isiltasuna-mari-result">
            <MariSleeping state="sleeping" />
          </div>
          <div className="tool-isiltasuna-result-text">
            <div className="battle-result-eyebrow">Garaipena</div>
            <h1 className="battle-result-title">Mari lasai dago.</h1>
            <p className="battle-result-sub">
              Klaseak isiltasunaren erronka gainditu du. Mariri eskerrak ikasleek
              indarrak hartu dituzte.
            </p>
            <div className="battle-result-rewards">
              <div className="battle-reward-item">
                <div className="battle-reward-icon">⚡</div>
                <div className="battle-reward-value">+{config.xpReward} XP</div>
                <div className="battle-reward-label">ikasle bakoitzeko</div>
              </div>
            </div>
            <div
              className="panel-form-actions"
              style={{ justifyContent: 'center', gap: 12 }}
            >
              <button
                type="button"
                className="panel-btn-secondary"
                onClick={handleRestart}
                disabled={busy}
              >
                Beste bat egin
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleExit}
                disabled={busy}
              >
                {busy ? 'Gordetzen…' : 'Itzuli ikasgelara'}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ====================== FAILED ======================
  return (
    <div className="tool-screen tool-isiltasuna-result tool-isiltasuna-result-failure">
      <main className="tool-isiltasuna-result-content">
        <div className="isiltasuna-mari-result isiltasuna-mari-shake">
          <MariSleeping state="awake" />
        </div>
        <div className="tool-isiltasuna-result-text">
          <div className="battle-result-eyebrow">Mari esnatu da</div>
          <h1 className="battle-result-title">MARI HASERRE DAGO.</h1>
          <p className="battle-result-sub">
            Zaratak Anbotoko amesgela hautsi du. Klaseak ezin izan du isiltasuna
            mantendu.
          </p>
          {config.loseHearts && (
            <div className="battle-result-rewards">
              <div className="battle-reward-item battle-reward-loss">
                <div className="battle-reward-icon">💔</div>
                <div className="battle-reward-value">
                  -{config.heartsLoss} bihotz
                </div>
                <div className="battle-reward-label">ikasle bakoitzari</div>
              </div>
            </div>
          )}
          <div
            className="panel-form-actions"
            style={{ justifyContent: 'center', gap: 12 }}
          >
            <button
              type="button"
              className="panel-btn-secondary"
              onClick={handleRestart}
              disabled={busy}
            >
              Beste bat egin
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleExit}
              disabled={busy}
            >
              {busy ? 'Gordetzen…' : 'Itzuli ikasgelara'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
