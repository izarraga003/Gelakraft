/**
 * Renderiza un avatar SVG por capas, basado en AvatarConfig.
 * Reusable a cualquier tamaño (cabe en chip 24px o hero card 180px).
 */

import type { AvatarConfig } from '@/lib/students/avatar'

type Props = {
  config: AvatarConfig
  size?: number
  className?: string
}

// ============================================================
// PALETAS DE COLOR
// ============================================================

const BG_COLORS: Record<string, [string, string]> = {
  urrea: ['#E5D9BC', '#B68A3E'],
  sutea: ['#E27A35', '#C24617'],
  iluntze: ['#2C4759', '#1B2730'],
  pago: ['#4A6B3A', '#2E4524'],
  lamia: ['#3A7CA5', '#1F4A66'],
  sorgina: ['#7C3C91', '#4B2257'],
  ekaitza: ['#566677', '#2E3845'],
  argia: ['#FFE082', '#FFB74D'],
}

const SKIN_COLORS: Record<string, string> = {
  light: '#F4E0CC',
  medium: '#E0BB94',
  tan: '#C49166',
  dark: '#8B5B3A',
}

const HAIR_COLORS: Record<string, string> = {
  black: '#1B1410',
  brown: '#5C3A21',
  blonde: '#D9B774',
  red: '#A4351F',
  grey: '#9B9B9B',
  silver: '#D5D8DD',
  magic: '#9B59E0',
}

const OUTFIT_COLORS: Record<string, { primary: string; secondary: string }> = {
  tunic: { primary: '#8B6234', secondary: '#5C3A21' },
  vest: { primary: '#C2541A', secondary: '#7A2F0E' },
  robe: { primary: '#3A5570', secondary: '#1F3045' },
  sorgina: { primary: '#5C2C7A', secondary: '#321648' },
  jentila: { primary: '#6B5024', secondary: '#3D2E15' },
  lamia: { primary: '#3A8AAA', secondary: '#1F5266' },
  armor: { primary: '#6B7280', secondary: '#374151' },
  cape: { primary: '#A4351F', secondary: '#5C1E10' },
}

// ============================================================
// COMPONENTE
// ============================================================

export default function AvatarRender({ config, size = 100, className }: Props) {
  const [bgFrom, bgTo] = BG_COLORS[config.bgColor] ?? BG_COLORS.urrea
  const skin = SKIN_COLORS[config.skinTone] ?? SKIN_COLORS.medium
  const hair = HAIR_COLORS[config.hairColor] ?? HAIR_COLORS.brown
  const outfit = OUTFIT_COLORS[config.outfit] ?? OUTFIT_COLORS.tunic

  // ID único para gradientes (evitar colisiones si se renderizan muchos avatares a la vez)
  const uid = `${config.bgColor}-${config.skinTone}-${config.hairStyle}-${config.outfit}`

  const isGlow = config.eyes === 'glow'
  const isMagicHair = config.hairColor === 'magic'

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor={bgFrom} />
          <stop offset="100%" stopColor={bgTo} />
        </radialGradient>
        {isMagicHair && (
          <linearGradient id={`magic-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B59E0" />
            <stop offset="50%" stopColor="#5BC3E0" />
            <stop offset="100%" stopColor="#E55B9B" />
          </linearGradient>
        )}
      </defs>

      {/* Fondo circular */}
      <circle cx="100" cy="100" r="100" fill={`url(#bg-${uid})`} />

      {/* Cuerpo (outfit) - parte de abajo */}
      {renderOutfit(config.outfit, outfit, skin)}

      {/* Cabeza */}
      <ellipse cx="100" cy="92" rx="38" ry="42" fill={skin} />

      {/* Orejas */}
      <ellipse cx="62" cy="95" rx="5" ry="8" fill={skin} />
      <ellipse cx="138" cy="95" rx="5" ry="8" fill={skin} />

      {/* Pelo (cubre arriba) */}
      {renderHair(
        config.hairStyle,
        isMagicHair ? `url(#magic-${uid})` : hair,
        hair
      )}

      {/* Cejas — derivar color del pelo */}
      {config.hairStyle !== 'bald' && renderEyebrows(hair)}

      {/* Ojos */}
      {renderEyes(config.eyes)}

      {/* Boca */}
      {renderMouth(config.mouth)}

      {/* Accesorio */}
      {config.accessory && config.accessory !== 'none' && renderAccessory(config.accessory)}

      {/* Aura de glow si tiene */}
      {isGlow && (
        <>
          <circle cx="82" cy="90" r="3" fill="#FFE082" opacity="0.9" />
          <circle cx="118" cy="90" r="3" fill="#FFE082" opacity="0.9" />
        </>
      )}
    </svg>
  )
}

// ============================================================
// CAPAS
// ============================================================

function renderHair(
  style: string,
  color: string,
  solidColor: string
): React.ReactElement | null {
  switch (style) {
    case 'short':
      return (
        <path
          d="M 62 80 Q 62 50 100 50 Q 138 50 138 80 L 138 88 Q 120 80 100 80 Q 80 80 62 88 Z"
          fill={color}
        />
      )
    case 'wavy':
      return (
        <g fill={color}>
          <path d="M 60 88 Q 60 48 100 48 Q 140 48 140 88 Q 140 75 130 76 Q 135 70 125 72 Q 130 64 117 70 Q 122 58 105 65 Q 110 55 95 62 Q 88 55 80 66 Q 72 60 70 72 Q 60 70 65 78 Q 60 80 60 88 Z" />
        </g>
      )
    case 'long':
      return (
        <g fill={color}>
          <path d="M 58 88 Q 58 48 100 48 Q 142 48 142 88 L 144 150 L 130 140 L 130 100 L 100 78 L 70 100 L 70 140 L 56 150 Z" />
        </g>
      )
    case 'bun':
      return (
        <g fill={color}>
          <circle cx="100" cy="42" r="22" />
          <path d="M 62 88 Q 62 55 100 55 Q 138 55 138 88 L 138 92 Q 120 84 100 84 Q 80 84 62 92 Z" />
        </g>
      )
    case 'curly':
      return (
        <g fill={color}>
          <circle cx="80" cy="60" r="14" />
          <circle cx="100" cy="50" r="16" />
          <circle cx="120" cy="60" r="14" />
          <circle cx="70" cy="72" r="11" />
          <circle cx="130" cy="72" r="11" />
        </g>
      )
    case 'mohawk':
      return (
        <g fill={color}>
          <path d="M 90 35 L 110 35 L 115 80 L 85 80 Z" />
          <path d="M 65 84 Q 75 78 85 80 L 85 88 Q 75 84 65 88 Z" fill={solidColor} />
          <path d="M 135 84 Q 125 78 115 80 L 115 88 Q 125 84 135 88 Z" fill={solidColor} />
        </g>
      )
    case 'bald':
      return null
    default:
      return null
  }
}

function renderEyebrows(color: string): React.ReactElement {
  return (
    <g fill={color}>
      <ellipse cx="84" cy="88" rx="6" ry="2" />
      <ellipse cx="116" cy="88" rx="6" ry="2" />
    </g>
  )
}

function renderEyes(style: string): React.ReactElement {
  switch (style) {
    case 'wide':
      return (
        <g>
          <circle cx="84" cy="100" r="6" fill="white" />
          <circle cx="116" cy="100" r="6" fill="white" />
          <circle cx="84" cy="100" r="3" fill="#1B2730" />
          <circle cx="116" cy="100" r="3" fill="#1B2730" />
        </g>
      )
    case 'cheerful':
      return (
        <g stroke="#1B2730" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M 80 102 Q 84 96 90 102" />
          <path d="M 110 102 Q 114 96 122 102" />
        </g>
      )
    case 'serious':
      return (
        <g fill="#1B2730">
          <ellipse cx="84" cy="100" rx="4" ry="3" />
          <ellipse cx="116" cy="100" rx="4" ry="3" />
        </g>
      )
    case 'glow':
      return (
        <g>
          <circle cx="84" cy="100" r="5" fill="#FFE082" />
          <circle cx="116" cy="100" r="5" fill="#FFE082" />
          <circle cx="84" cy="100" r="2" fill="#FFD179" />
          <circle cx="116" cy="100" r="2" fill="#FFD179" />
        </g>
      )
    case 'default':
    default:
      return (
        <g fill="#1B2730">
          <ellipse cx="84" cy="100" rx="3" ry="4" />
          <ellipse cx="116" cy="100" rx="3" ry="4" />
        </g>
      )
  }
}

function renderMouth(style: string): React.ReactElement {
  switch (style) {
    case 'open':
      return (
        <ellipse cx="100" cy="118" rx="6" ry="4" fill="#5C2820" />
      )
    case 'neutral':
      return (
        <line
          x1="92"
          y1="118"
          x2="108"
          y2="118"
          stroke="#5C2820"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )
    case 'smirk':
      return (
        <path
          d="M 90 118 Q 100 122 112 116"
          stroke="#5C2820"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )
    case 'smile':
    default:
      return (
        <path
          d="M 88 116 Q 100 124 112 116"
          stroke="#5C2820"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )
  }
}

function renderOutfit(
  style: string,
  colors: { primary: string; secondary: string },
  skin: string
): React.ReactElement {
  // Base de cuello+hombros para casi todos
  const neck = (
    <rect x="92" y="125" width="16" height="10" fill={skin} />
  )

  switch (style) {
    case 'vest':
      return (
        <g>
          {neck}
          <path d="M 50 200 L 60 145 Q 100 130 140 145 L 150 200 Z" fill={colors.primary} />
          <path d="M 90 145 L 90 200 L 110 200 L 110 145 Z" fill={colors.secondary} />
        </g>
      )
    case 'robe':
      return (
        <g>
          {neck}
          <path d="M 40 200 L 60 145 Q 100 130 140 145 L 160 200 Z" fill={colors.primary} />
          <line x1="100" y1="135" x2="100" y2="200" stroke={colors.secondary} strokeWidth="3" />
        </g>
      )
    case 'sorgina':
      return (
        <g>
          {neck}
          <path d="M 40 200 L 55 145 Q 100 125 145 145 L 160 200 Z" fill={colors.primary} />
          {/* Estrellas */}
          <text x="78" y="170" fill="#E5D9BC" fontSize="10" opacity="0.7">✦</text>
          <text x="115" y="180" fill="#E5D9BC" fontSize="10" opacity="0.7">✦</text>
          <text x="90" y="190" fill="#E5D9BC" fontSize="8" opacity="0.6">✦</text>
        </g>
      )
    case 'jentila':
      return (
        <g>
          {neck}
          <path d="M 50 200 L 60 145 Q 100 130 140 145 L 150 200 Z" fill={colors.primary} />
          <path d="M 70 145 L 76 200 L 124 200 L 130 145 Z" fill={colors.secondary} opacity="0.5" />
        </g>
      )
    case 'lamia':
      return (
        <g>
          {neck}
          <path d="M 45 200 L 60 145 Q 100 130 140 145 L 155 200 Z" fill={colors.primary} />
          {/* Patrón de escamas */}
          <path d="M 70 165 Q 80 162 90 165 Q 100 162 110 165 Q 120 162 130 165" stroke={colors.secondary} strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M 65 180 Q 80 177 95 180 Q 110 177 125 180 Q 135 178 140 180" stroke={colors.secondary} strokeWidth="1.5" fill="none" opacity="0.7" />
        </g>
      )
    case 'armor':
      return (
        <g>
          {neck}
          <path d="M 50 200 L 60 145 Q 100 130 140 145 L 150 200 Z" fill={colors.primary} />
          <circle cx="100" cy="160" r="8" fill={colors.secondary} stroke={colors.secondary} strokeWidth="2" />
          <rect x="58" y="160" width="6" height="40" fill={colors.secondary} />
          <rect x="136" y="160" width="6" height="40" fill={colors.secondary} />
        </g>
      )
    case 'cape':
      return (
        <g>
          {neck}
          {/* Capa al fondo */}
          <path d="M 30 200 L 50 140 Q 75 130 100 130 Q 125 130 150 140 L 170 200 Z" fill={colors.primary} opacity="0.85" />
          {/* Camisa */}
          <path d="M 60 200 L 70 145 Q 100 135 130 145 L 140 200 Z" fill={colors.secondary} />
        </g>
      )
    case 'tunic':
    default:
      return (
        <g>
          {neck}
          <path d="M 55 200 L 65 145 Q 100 132 135 145 L 145 200 Z" fill={colors.primary} />
          <line x1="100" y1="145" x2="100" y2="180" stroke={colors.secondary} strokeWidth="2" />
        </g>
      )
  }
}

function renderAccessory(id: string): React.ReactElement | null {
  switch (id) {
    case 'flower':
      return (
        <g>
          <circle cx="124" cy="64" r="6" fill="#E55B9B" />
          <circle cx="120" cy="60" r="4" fill="#FFE082" />
          <circle cx="128" cy="60" r="4" fill="#FFE082" />
          <circle cx="124" cy="56" r="4" fill="#FFE082" />
          <circle cx="124" cy="64" r="3" fill="#A4351F" />
        </g>
      )
    case 'hat':
      return (
        <g fill="#5C3A21">
          <ellipse cx="100" cy="56" rx="44" ry="8" />
          <path d="M 76 56 Q 76 26 100 26 Q 124 26 124 56 Z" />
          <rect x="76" y="52" width="48" height="4" fill="#3A2616" />
        </g>
      )
    case 'hood':
      return (
        <path
          d="M 50 100 Q 50 38 100 38 Q 150 38 150 100 L 150 80 Q 145 60 100 58 Q 55 60 50 80 Z"
          fill="#3A2616"
        />
      )
    case 'wand':
      return (
        <g>
          <rect x="150" y="100" width="4" height="50" fill="#5C3A21" transform="rotate(15 152 125)" />
          <circle cx="160" cy="100" r="6" fill="#FFE082" />
          <circle cx="160" cy="100" r="3" fill="#FFD179" />
        </g>
      )
    case 'crown':
      return (
        <g fill="#FFD179" stroke="#B68A3E" strokeWidth="1">
          <path d="M 70 60 L 76 42 L 86 54 L 100 38 L 114 54 L 124 42 L 130 60 Z" />
          <circle cx="76" cy="44" r="3" fill="#A4351F" />
          <circle cx="100" cy="40" r="3" fill="#A4351F" />
          <circle cx="124" cy="44" r="3" fill="#A4351F" />
        </g>
      )
    case 'horns':
      return (
        <g fill="#3A2616">
          <path d="M 72 58 Q 64 36 70 28 Q 76 36 80 58 Z" />
          <path d="M 128 58 Q 136 36 130 28 Q 124 36 120 58 Z" />
        </g>
      )
    default:
      return null
  }
}
