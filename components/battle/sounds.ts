/**
 * Sintetizador simple de efectos sonoros para la batalla.
 * Usa Web Audio API nativa, sin librerías externas ni archivos mp3.
 *
 * TODO (próxima sesión): añadir música de fondo épica como archivo .mp3
 * en /public/audio/ y crear un sistema de reproducción en bucle con fade-in/out.
 */

type SoundKind =
  | 'hit-normal'
  | 'hit-crit'
  | 'hit-miss'
  | 'enemy-attack'
  | 'victory'
  | 'defeat'

let audioContext: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (audioContext) return audioContext
  try {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)()
    return audioContext
  } catch {
    return null
  }
}

/**
 * Toca una nota sintetizada.
 */
function playTone(opts: {
  ctx: AudioContext
  freq: number
  duration: number
  type?: OscillatorType
  volume?: number
  detune?: number
  delay?: number
  attack?: number
  release?: number
}) {
  const {
    ctx,
    freq,
    duration,
    type = 'sine',
    volume = 0.3,
    detune = 0,
    delay = 0,
    attack = 0.005,
    release = 0.05,
  } = opts

  const now = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  osc.detune.setValueAtTime(detune, now)

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(volume, now + attack)
  gain.gain.setValueAtTime(volume, now + duration - release)
  gain.gain.linearRampToValueAtTime(0, now + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + duration + 0.01)
}

/**
 * Glissando: barrido de frecuencia de A a B.
 */
function playSweep(opts: {
  ctx: AudioContext
  fromFreq: number
  toFreq: number
  duration: number
  type?: OscillatorType
  volume?: number
  delay?: number
}) {
  const {
    ctx,
    fromFreq,
    toFreq,
    duration,
    type = 'sawtooth',
    volume = 0.25,
    delay = 0,
  } = opts

  const now = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(fromFreq, now)
  osc.frequency.exponentialRampToValueAtTime(Math.max(0.01, toFreq), now + duration)

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(volume, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + duration + 0.01)
}

/**
 * Reproducir un efecto.
 * Los usuarios pueden silenciar la batalla — el componente comprueba el flag
 * antes de llamar a esta función.
 */
export function playSound(kind: SoundKind) {
  const ctx = getCtx()
  if (!ctx) return

  // Algunos navegadores pausan el AudioContext hasta interacción del usuario.
  // Reanudar si está suspendido.
  if (ctx.state === 'suspended') {
    ctx.resume()
  }

  switch (kind) {
    case 'hit-normal': {
      // Golpe seco, frecuencia media, breve
      playSweep({ ctx, fromFreq: 320, toFreq: 90, duration: 0.18, type: 'square', volume: 0.18 })
      break
    }
    case 'hit-crit': {
      // Golpe potente, más bajo y largo, con segunda capa metálica
      playSweep({ ctx, fromFreq: 220, toFreq: 50, duration: 0.45, type: 'sawtooth', volume: 0.3 })
      playTone({ ctx, freq: 880, duration: 0.18, type: 'triangle', volume: 0.15, delay: 0.05 })
      playTone({ ctx, freq: 1320, duration: 0.12, type: 'triangle', volume: 0.1, delay: 0.1 })
      break
    }
    case 'hit-miss': {
      // Sonido "whoosh" agudo y rápido, indicando esquive
      playSweep({ ctx, fromFreq: 1200, toFreq: 600, duration: 0.16, type: 'sine', volume: 0.15 })
      break
    }
    case 'enemy-attack': {
      // Rugido bajo, amenazante
      playSweep({ ctx, fromFreq: 180, toFreq: 60, duration: 0.5, type: 'sawtooth', volume: 0.28 })
      playSweep({ ctx, fromFreq: 90, toFreq: 40, duration: 0.5, type: 'square', volume: 0.18, delay: 0.05 })
      break
    }
    case 'victory': {
      // Tres notas ascendentes: triunfo
      const base = 261.63 // C4
      playTone({ ctx, freq: base, duration: 0.18, type: 'triangle', volume: 0.25 })
      playTone({ ctx, freq: base * 1.25, duration: 0.18, type: 'triangle', volume: 0.25, delay: 0.18 })
      playTone({ ctx, freq: base * 1.5, duration: 0.18, type: 'triangle', volume: 0.25, delay: 0.36 })
      playTone({ ctx, freq: base * 2, duration: 0.55, type: 'triangle', volume: 0.3, delay: 0.54 })
      // Capa de quinta encima del final
      playTone({ ctx, freq: base * 3, duration: 0.55, type: 'sine', volume: 0.18, delay: 0.54 })
      break
    }
    case 'defeat': {
      // Tres notas descendentes: derrota
      const base = 392 // G4
      playTone({ ctx, freq: base, duration: 0.25, type: 'sawtooth', volume: 0.22 })
      playTone({ ctx, freq: base * 0.85, duration: 0.25, type: 'sawtooth', volume: 0.22, delay: 0.22 })
      playTone({ ctx, freq: base * 0.7, duration: 0.65, type: 'sawtooth', volume: 0.25, delay: 0.44 })
      break
    }
  }
}
