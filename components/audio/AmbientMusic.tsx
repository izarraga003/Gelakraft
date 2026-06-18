'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Música ambient procedural generada con Web Audio API.
 * Sin assets externos. Pads suaves + arpegio melódico aleatorio sobre escala pentatónica.
 *
 * El usuario puede activar/desactivar con un botón. La preferencia se
 * guarda en localStorage. La música solo arranca tras la primera interacción
 * del usuario (limitación de autoplay del navegador).
 */

const STORAGE_KEY = 'gelakraft-music-enabled'

// Escala pentatónica mayor en A (A C# E F# B) — sonido evocador
const PENTATONIC_HZ = [
  220.0, // A3
  261.63, // C4 (más bajo de lo necesario, sirve)
  329.63, // E4
  392.0, // G4
  440.0, // A4
  523.25, // C5
  659.25, // E5
]

// Notas largas de pad: triadas suaves
const PAD_NOTES = [
  [110, 164.81, 220], // A2 - E3 - A3
  [98, 146.83, 196], // G2 - D3 - G3
  [123.47, 185, 246.94], // B2 - F#3 - B3
]

export default function AmbientMusic() {
  const [enabled, setEnabled] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [showControls, setShowControls] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const intervalRef = useRef<number | null>(null)
  const padTimeoutRef = useRef<number | null>(null)

  // Cargar preferencia inicial
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      // No arrancamos solos por la política de autoplay.
      // El alumno tendrá que pulsar el toggle al menos una vez.
      // Pero el botón aparecerá con estado "off" para que active.
    }
  }, [])

  function startMusic() {
    if (audioCtxRef.current) return

    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new Ctor()
      const master = ctx.createGain()
      master.gain.value = volume * 0.5
      master.connect(ctx.destination)

      audioCtxRef.current = ctx
      masterGainRef.current = master

      // Loop de arpegios cada 2.5-4 segundos
      intervalRef.current = window.setInterval(() => {
        playArpeggioNote()
      }, 700)

      // Loop de pads cada 8-12 segundos
      schedulePad()
    } catch (e) {
      console.error('Audio context error:', e)
    }
  }

  function schedulePad() {
    if (!audioCtxRef.current || !masterGainRef.current) return
    playPad()
    // Siguiente pad en 8-12 segundos
    padTimeoutRef.current = window.setTimeout(
      () => schedulePad(),
      8000 + Math.random() * 4000
    )
  }

  function playPad() {
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return

    const chord = PAD_NOTES[Math.floor(Math.random() * PAD_NOTES.length)]
    const duration = 7 // segundos

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.value = 0
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.12 - idx * 0.02, ctx.currentTime + 2)
      gain.gain.setValueAtTime(0.12 - idx * 0.02, ctx.currentTime + duration - 2)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(master)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration + 0.1)
    })
  }

  function playArpeggioNote() {
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return

    // No tocar siempre; sólo el 60% de las veces
    if (Math.random() > 0.6) return

    const freq = PENTATONIC_HZ[Math.floor(Math.random() * PENTATONIC_HZ.length)]
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.value = freq

    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.08, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)

    osc.connect(gain)
    gain.connect(master)
    osc.start(now)
    osc.stop(now + 1.3)
  }

  function stopMusic() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (padTimeoutRef.current !== null) {
      clearTimeout(padTimeoutRef.current)
      padTimeoutRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    masterGainRef.current = null
  }

  useEffect(() => {
    return () => {
      stopMusic()
    }
  }, [])

  // Ajustar volumen en tiempo real
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume * 0.5
    }
  }, [volume])

  function toggleMusic() {
    const next = !enabled
    setEnabled(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(next))
    }
    if (next) {
      startMusic()
    } else {
      stopMusic()
    }
  }

  return (
    <div className="music-control" onMouseLeave={() => setShowControls(false)}>
      <button
        type="button"
        className={`music-toggle ${enabled ? 'music-toggle-on' : ''}`}
        onClick={toggleMusic}
        onMouseEnter={() => setShowControls(true)}
        aria-label={enabled ? 'Musika itzali' : 'Musika piztu'}
        title={enabled ? 'Musika itzali' : 'Musika piztu'}
      >
        {enabled ? '🎵' : '🔇'}
      </button>
      {enabled && showControls && (
        <div className="music-volume-popup">
          <label className="music-volume-label">
            <span>Bolumena</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="music-volume-slider"
              aria-label="Bolumena"
            />
          </label>
        </div>
      )}
    </div>
  )
}
