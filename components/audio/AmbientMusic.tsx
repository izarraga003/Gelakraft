'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Música ambient procedural generada con Web Audio API.
 * El usuario despliega los controles con click (no hover) para evitar
 * que el panel desaparezca al intentar mover el slider.
 */

const STORAGE_KEY = 'gelakraft-music-enabled'

const PENTATONIC_HZ = [220.0, 261.63, 329.63, 392.0, 440.0, 523.25, 659.25]
const PAD_NOTES = [
  [110, 164.81, 220],
  [98, 146.83, 196],
  [123.47, 185, 246.94],
]

export default function AmbientMusic() {
  const [enabled, setEnabled] = useState(false)
  const [volume, setVolume] = useState(0.55)
  const [open, setOpen] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const intervalRef = useRef<number | null>(null)
  const padTimeoutRef = useRef<number | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  // Cargar preferencia (no autoplay, solo recordamos)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedVol = localStorage.getItem(STORAGE_KEY + '-volume')
    if (storedVol) {
      const v = parseFloat(storedVol)
      if (!isNaN(v)) {
        // Migración: si el usuario tenía volumen muy bajo (default antiguo),
        // subirlo al nuevo default automáticamente.
        const migrated = v < 0.4 ? 0.55 : v
        setVolume(Math.max(0, Math.min(1, migrated)))
      }
    }
  }, [])

  // Cerrar popup al hacer click fuera. Usamos `click` (no mousedown) para
  // evitar interferir con el drag del input range, que necesita mousedown
  // para iniciar el arrastre y mouseup para terminarlo.
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  function startMusic() {
    if (audioCtxRef.current) return
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new Ctor()
      const master = ctx.createGain()
      master.gain.value = volume
      master.connect(ctx.destination)
      audioCtxRef.current = ctx
      masterGainRef.current = master
      intervalRef.current = window.setInterval(playArpeggioNote, 700)
      schedulePad()
    } catch (e) {
      console.error('Audio context error:', e)
    }
  }

  function schedulePad() {
    if (!audioCtxRef.current || !masterGainRef.current) return
    playPad()
    padTimeoutRef.current = window.setTimeout(
      schedulePad,
      8000 + Math.random() * 4000
    )
  }

  function playPad() {
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return
    const chord = PAD_NOTES[Math.floor(Math.random() * PAD_NOTES.length)]
    const duration = 7
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
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

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY + '-volume', String(volume))
    }
  }, [volume])

  function toggleMusic() {
    const next = !enabled
    setEnabled(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(next))
    }
    if (next) startMusic()
    else stopMusic()
  }

  return (
    <div className="music-control" ref={wrapperRef}>
      <button
        type="button"
        className={`music-toggle ${enabled ? 'music-toggle-on' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Musika kontrolak"
        title="Musika kontrolak"
        aria-expanded={open}
      >
        {enabled ? '🎵' : '🔇'}
      </button>

      {open && (
        <div
          className="music-popup"
          role="dialog"
          aria-label="Musika"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="music-popup-header">
            <span className="music-popup-title">Musika giroa</span>
            <button
              type="button"
              className={`music-popup-toggle ${enabled ? 'music-popup-toggle-on' : ''}`}
              onClick={toggleMusic}
            >
              {enabled ? 'Itzali' : 'Piztu'}
            </button>
          </div>
          <label className="music-popup-volume">
            <span>
              Bolumena
              <span className="music-popup-volume-value">
                {Math.round(volume * 100)}%
              </span>
            </span>
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
