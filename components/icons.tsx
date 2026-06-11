/**
 * Todos los iconos SVG del proyecto.
 * Cada icono usa `currentColor` para que herede el color del elemento padre vía CSS.
 */

type IconProps = {
  size?: number
  className?: string
}

// ============================================
// LOGO / MARCA
// ============================================

/**
 * Luna creciente principal (logo de GELAKRAFT).
 * `variant` controla el detalle: 'simple' para favicon, 'detailed' para hero.
 */
export function MoonIcon({
  size = 32,
  variant = 'detailed',
}: IconProps & { variant?: 'simple' | 'detailed' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform="translate(50, 50)">
        <path
          d="M 5,-26 A 26,26 0 1,0 5,26 A 20,24 0 1,1 5,-26 Z"
          fill="#D4A85C"
        />
        {variant === 'detailed' && (
          <path
            d="M 3,-22 A 22,22 0 1,0 3,22 A 16,20 0 1,1 3,-22 Z"
            fill="#B68A3E"
            opacity="0.4"
          />
        )}
      </g>
    </svg>
  )
}

/**
 * Luna grande con halo (para el CTA final).
 */
export function MoonHaloIcon({ size = 72 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="36" cy="36" r="34" fill="#D4A85C" opacity="0.06" />
      <circle cx="36" cy="36" r="26" fill="#D4A85C" opacity="0.10" />
      <g transform="translate(36, 36)">
        <path d="M 5,-22 A 22,22 0 1,0 5,22 A 16,20 0 1,1 5,-22 Z" fill="#D4A85C" />
        <path d="M 3,-18 A 18,18 0 1,0 3,18 A 13,16 0 1,1 3,-18 Z" fill="#EFE5D0" opacity="0.3" />
      </g>
    </svg>
  )
}

// ============================================
// FLECHA (botón primario)
// ============================================

export function ArrowRightIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="btn-primary-arrow"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ============================================
// ICONOS DE HERRAMIENTAS
// ============================================

export function FlameIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22 5 C 20 11, 14 14, 14 22 C 14 30, 18 36, 22 36 C 26 36, 30 30, 30 22 C 30 17, 27 14, 24 11 C 24 14, 23 16, 22 17 C 23 13, 22 9, 22 5 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M22 21 C 20 24, 19 27, 19 30 C 19 33, 20 35, 22 35 C 24 35, 25 33, 25 30 C 25 27, 24 24, 22 21 Z" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function SilenceMoonIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 25,6 A 16,16 0 1,0 25,38 A 12,15 0 1,1 25,6 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M 30,11 H 36 L 30,17 H 36" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <path d="M 32,22 H 36 L 32,26 H 36" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    </svg>
  )
}

export function ChestIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="7" y="16" width="30" height="22" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M 7 16 L 7 12 A 4 4 0 0 1 11 8 H 33 A 4 4 0 0 1 37 12 V 16" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="20" y="22" width="4" height="6" fill="currentColor" />
      <path d="M 22 6 V 3 M 14 8 L 11 5 M 30 8 L 33 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

export function HourglassIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 10 7 H 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 10 37 H 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 12 7 L 12 11 L 22 22 L 12 33 L 12 37" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M 32 7 L 32 11 L 22 22 L 32 33 L 32 37" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M 14 11 L 30 11 L 22 20 Z" fill="currentColor" opacity="0.35" />
    </svg>
  )
}

export function StopwatchIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="22" cy="25" r="13" stroke="currentColor" strokeWidth="1.8" />
      <rect x="19" y="6" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M 16 10 H 28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 33 14 L 36 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 22 25 L 22 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 22 25 L 28 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="22" cy="25" r="1.6" fill="currentColor" />
    </svg>
  )
}

export function D20Icon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 22 5 L 36 13 L 36 31 L 22 39 L 8 31 L 8 13 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M 22 5 L 22 22 M 22 22 L 8 13 M 22 22 L 36 13 M 22 22 L 22 39" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <text x="22" y="29" textAnchor="middle" fontFamily="var(--font-fraunces), serif" fontSize="9" fontWeight="600" fill="currentColor">20</text>
    </svg>
  )
}

// ============================================
// DEIDADES (Mari y Sugaar) — versión grande
// ============================================

export function MariBigIcon({ size = 56 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(28, 28)">
        <path d="M 4,-22 A 22,22 0 1,0 4,22 A 16,20 0 1,1 4,-22 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M 2,-18 A 18,18 0 1,0 2,18 A 13,16 0 1,1 2,-18 Z" fill="currentColor" opacity="0.25" />
      </g>
    </svg>
  )
}

export function SugaarBigIcon({ size = 56 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M28 6 C 25 14, 17 18, 17 28 C 17 38, 23 46, 28 46 C 33 46, 39 38, 39 28 C 39 22, 35 18, 31 14 C 31 18, 29 21, 28 22 C 30 17, 28 12, 28 6 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M28 26 C 25 30, 24 34, 24 38 C 24 42, 25 44, 28 44 C 31 44, 32 42, 32 38 C 32 34, 31 30, 28 26 Z" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// ============================================
// CRIATURAS MITOLÓGICAS (las 4 clases)
// ============================================

export function SorginakIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(22, 26)">
        <path d="M 2,-10 A 10,10 0 1,0 2,10 A 7,9 0 1,1 2,-10 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </g>
      <g fill="currentColor">
        <path d="M 10,8 L 11,10 L 13,10.5 L 11,11 L 10,13 L 9,11 L 7,10.5 L 9,10 Z" />
        <path d="M 34,8 L 34.8,9.5 L 36.5,10 L 34.8,10.5 L 34,12 L 33.2,10.5 L 31.5,10 L 33.2,9.5 Z" />
        <path d="M 36,30 L 37,32 L 39,32.5 L 37,33 L 36,35 L 35,33 L 33,32.5 L 35,32 Z" />
      </g>
    </svg>
  )
}

export function LamiakIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 8 16 Q 22 7, 36 16 L 36 19 L 8 19 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      <circle cx="22" cy="13" r="1.4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="11" y1="19" x2="11" y2="32" />
        <line x1="15" y1="19" x2="15" y2="34" />
        <line x1="19" y1="19" x2="19" y2="36" />
        <line x1="23" y1="19" x2="23" y2="36" />
        <line x1="27" y1="19" x2="27" y2="36" />
        <line x1="31" y1="19" x2="31" y2="34" />
        <line x1="35" y1="19" x2="35" y2="32" />
      </g>
    </svg>
  )
}

export function JentilakIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 9 18 L 9 38 L 16 38 L 16 18 Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none" />
      <path d="M 28 18 L 28 38 L 35 38 L 35 18 Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none" />
      <path d="M 6 10 L 38 10 L 38 18 L 6 18 Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none" />
      <line x1="4" y1="38" x2="40" y2="38" stroke="currentColor" strokeWidth="1.3" opacity="0.55" strokeLinecap="round" />
    </svg>
  )
}

export function BasajaunIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 22 36 L 22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="16" r="11" stroke="currentColor" strokeWidth="1.7" fill="none" />
      <path d="M 22 22 L 22 14 M 16 18 L 22 14 M 28 18 L 22 14" stroke="currentColor" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
    </svg>
  )
}

// ============================================
// ICONOS DE PRIVACIDAD
// ============================================

export function KeyIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="14" cy="22" r="8" stroke="currentColor" strokeWidth="1.7" fill="none" />
      <circle cx="14" cy="22" r="3" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M 22 22 L 36 22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M 30 22 L 30 28 M 34 22 L 34 26" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function EnvelopeIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6" y="14" width="32" height="20" rx="2" stroke="currentColor" strokeWidth="1.7" fill="none" />
      <path d="M 8 16 L 22 26 L 36 16" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function DocumentCheckIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 12 6 H 28 L 34 12 V 38 H 12 Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none" />
      <path d="M 28 6 V 12 H 34" stroke="currentColor" strokeWidth="1.7" fill="none" />
      <path d="M 16 24 L 21 29 L 30 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
