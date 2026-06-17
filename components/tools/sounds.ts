/**
 * Sonidos sintetizados para las herramientas auxiliares (kontaketa, hautatzailea).
 */

type ToolSound =
  | 'tick'      // tick suave de countdown
  | 'alarm'     // alarma cuando el countdown llega a 0
  | 'rolling'   // tick rápido durante la animación del selector
  | 'ding'      // resultado final del selector

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
}) {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume()

  const { freq, duration, type = 'sine', volume = 0.2, delay = 0 } = opts
  const now = c.currentTime + delay
  const osc = c.createOscillator()
  const gain = c.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, now)

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
    case 'alarm':
      // Tres pitidos agudos
      tone({ freq: 988, duration: 0.18, type: 'square', volume: 0.22 })
      tone({ freq: 988, duration: 0.18, type: 'square', volume: 0.22, delay: 0.25 })
      tone({ freq: 1318, duration: 0.45, type: 'square', volume: 0.25, delay: 0.5 })
      break
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
