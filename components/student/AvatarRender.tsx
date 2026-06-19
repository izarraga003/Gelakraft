/**
 * Renderiza un avatar SVG por capas, leyendo la AvatarConfig.
 * Capas (z-order ascendente): fondo → cuerpo/cuello → cara (piel) → ojos/boca → pelo → outfit → accesorio → mascota.
 *
 * Las mascotas se dibujan en la esquina inferior derecha del avatar.
 */
import type { AvatarConfig } from '@/lib/students/avatar'

type Props = {
  config: AvatarConfig
  size?: number
}

// ============================================================
// PALETA DE COLORES
// ============================================================
const BG_COLORS: Record<string, [string, string]> = {
  urrea:      ['#F4DDA2', '#B88A3C'],
  sutea:      ['#FFB37A', '#C24617'],
  iluntze:    ['#3D5263', '#1B2730'],
  pago:       ['#C9E6A0', '#5C8A2C'],
  lamia:      ['#A8DFE6', '#3A8E96'],
  sorgina:    ['#D3B5F0', '#7847B5'],
  ekaitza:    ['#7A8FA8', '#3D4F65'],
  argia:      ['#FFF5C2', '#E8C84B'],
  galaxia:    ['#5F4A8E', '#1A0F33'],
  arrosaila:  ['#FFC9D6', '#D85988'],
  jadea:      ['#A8E6CE', '#3A8E72'],
}
const SKIN: Record<string, string> = {
  light:  '#F1D2B8',
  medium: '#D6A37A',
  tan:    '#B97D52',
  dark:   '#7A4A28',
  olive:  '#C0A275',
  green:  '#A8C58C',
  blue:   '#8EB4D0',
}
const HAIR: Record<string, string> = {
  black:  '#1F1A18',
  brown:  '#5C3A1F',
  blonde: '#D9B068',
  red:    '#B7421E',
  grey:   '#9A9590',
  pink:   '#E58FB5',
  blue:   '#3A77BB',
  green:  '#5BAE6F',
  silver: '#C0C8D0',
  purple: '#7E4FA8',
  magic:  'url(#hair-magic-grad)',
  fire:   'url(#hair-fire-grad)',
}

export default function AvatarRender({ config, size = 100 }: Props) {
  const [bgFrom, bgTo] = BG_COLORS[config.bgColor] ?? BG_COLORS.urrea
  const skin = SKIN[config.skinTone] ?? SKIN.medium
  const hair = HAIR[config.hairColor] ?? HAIR.brown

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="Avatar"
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id={`bg-grad-${config.bgColor}`} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor={bgFrom} />
          <stop offset="100%" stopColor={bgTo} />
        </radialGradient>
        <linearGradient id="hair-magic-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#7E4FA8" />
          <stop offset="50%" stopColor="#3A77BB" />
          <stop offset="100%" stopColor="#5BAE6F" />
        </linearGradient>
        <linearGradient id="hair-fire-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFD53D" />
          <stop offset="50%" stopColor="#FF8B3A" />
          <stop offset="100%" stopColor="#C24617" />
        </linearGradient>
        {/* Brillo general superior (highlight de cristal) */}
        <linearGradient id="avatar-shine" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        {/* Viñeta inferior para profundidad */}
        <radialGradient id="avatar-vignette" cx="50%" cy="90%" r="80%">
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
        </radialGradient>
        {/* Highlight de mejilla derecha (luz lateral) */}
        <radialGradient id="cheek-highlight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* FONDO */}
      <rect width="100" height="100" fill={`url(#bg-grad-${config.bgColor})`} />

      {/* Pequeños puntos decorativos en el fondo (sparkles) */}
      <circle cx="14" cy="18" r="1.6" fill="rgba(255,255,255,0.55)" />
      <circle cx="86" cy="22" r="1.2" fill="rgba(255,255,255,0.45)" />
      <circle cx="20" cy="80" r="1" fill="rgba(255,255,255,0.4)" />
      <circle cx="82" cy="74" r="1.4" fill="rgba(255,255,255,0.5)" />

      {/* CUELLO con sombra inferior */}
      <rect x="42" y="70" width="16" height="14" fill={skin} />
      <rect x="42" y="78" width="16" height="6" fill="rgba(0,0,0,0.18)" />

      {/* HOMBROS base */}
      <rect x="20" y="82" width="60" height="22" rx="6" fill="#2A2018" />

      {/* CARA */}
      <ellipse cx="50" cy="48" rx="22" ry="26" fill={skin} />
      {/* Sombra suave del lado izquierdo (luz desde la derecha) */}
      <ellipse cx="42" cy="52" rx="9" ry="18" fill="rgba(0,0,0,0.08)" />
      {/* Highlight de cara */}
      <ellipse
        cx="58"
        cy="42"
        rx="10"
        ry="14"
        fill="url(#cheek-highlight)"
      />
      {/* Orejas */}
      <ellipse cx="27" cy="50" rx="4" ry="6" fill={skin} />
      <ellipse cx="73" cy="50" rx="4" ry="6" fill={skin} />
      {/* Sombras dentro de orejas */}
      <ellipse cx="27.5" cy="51" rx="2" ry="3.5" fill="rgba(0,0,0,0.18)" />
      <ellipse cx="72.5" cy="51" rx="2" ry="3.5" fill="rgba(0,0,0,0.18)" />

      {/* MEJILLAS (siempre presentes para dar vida) */}
      <ellipse
        cx="36"
        cy="56"
        rx="4.5"
        ry="3"
        fill="#E8908F"
        opacity="0.45"
      />
      <ellipse
        cx="64"
        cy="56"
        rx="4.5"
        ry="3"
        fill="#E8908F"
        opacity="0.45"
      />

      {/* OJOS */}
      <Eyes type={config.eyes} />

      {/* BOCA */}
      <Mouth type={config.mouth} />

      {/* PELO */}
      <Hair style={config.hairStyle} color={hair} />

      {/* OUTFIT */}
      <Outfit type={config.outfit} />

      {/* ACCESORIO */}
      {config.accessory && <Accessory type={config.accessory} />}

      {/* Capa de brillo superior (solo afecta arriba) */}
      <rect width="100" height="50" fill="url(#avatar-shine)" pointerEvents="none" />

      {/* Viñeta inferior (solo bordes) */}
      <rect width="100" height="100" fill="url(#avatar-vignette)" pointerEvents="none" />

      {/* MASCOTA (encima de todo, brillante y bien visible) */}
      {config.pet && <Pet type={config.pet} />}

      {/* Marco dorado */}
      <rect
        x="1"
        y="1"
        width="98"
        height="98"
        fill="none"
        stroke="rgba(184, 138, 60, 0.85)"
        strokeWidth="2"
      />
      <rect
        x="3"
        y="3"
        width="94"
        height="94"
        fill="none"
        stroke="rgba(255, 240, 200, 0.35)"
        strokeWidth="1"
      />
    </svg>
  )
}

// ============================================================
// OJOS
// ============================================================
function Eyes({ type }: { type: string }) {
  switch (type) {
    case 'wide':
      return (
        <>
          <circle cx="41" cy="46" r="4" fill="#FFF" />
          <circle cx="59" cy="46" r="4" fill="#FFF" />
          <circle cx="41" cy="46" r="2.2" fill="#1F1A18" />
          <circle cx="59" cy="46" r="2.2" fill="#1F1A18" />
          {/* Highlights brillantes */}
          <circle cx="42.2" cy="44.6" r="0.9" fill="#FFF" />
          <circle cx="60.2" cy="44.6" r="0.9" fill="#FFF" />
        </>
      )
    case 'cheerful':
      return (
        <>
          <path d="M 37 47 Q 41 43 45 47" stroke="#1F1A18" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 55 47 Q 59 43 63 47" stroke="#1F1A18" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )
    case 'wink':
      return (
        <>
          <circle cx="41" cy="46" r="2.5" fill="#1F1A18" />
          <circle cx="41.8" cy="45" r="0.7" fill="#FFF" />
          <path d="M 55 47 Q 59 44 63 47" stroke="#1F1A18" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )
    case 'serious':
      return (
        <>
          <rect x="38" y="45" width="6" height="2" fill="#1F1A18" />
          <rect x="56" y="45" width="6" height="2" fill="#1F1A18" />
        </>
      )
    case 'star':
      return (
        <>
          <text x="41" y="50" textAnchor="middle" fontSize="10" fill="#FFD53D">★</text>
          <text x="59" y="50" textAnchor="middle" fontSize="10" fill="#FFD53D">★</text>
        </>
      )
    case 'heart':
      return (
        <>
          <text x="41" y="50" textAnchor="middle" fontSize="10" fill="#D85988">♥</text>
          <text x="59" y="50" textAnchor="middle" fontSize="10" fill="#D85988">♥</text>
        </>
      )
    case 'glow':
      return (
        <>
          <circle cx="41" cy="46" r="3.5" fill="#A8DFE6" opacity="0.9" />
          <circle cx="59" cy="46" r="3.5" fill="#A8DFE6" opacity="0.9" />
          <circle cx="41" cy="46" r="1.6" fill="#FFF" />
          <circle cx="59" cy="46" r="1.6" fill="#FFF" />
        </>
      )
    case 'fire':
      return (
        <>
          <circle cx="41" cy="46" r="3" fill="#FF8B3A" />
          <circle cx="59" cy="46" r="3" fill="#FF8B3A" />
          <circle cx="41" cy="46" r="1.4" fill="#FFD53D" />
          <circle cx="59" cy="46" r="1.4" fill="#FFD53D" />
        </>
      )
    default:
      return (
        <>
          <circle cx="41" cy="46" r="2.5" fill="#1F1A18" />
          <circle cx="59" cy="46" r="2.5" fill="#1F1A18" />
          <circle cx="41.7" cy="45.2" r="0.7" fill="#FFF" />
          <circle cx="59.7" cy="45.2" r="0.7" fill="#FFF" />
        </>
      )
  }
}

// ============================================================
// BOCA
// ============================================================
function Mouth({ type }: { type: string }) {
  switch (type) {
    case 'neutral':
      return <rect x="44" y="60" width="12" height="1.6" fill="#7A3520" />
    case 'open':
      return <ellipse cx="50" cy="61" rx="4" ry="3" fill="#7A3520" />
    case 'smirk':
      return <path d="M 44 60 Q 52 64 56 58" stroke="#7A3520" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    case 'tongue':
      return (
        <>
          <path d="M 44 59 Q 50 64 56 59" stroke="#7A3520" strokeWidth="1.8" fill="none" />
          <ellipse cx="50" cy="63" rx="3" ry="2" fill="#E07A8E" />
        </>
      )
    case 'fangs':
      return (
        <>
          <path d="M 43 60 Q 50 65 57 60" stroke="#7A3520" strokeWidth="1.6" fill="#3A1810" />
          <polygon points="46,60 47,64 48,60" fill="#FFF" />
          <polygon points="52,60 53,64 54,60" fill="#FFF" />
        </>
      )
    case 'mustache':
      return (
        <>
          <path d="M 40 58 Q 45 55 50 58 Q 55 55 60 58" stroke="#1F1A18" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 44 62 Q 50 65 56 62" stroke="#7A3520" strokeWidth="1.6" fill="none" />
        </>
      )
    default: // smile
      return <path d="M 43 59 Q 50 65 57 59" stroke="#7A3520" strokeWidth="1.8" fill="none" strokeLinecap="round" />
  }
}

// ============================================================
// PELO
// ============================================================
function Hair({ style, color }: { style: string; color: string }) {
  switch (style) {
    case 'bald':
      return null
    case 'short':
      return <path d="M 28 38 Q 28 22 50 22 Q 72 22 72 38 L 72 44 Q 72 32 50 30 Q 28 32 28 44 Z" fill={color} />
    case 'wavy':
      return (
        <path
          d="M 26 40 Q 26 18 50 18 Q 74 18 74 40 Q 70 36 64 38 Q 60 32 54 36 Q 50 30 46 36 Q 40 32 36 38 Q 30 36 26 40 Z"
          fill={color}
        />
      )
    case 'long':
      return (
        <>
          <path d="M 26 38 Q 26 18 50 18 Q 74 18 74 38 L 74 78 L 68 78 L 68 44 Q 60 30 50 30 Q 40 30 32 44 L 32 78 L 26 78 Z" fill={color} />
        </>
      )
    case 'bun':
      return (
        <>
          <circle cx="50" cy="16" r="9" fill={color} />
          <path d="M 28 38 Q 28 22 50 22 Q 72 22 72 38 L 72 44 Q 72 32 50 30 Q 28 32 28 44 Z" fill={color} />
        </>
      )
    case 'curly':
      return (
        <>
          <circle cx="34" cy="28" r="8" fill={color} />
          <circle cx="44" cy="22" r="8" fill={color} />
          <circle cx="56" cy="22" r="8" fill={color} />
          <circle cx="66" cy="28" r="8" fill={color} />
          <circle cx="30" cy="38" r="7" fill={color} />
          <circle cx="70" cy="38" r="7" fill={color} />
        </>
      )
    case 'mohawk':
      return (
        <>
          <path d="M 32 40 Q 32 30 38 30 L 62 30 Q 68 30 68 40 L 64 40 L 64 32 L 36 32 L 36 40 Z" fill={color} opacity="0.85" />
          <path d="M 42 30 L 50 6 L 58 30 Z" fill={color} />
          <path d="M 45 30 L 50 12 L 55 30 Z" fill={color} opacity="0.7" />
        </>
      )
    case 'twintails':
      return (
        <>
          <path d="M 28 38 Q 28 22 50 22 Q 72 22 72 38 L 72 44 Q 72 32 50 30 Q 28 32 28 44 Z" fill={color} />
          <ellipse cx="20" cy="58" rx="6" ry="14" fill={color} />
          <ellipse cx="80" cy="58" rx="6" ry="14" fill={color} />
        </>
      )
    case 'afro':
      return (
        <>
          <circle cx="50" cy="28" r="22" fill={color} />
          <circle cx="32" cy="36" r="9" fill={color} />
          <circle cx="68" cy="36" r="9" fill={color} />
          <circle cx="40" cy="18" r="9" fill={color} />
          <circle cx="60" cy="18" r="9" fill={color} />
        </>
      )
    case 'spiky':
      return (
        <>
          <path d="M 28 38 L 32 16 L 38 32 L 44 12 L 50 30 L 56 12 L 62 32 L 68 16 L 72 38 Q 72 32 50 30 Q 28 32 28 38 Z" fill={color} />
        </>
      )
    case 'topknot':
      return (
        <>
          <path d="M 30 40 L 30 22 L 70 22 L 70 40 Z" fill={color} opacity="0.4" />
          <path d="M 30 40 Q 30 28 50 28 Q 70 28 70 40 L 70 44 Q 70 34 50 32 Q 30 34 30 44 Z" fill={color} />
          <ellipse cx="50" cy="14" rx="6" ry="9" fill={color} />
          <rect x="48" y="18" width="4" height="2" fill="#1F1A18" />
        </>
      )
    case 'dreads':
      return (
        <>
          <path d="M 28 38 Q 28 20 50 20 Q 72 20 72 38 Z" fill={color} />
          <rect x="26" y="36" width="3" height="40" rx="1.5" fill={color} />
          <rect x="32" y="38" width="3" height="42" rx="1.5" fill={color} />
          <rect x="38" y="40" width="3" height="38" rx="1.5" fill={color} />
          <rect x="59" y="40" width="3" height="38" rx="1.5" fill={color} />
          <rect x="65" y="38" width="3" height="42" rx="1.5" fill={color} />
          <rect x="71" y="36" width="3" height="40" rx="1.5" fill={color} />
        </>
      )
    case 'braids':
      return (
        <>
          <path d="M 28 38 Q 28 22 50 22 Q 72 22 72 38 Z" fill={color} />
          <path d="M 24 42 Q 22 60 24 78 L 30 78 Q 28 60 30 42 Z" fill={color} />
          <path d="M 76 42 Q 78 60 76 78 L 70 78 Q 72 60 70 42 Z" fill={color} />
          <line x1="27" y1="50" x2="27" y2="76" stroke="#1F1A18" strokeWidth="0.5" opacity="0.4" />
          <line x1="73" y1="50" x2="73" y2="76" stroke="#1F1A18" strokeWidth="0.5" opacity="0.4" />
        </>
      )
    case 'double_bun':
      return (
        <>
          <circle cx="34" cy="18" r="8" fill={color} />
          <circle cx="66" cy="18" r="8" fill={color} />
          <path d="M 28 38 Q 28 26 50 26 Q 72 26 72 38 L 72 44 Q 72 32 50 30 Q 28 32 28 44 Z" fill={color} />
        </>
      )
    case 'fire_mohawk':
      return (
        <>
          <path d="M 32 40 Q 32 30 38 30 L 62 30 Q 68 30 68 40 Z" fill="#1F1A18" />
          <path d="M 42 30 L 46 8 L 50 24 L 54 6 L 58 30 Z" fill="url(#hair-fire-grad)" />
          <path d="M 45 28 L 48 14 L 52 22 L 55 28 Z" fill="#FFD53D" opacity="0.85" />
        </>
      )
    case 'flame':
      return (
        <>
          <path
            d="M 30 40 Q 28 30 32 22 Q 34 30 38 24 Q 40 32 44 22 Q 46 32 50 20 Q 54 32 56 22 Q 60 32 62 24 Q 66 30 68 22 Q 72 30 70 40 Q 70 32 50 30 Q 30 32 30 40 Z"
            fill="url(#hair-fire-grad)"
          />
        </>
      )
    default:
      return <path d="M 28 38 Q 28 22 50 22 Q 72 22 72 38 L 72 44 Q 72 32 50 30 Q 28 32 28 44 Z" fill={color} />
  }
}

// ============================================================
// OUTFIT
// ============================================================
function Outfit({ type }: { type: string }) {
  switch (type) {
    case 'tunic':
      return <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#8E5A2C" />
    case 'vest':
      return (
        <>
          <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#3D5263" />
          <rect x="46" y="82" width="8" height="22" fill="#FFFFFF" opacity="0.95" />
          <circle cx="50" cy="92" r="1.4" fill="#1F1A18" />
        </>
      )
    case 'robe':
      return <path d="M 18 82 L 82 82 Q 86 104 50 104 Q 14 104 18 82 Z" fill="#7847B5" />
    case 'hoodie':
      return (
        <>
          <path d="M 20 80 Q 50 70 80 80 L 82 104 L 18 104 Z" fill="#3D4F65" />
          <path d="M 38 82 L 38 92 L 62 92 L 62 82 Q 50 78 38 82 Z" fill="#1B2730" />
          <rect x="48" y="92" width="4" height="6" fill="#1B2730" />
        </>
      )
    case 'sorgina':
      return (
        <>
          <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#3A1F5A" />
          <path d="M 34 82 L 50 96 L 66 82 L 64 88 L 50 100 L 36 88 Z" fill="#D9B068" />
          <circle cx="50" cy="92" r="2" fill="#7E4FA8" />
        </>
      )
    case 'jentila':
      return (
        <>
          <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#5C3A1F" />
          <rect x="34" y="86" width="32" height="14" fill="#7A5A2E" />
          <line x1="36" y1="88" x2="64" y2="88" stroke="#3A2010" strokeWidth="1" />
          <line x1="36" y1="98" x2="64" y2="98" stroke="#3A2010" strokeWidth="1" />
        </>
      )
    case 'lamia':
      return (
        <>
          <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#3A8E96" />
          <path d="M 30 86 Q 50 80 70 86 L 70 92 Q 50 86 30 92 Z" fill="#A8DFE6" />
          <circle cx="50" cy="98" r="3" fill="#A8DFE6" />
        </>
      )
    case 'lightning':
      return (
        <>
          <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#FFD53D" />
          <path d="M 48 84 L 42 94 L 50 94 L 44 102 L 56 92 L 50 92 L 56 84 Z" fill="#1F1A18" />
        </>
      )
    case 'kimono':
      return (
        <>
          <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#B7421E" />
          <path d="M 50 82 L 36 104 L 36 92 Z" fill="#1F1A18" opacity="0.6" />
          <path d="M 50 82 L 64 104 L 64 92 Z" fill="#1F1A18" opacity="0.6" />
          <rect x="48" y="82" width="4" height="22" fill="#1F1A18" />
        </>
      )
    case 'armor':
      return (
        <>
          <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#9A9590" />
          <rect x="34" y="84" width="32" height="20" fill="#7A7A7A" />
          <circle cx="42" cy="92" r="2" fill="#C0C8D0" />
          <circle cx="58" cy="92" r="2" fill="#C0C8D0" />
          <rect x="48" y="84" width="4" height="20" fill="#3D4F65" />
        </>
      )
    case 'gold_armor':
      return (
        <>
          <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#E8C84B" />
          <path d="M 34 86 Q 50 80 66 86 L 66 102 Q 50 96 34 102 Z" fill="#B88A3C" />
          <circle cx="50" cy="92" r="3" fill="#F4DDA2" />
          <circle cx="50" cy="92" r="1.4" fill="#7A4A28" />
        </>
      )
    case 'cape':
      return (
        <>
          <path d="M 12 82 Q 50 96 88 82 L 86 104 L 14 104 Z" fill="#B7421E" />
          <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#3D5263" />
          <circle cx="50" cy="88" r="2.5" fill="#FFD53D" />
        </>
      )
    case 'wizard':
      return (
        <>
          <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#5F4A8E" />
          <circle cx="40" cy="92" r="1.5" fill="#FFD53D" />
          <circle cx="60" cy="92" r="1.5" fill="#FFD53D" />
          <circle cx="50" cy="98" r="1.5" fill="#FFD53D" />
          <path d="M 38 88 L 42 84 M 58 88 L 62 84" stroke="#FFD53D" strokeWidth="1" />
        </>
      )
    default:
      return <path d="M 22 82 L 78 82 L 82 104 L 18 104 Z" fill="#8E5A2C" />
  }
}

// ============================================================
// ACCESORIO
// ============================================================
function Accessory({ type }: { type: string }) {
  switch (type) {
    case 'flower':
      return (
        <g transform="translate(70, 26)">
          <circle cx="0" cy="0" r="2.5" fill="#FFD53D" />
          <circle cx="-3.5" cy="0" r="2.5" fill="#FF8B3A" />
          <circle cx="3.5" cy="0" r="2.5" fill="#FF8B3A" />
          <circle cx="0" cy="-3.5" r="2.5" fill="#FF8B3A" />
          <circle cx="0" cy="3.5" r="2.5" fill="#FF8B3A" />
        </g>
      )
    case 'glasses':
      return (
        <>
          <circle cx="41" cy="46" r="5.5" fill="none" stroke="#1F1A18" strokeWidth="1.8" />
          <circle cx="59" cy="46" r="5.5" fill="none" stroke="#1F1A18" strokeWidth="1.8" />
          <line x1="46.5" y1="46" x2="53.5" y2="46" stroke="#1F1A18" strokeWidth="1.8" />
        </>
      )
    case 'sunglasses':
      return (
        <>
          <rect x="34" y="42" width="14" height="8" rx="2" fill="#1F1A18" />
          <rect x="52" y="42" width="14" height="8" rx="2" fill="#1F1A18" />
          <rect x="47" y="45" width="6" height="2" fill="#1F1A18" />
        </>
      )
    case 'hat':
      return (
        <>
          <rect x="26" y="22" width="48" height="3" fill="#1F1A18" />
          <rect x="34" y="10" width="32" height="14" fill="#1F1A18" />
          <rect x="34" y="20" width="32" height="2" fill="#B88A3C" />
        </>
      )
    case 'hood':
      return (
        <path d="M 22 36 Q 22 14 50 14 Q 78 14 78 36 L 76 40 Q 72 28 50 28 Q 28 28 24 40 Z" fill="#3D5263" />
      )
    case 'headphones':
      return (
        <>
          <path d="M 26 38 Q 50 18 74 38" stroke="#1F1A18" strokeWidth="2.5" fill="none" />
          <rect x="22" y="38" width="8" height="14" rx="2" fill="#1F1A18" />
          <rect x="70" y="38" width="8" height="14" rx="2" fill="#1F1A18" />
        </>
      )
    case 'bandana':
      return (
        <>
          <path d="M 26 30 L 74 30 L 78 38 L 22 38 Z" fill="#B7421E" />
          <circle cx="34" cy="34" r="1.5" fill="#FFF" />
          <circle cx="50" cy="34" r="1.5" fill="#FFF" />
          <circle cx="66" cy="34" r="1.5" fill="#FFF" />
        </>
      )
    case 'wand':
      return (
        <g transform="translate(82, 60) rotate(-20)">
          <rect x="-1" y="-18" width="2" height="22" fill="#5C3A1F" />
          <polygon points="0,-22 -3,-16 0,-18 3,-16" fill="#FFD53D" />
        </g>
      )
    case 'crown':
      return (
        <g>
          <path d="M 32 26 L 36 14 L 42 22 L 50 10 L 58 22 L 64 14 L 68 26 Z" fill="#FFD53D" stroke="#B88A3C" strokeWidth="1" />
          <circle cx="50" cy="18" r="1.6" fill="#D85988" />
          <circle cx="42" cy="22" r="1.2" fill="#3A77BB" />
          <circle cx="58" cy="22" r="1.2" fill="#3A77BB" />
        </g>
      )
    case 'horns':
      return (
        <>
          <path d="M 32 28 Q 26 16 32 12 Q 36 18 36 26" fill="#7A4A28" />
          <path d="M 68 28 Q 74 16 68 12 Q 64 18 64 26" fill="#7A4A28" />
        </>
      )
    case 'halo':
      return (
        <>
          <ellipse cx="50" cy="10" rx="20" ry="4" fill="none" stroke="#FFD53D" strokeWidth="2" />
          <ellipse cx="50" cy="10" rx="20" ry="4" fill="none" stroke="#FFF" strokeWidth="0.8" opacity="0.8" />
        </>
      )
    default:
      return null
  }
}

// ============================================================
// MASCOTAS (esquina inferior derecha, tamaño grande)
// ============================================================
function Pet({ type }: { type: string }) {
  // Cada mascota dibujada sobre caja interna ~24×22. Con scale 1.55 ocupa
  // ~37×34 px en el viewBox de 100×100 — claramente visible incluso a
  // tamaños pequeños del avatar.
  return (
    <g transform="translate(58, 62) scale(1.55)">
      {/* Halo suave para destacar a la mascota sobre el outfit */}
      <ellipse
        cx="13"
        cy="14"
        rx="14"
        ry="11"
        fill="rgba(255, 255, 255, 0.4)"
      />
      <PetShape type={type} />
    </g>
  )
}

function PetShape({ type }: { type: string }) {
  switch (type) {
    case 'tximeleta': // Mariposa
      return (
        <g>
          <ellipse cx="6" cy="10" rx="6" ry="8" fill="#D85988" />
          <ellipse cx="18" cy="10" rx="6" ry="8" fill="#7E4FA8" />
          <ellipse cx="6" cy="10" rx="2.5" ry="3" fill="#FFD53D" opacity="0.7" />
          <ellipse cx="18" cy="10" rx="2.5" ry="3" fill="#FFD53D" opacity="0.7" />
          <rect x="11.4" y="3" width="1.2" height="14" fill="#1F1A18" />
          <circle cx="12" cy="3" r="1.4" fill="#1F1A18" />
        </g>
      )
    case 'triku': // Erizo
      return (
        <g>
          <ellipse cx="12" cy="14" rx="11" ry="7" fill="#5C3A1F" />
          {/* púas */}
          <polygon points="3,12 5,6 7,12" fill="#1F1A18" />
          <polygon points="8,10 10,4 12,10" fill="#1F1A18" />
          <polygon points="13,10 15,4 17,10" fill="#1F1A18" />
          <polygon points="17,12 19,6 21,12" fill="#1F1A18" />
          {/* carita */}
          <ellipse cx="2" cy="14" rx="3" ry="2.5" fill="#F1D2B8" />
          <circle cx="1.4" cy="13" r="0.6" fill="#1F1A18" />
          <circle cx="0.4" cy="14.4" r="0.5" fill="#1F1A18" />
        </g>
      )
    case 'azeria': // Zorro
      return (
        <g>
          <ellipse cx="12" cy="14" rx="9" ry="6" fill="#C24617" />
          {/* cabeza */}
          <polygon points="3,8 8,4 10,12" fill="#C24617" />
          {/* orejas */}
          <polygon points="3,8 4,2 7,5" fill="#C24617" />
          <polygon points="9,4 11,1 12,5" fill="#C24617" />
          {/* hocico */}
          <ellipse cx="3" cy="11" rx="2" ry="1.6" fill="#FFF" />
          <circle cx="1.6" cy="10.6" r="0.5" fill="#1F1A18" />
          {/* cola */}
          <ellipse cx="22" cy="11" rx="4" ry="2.5" fill="#C24617" />
          <ellipse cx="24" cy="10" rx="2" ry="1.4" fill="#FFF" />
        </g>
      )
    case 'hontza': // Búho
      return (
        <g>
          <ellipse cx="12" cy="13" rx="8" ry="9" fill="#7A5A2E" />
          <polygon points="6,5 8,9 4,9" fill="#7A5A2E" />
          <polygon points="18,5 20,9 16,9" fill="#7A5A2E" />
          <circle cx="9" cy="11" r="2.5" fill="#FFD53D" />
          <circle cx="15" cy="11" r="2.5" fill="#FFD53D" />
          <circle cx="9" cy="11" r="1.2" fill="#1F1A18" />
          <circle cx="15" cy="11" r="1.2" fill="#1F1A18" />
          <polygon points="11,14 13,14 12,16" fill="#B88A3C" />
        </g>
      )
    case 'ahuntza': // Cabra
      return (
        <g>
          <ellipse cx="12" cy="14" rx="9" ry="6" fill="#F1D2B8" />
          <ellipse cx="4" cy="11" rx="4" ry="3.5" fill="#F1D2B8" />
          {/* cuernos */}
          <path d="M 2 8 Q 1 4 4 4" stroke="#7A4A28" strokeWidth="1.4" fill="none" />
          <path d="M 6 8 Q 7 4 4 4" stroke="#7A4A28" strokeWidth="1.4" fill="none" />
          <circle cx="2.6" cy="11" r="0.5" fill="#1F1A18" />
          {/* barba */}
          <path d="M 3 13 L 2 16 L 4 14 Z" fill="#FFF" />
        </g>
      )
    case 'otsoa': // Lobo
      return (
        <g>
          <ellipse cx="12" cy="14" rx="9" ry="6" fill="#5C5550" />
          <ellipse cx="4" cy="11" rx="4" ry="3.5" fill="#5C5550" />
          <polygon points="2,9 3,5 5,8" fill="#5C5550" />
          <polygon points="6,9 7,5 4,8" fill="#5C5550" />
          {/* hocico */}
          <ellipse cx="2" cy="12" rx="1.6" ry="1.4" fill="#7A7A7A" />
          <circle cx="1.4" cy="11.6" r="0.5" fill="#1F1A18" />
          <circle cx="3" cy="10.5" r="0.5" fill="#FFD53D" />
          {/* cola */}
          <path d="M 20 12 Q 24 10 22 16 Q 19 14 18 14 Z" fill="#5C5550" />
        </g>
      )
    case 'arranoa': // Águila
      return (
        <g>
          <ellipse cx="12" cy="13" rx="6" ry="7" fill="#5C3A1F" />
          <circle cx="12" cy="7" r="3.5" fill="#FFF" />
          <circle cx="13" cy="7" r="0.8" fill="#1F1A18" />
          <polygon points="14,8 16,9 14,10" fill="#FFD53D" />
          {/* alas */}
          <path d="M 6 12 Q 2 8 1 14 Q 6 16 6 12 Z" fill="#5C3A1F" />
          <path d="M 18 12 Q 22 8 23 14 Q 18 16 18 12 Z" fill="#5C3A1F" />
        </g>
      )
    case 'pottoka': // Caballo pottoka
      return (
        <g>
          <ellipse cx="12" cy="14" rx="9" ry="5" fill="#5C3A1F" />
          {/* cabeza */}
          <ellipse cx="3" cy="11" rx="3.5" ry="4" fill="#5C3A1F" />
          {/* orejas */}
          <polygon points="1,8 2,4 4,7" fill="#5C3A1F" />
          <polygon points="5,8 5,4 6,7" fill="#5C3A1F" />
          {/* crin */}
          <path d="M 6 9 Q 10 7 14 8 L 13 12 Q 9 11 6 12 Z" fill="#1F1A18" />
          <circle cx="2.4" cy="11" r="0.5" fill="#1F1A18" />
          {/* patas */}
          <rect x="7" y="17" width="1.5" height="3" fill="#5C3A1F" />
          <rect x="15" y="17" width="1.5" height="3" fill="#5C3A1F" />
          {/* cola */}
          <path d="M 20 13 L 23 18 L 21 13 Z" fill="#1F1A18" />
        </g>
      )
    case 'hartza': // Oso
      return (
        <g>
          <ellipse cx="12" cy="14" rx="10" ry="7" fill="#5C3A1F" />
          <circle cx="5" cy="11" r="4.5" fill="#5C3A1F" />
          {/* orejas */}
          <circle cx="2.5" cy="7.5" r="1.6" fill="#5C3A1F" />
          <circle cx="7.5" cy="7" r="1.6" fill="#5C3A1F" />
          {/* hocico */}
          <ellipse cx="3" cy="12" rx="1.8" ry="1.4" fill="#D6A37A" />
          <circle cx="2.4" cy="11.4" r="0.6" fill="#1F1A18" />
          <circle cx="4.4" cy="10" r="0.5" fill="#FFD53D" />
          {/* garras */}
          <rect x="14" y="18" width="3" height="2" fill="#5C3A1F" />
          <rect x="18" y="18" width="3" height="2" fill="#5C3A1F" />
        </g>
      )
    default:
      return null
  }
}
