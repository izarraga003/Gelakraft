import type { ReactNode } from 'react'

type EmptyStateVariant =
  | 'students'
  | 'teams'
  | 'history'
  | 'powers'
  | 'requests'
  | 'events'
  | 'default'

type Props = {
  variant?: EmptyStateVariant
  title: string
  description?: string
  action?: ReactNode
}

/**
 * Empty state reutilizable con ilustración SVG temática (mitología vasca).
 * Mantiene consistencia visual y evita textos planos áridos en pantallas
 * sin contenido todavía.
 */
export default function EmptyState({
  variant = 'default',
  title,
  description,
  action,
}: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-illustration" aria-hidden="true">
        <EmptyIllustration variant={variant} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

function EmptyIllustration({ variant }: { variant: EmptyStateVariant }) {
  switch (variant) {
    case 'students':
      // Tres figuras pequeñas en círculo: alumnos esperando
      return (
        <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="es-glow-s" cx="50%" cy="60%" r="50%">
              <stop offset="0%" stopColor="rgba(184, 138, 60, 0.18)" />
              <stop offset="100%" stopColor="rgba(184, 138, 60, 0)" />
            </radialGradient>
          </defs>
          <ellipse cx="80" cy="105" rx="60" ry="8" fill="url(#es-glow-s)" />
          {/* Tres siluetas: dos cuerpos y uno con capucha tipo Mari */}
          <g opacity="0.7">
            <circle cx="40" cy="55" r="11" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M 27 85 Q 27 70 40 70 Q 53 70 53 85" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="120" cy="55" r="11" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M 107 85 Q 107 70 120 70 Q 133 70 133 85" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </g>
          <g>
            <circle cx="80" cy="45" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 65 80 Q 65 62 80 62 Q 95 62 95 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            {/* Cuarto lunar tras la cabeza central */}
            <path d="M 88 30 A 7 7 0 0 0 88 50 A 5 5 0 0 1 88 30 Z" fill="currentColor" opacity="0.5" />
          </g>
        </svg>
      )
    case 'teams':
      // Dos círculos entrelazados (taldeak)
      return (
        <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="es-glow-t" cx="50%" cy="60%" r="50%">
              <stop offset="0%" stopColor="rgba(184, 138, 60, 0.18)" />
              <stop offset="100%" stopColor="rgba(184, 138, 60, 0)" />
            </radialGradient>
          </defs>
          <ellipse cx="80" cy="105" rx="60" ry="8" fill="url(#es-glow-t)" />
          <circle cx="60" cy="60" r="32" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.55" />
          <circle cx="100" cy="60" r="32" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* Tres puntos pequeños dentro de cada círculo */}
          <circle cx="50" cy="55" r="3" fill="currentColor" opacity="0.6" />
          <circle cx="65" cy="68" r="3" fill="currentColor" opacity="0.6" />
          <circle cx="55" cy="72" r="2.5" fill="currentColor" opacity="0.6" />
          <circle cx="105" cy="55" r="3" fill="currentColor" />
          <circle cx="92" cy="68" r="3" fill="currentColor" />
          <circle cx="110" cy="72" r="2.5" fill="currentColor" />
        </svg>
      )
    case 'history':
      // Pergamino/scroll con líneas
      return (
        <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="es-glow-h" cx="50%" cy="60%" r="50%">
              <stop offset="0%" stopColor="rgba(184, 138, 60, 0.18)" />
              <stop offset="100%" stopColor="rgba(184, 138, 60, 0)" />
            </radialGradient>
          </defs>
          <ellipse cx="80" cy="105" rx="50" ry="6" fill="url(#es-glow-h)" />
          <path
            d="M 55 28 L 105 28 Q 115 28 115 38 L 115 90 Q 115 95 110 95 L 60 95 Q 50 95 50 85 L 50 35 Q 50 28 55 28 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M 58 40 L 95 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M 58 50 L 90 50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M 58 60 L 100 60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M 58 70 L 85 70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <path d="M 58 80 L 93 80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      )
    case 'powers':
      // Estrella/rune con destellos
      return (
        <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="es-glow-p" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(184, 138, 60, 0.22)" />
              <stop offset="100%" stopColor="rgba(184, 138, 60, 0)" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="60" r="48" fill="url(#es-glow-p)" />
          <path
            d="M 80 30 L 87 53 L 110 53 L 92 67 L 99 90 L 80 76 L 61 90 L 68 67 L 50 53 L 73 53 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="40" cy="40" r="2" fill="currentColor" opacity="0.6" />
          <circle cx="120" cy="42" r="1.5" fill="currentColor" opacity="0.5" />
          <circle cx="125" cy="80" r="2" fill="currentColor" opacity="0.6" />
          <circle cx="38" cy="85" r="1.5" fill="currentColor" opacity="0.5" />
        </svg>
      )
    case 'requests':
      // Sobre / pergamino con punto de notificación
      return (
        <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="es-glow-r" cx="50%" cy="60%" r="50%">
              <stop offset="0%" stopColor="rgba(184, 138, 60, 0.18)" />
              <stop offset="100%" stopColor="rgba(184, 138, 60, 0)" />
            </radialGradient>
          </defs>
          <ellipse cx="80" cy="100" rx="50" ry="6" fill="url(#es-glow-r)" />
          <rect x="48" y="38" width="64" height="44" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 48 42 L 80 64 L 112 42" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'events':
      // Luna creciente + estrellas
      return (
        <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="es-glow-e" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(184, 138, 60, 0.22)" />
              <stop offset="100%" stopColor="rgba(184, 138, 60, 0)" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="60" r="48" fill="url(#es-glow-e)" />
          <path
            d="M 90 30 A 30 30 0 0 0 90 90 A 22 22 0 0 1 90 30 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M 45 45 l 3 -3 l -3 -3 l -3 3 z M 42 40 l 0 -4 M 42 44 l 0 4 M 38 42 l -4 0 M 46 42 l 4 0"
            stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="120" cy="38" r="1.5" fill="currentColor" />
          <circle cx="130" cy="80" r="2" fill="currentColor" opacity="0.7" />
          <circle cx="35" cy="85" r="1.5" fill="currentColor" opacity="0.6" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="es-glow-d" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(184, 138, 60, 0.18)" />
              <stop offset="100%" stopColor="rgba(184, 138, 60, 0)" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="60" r="48" fill="url(#es-glow-d)" />
          <circle cx="80" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      )
  }
}
