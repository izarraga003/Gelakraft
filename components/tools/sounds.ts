/**
 * Sonidos sintetizados para las herramientas auxiliares (kontaketa, hautatzailea).
 */

type ToolSound =
  | 'tick'      // tick suave de countdown
  | 'alarm'     // alarma cuando el countdown llega a 0
  | 'rolling'   // tick rápido durante la animación del selector
  | 'ding'      // resultado final del selector
  | 'mari-wake' // Mari se despierta (isiltasun-erronka)
  | 'mari-success' // reto del silencio superado

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  try {
    ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)()
    return ctx
  } catch {
    return null
  }
}

function tone(opts: {
  freq: number
  duration: number
  type?: OscillatorType
  volume?: number
  delay?: number
  endFreq?: number
}) {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume()

  const { freq, duration, type = 'sine', volume = 0.2, delay = 0, endFreq } = opts
  const now = c.currentTime + delay
  const osc = c.createOscillator()
  const gain = c.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(0.01, endFreq), now + duration)
  }

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(volume, now + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(now)
  osc.stop(now + duration + 0.01)
}

export function playToolSound(kind: ToolSound) {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume()

  switch (kind) {
    case 'tick':
      // Pitido corto, agudo
      tone({ freq: 880, duration: 0.08, type: 'sine', volume: 0.15 })
      break
    case 'alarm': {
      // Sirena de alarma: dos tonos altos alternándose 4 veces, dos voces.
      // Total ~2.5 segundos, volumen alto.
      const pattern = [
        { freq: 880, delay: 0.0 },
        { freq: 1175, delay: 0.3 },
        { freq: 880, delay: 0.6 },
        { freq: 1175, delay: 0.9 },
        { freq: 880, delay: 1.2 },
        { freq: 1175, delay: 1.5 },
        { freq: 880, delay: 1.8 },
        { freq: 1175, delay: 2.1 },
      ]
      pattern.forEach(({ freq, delay }) => {
        // Voz principal (square = más estridente)
        tone({
          freq,
          duration: 0.28,
          type: 'square',
          volume: 0.38,
          delay,
        })
        // Voz aguda en octava superior (rica armónica)
        tone({
          freq: freq * 2,
          duration: 0.28,
          type: 'sawtooth',
          volume: 0.14,
          delay,
        })
      })
      // Resolución final descendente (claxon)
      tone({
        freq: 1175,
        endFreq: 220,
        duration: 0.65,
        type: 'sawtooth',
        volume: 0.32,
        delay: 2.4,
      })
      break
    }
    case 'mari-wake': {
      // Mari se despierta: sweep grave y amenazante + bajo
      tone({ freq: 220, endFreq: 70, duration: 0.7, type: 'sawtooth', volume: 0.35 })
      tone({ freq: 110, endFreq: 50, duration: 0.7, type: 'square', volume: 0.25, delay: 0.05 })
      // Grito metálico encima
      tone({ freq: 880, endFreq: 440, duration: 0.45, type: 'sawtooth', volume: 0.2, delay: 0.15 })
      // Reverberación final
      tone({ freq: 60, duration: 0.9, type: 'sine', volume: 0.18, delay: 0.4 })
      break
    }
    case 'mari-success': {
      // Reto superado: arpegio etéreo descendente con tono cálido
      tone({ freq: 1046.5, duration: 0.35, type: 'sine', volume: 0.18 })
      tone({ freq: 783.99, duration: 0.4, type: 'sine', volume: 0.2, delay: 0.15 })
      tone({ freq: 659.25, duration: 0.5, type: 'triangle', volume: 0.22, delay: 0.3 })
      tone({ freq: 523.25, duration: 0.7, type: 'triangle', volume: 0.25, delay: 0.45 })
      tone({ freq: 261.63, duration: 0.7, type: 'sine', volume: 0.18, delay: 0.5 })
      break
    }
    case 'rolling':
      // Click muy corto y discreto
      tone({ freq: 660, duration: 0.04, type: 'square', volume: 0.08 })
      break
    case 'ding':
      // Campana ascendente: arpegio resolutivo
      tone({ freq: 523.25, duration: 0.18, type: 'triangle', volume: 0.22 })
      tone({ freq: 659.25, duration: 0.18, type: 'triangle', volume: 0.22, delay: 0.06 })
      tone({ freq: 783.99, duration: 0.55, type: 'triangle', volume: 0.28, delay: 0.12 })
      tone({ freq: 1046.5, duration: 0.55, type: 'sine', volume: 0.2, delay: 0.18 })
      break
  }
}
