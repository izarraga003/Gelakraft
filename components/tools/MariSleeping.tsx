/**
 * Ilustración de Mari para la pantalla de Isiltasun-erronka.
 * Dos estados:
 *  - 'sleeping' → ojos cerrados, posición tranquila, Zzz flotando, tonos fríos
 *  - 'awake'    → ojos rojos brillantes, expresión amenazante, partículas de fuego
 */

type MariArtProps = {
  state: 'sleeping' | 'awake'
}

export default function MariSleeping({ state }: MariArtProps) {
  const isAwake = state === 'awake'

  return (
    <div className={`mari-art mari-${state}`} aria-hidden="true">
      <svg
        viewBox="0 0 600 600"
        xmlns="http://www.w3.org/2000/svg"
        className="mari-svg"
      >
        <defs>
          <radialGradient id="mari-moon" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#EFE5D0" />
            <stop offset="80%" stopColor="#D4A85C" />
            <stop offset="100%" stopColor="#B68A3E" />
          </radialGradient>

          {/* Aura tranquila */}
          <radialGradient id="mari-aura-calm" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="rgba(180, 180, 200, 0.3)" />
            <stop offset="100%" stopColor="rgba(180, 180, 200, 0)" />
          </radialGradient>

          {/* Aura furiosa */}
          <radialGradient id="mari-aura-rage" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 100, 50, 0.5)" />
            <stop offset="60%" stopColor="rgba(194, 70, 23, 0.25)" />
            <stop offset="100%" stopColor="rgba(122, 31, 10, 0)" />
          </radialGradient>

          {/* Vestido (cabello) — dormida (frío) */}
          <linearGradient id="mari-robe-calm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2C4759" />
            <stop offset="100%" stopColor="#1B2730" />
          </linearGradient>

          {/* Vestido — despierta (rojo) */}
          <linearGradient id="mari-robe-rage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C24617" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </linearGradient>

          {/* Piel */}
          <linearGradient id="mari-skin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E5D9BC" />
            <stop offset="100%" stopColor="#B68A3E" />
          </linearGradient>
        </defs>

        {/* Aura de fondo */}
        <ellipse
          cx="300"
          cy="320"
          rx="270"
          ry="240"
          fill={isAwake ? 'url(#mari-aura-rage)' : 'url(#mari-aura-calm)'}
        />

        {/* Luna creciente */}
        <g className="mari-moon">
          <circle cx="465" cy="120" r="55" fill="url(#mari-moon)" opacity="0.85" />
          <circle cx="485" cy="110" r="50" fill="#1B2730" />
        </g>

        {/* Estrellas */}
        <g opacity="0.7">
          <circle cx="110" cy="95" r="1.4" fill="#D4A85C" />
          <circle cx="180" cy="140" r="1" fill="#D4A85C" />
          <circle cx="540" cy="220" r="1.2" fill="#D4A85C" />
          <circle cx="80" cy="200" r="0.8" fill="#D4A85C" />
          <circle cx="220" cy="60" r="1" fill="#D4A85C" />
        </g>

        {/* Vestido / cuerpo */}
        <path
          d="M 200 540
             Q 180 420 220 340
             Q 240 280 300 270
             Q 360 280 380 340
             Q 420 420 400 540 Z"
          fill={isAwake ? 'url(#mari-robe-rage)' : 'url(#mari-robe-calm)'}
        />

        {/* Cabello largo lateral */}
        <path
          d="M 230 250 Q 200 350 220 480 Q 235 350 250 290 Z"
          fill={isAwake ? '#7A1F0A' : '#1B2730'}
          opacity="0.85"
        />
        <path
          d="M 370 250 Q 400 350 380 480 Q 365 350 350 290 Z"
          fill={isAwake ? '#7A1F0A' : '#1B2730'}
          opacity="0.85"
        />

        {/* Cuello */}
        <rect x="285" y="225" width="30" height="40" fill="url(#mari-skin)" />

        {/* Cara — óvalo */}
        <ellipse cx="300" cy="200" rx="56" ry="68" fill="url(#mari-skin)" />

        {/* Pelo encima */}
        <path
          d="M 240 195
             Q 250 135 300 130
             Q 350 135 360 195
             Q 350 165 300 162
             Q 250 165 240 195 Z"
          fill={isAwake ? '#7A1F0A' : '#1B2730'}
        />

        {/* Diadema/corona */}
        <path
          d="M 268 170 L 280 158 L 300 152 L 320 158 L 332 170"
          stroke="#D4A85C"
          strokeWidth="2.5"
          fill="none"
          opacity="0.85"
        />
        <circle cx="300" cy="152" r="3" fill="#FFD179" />

        {/* OJOS — dormida: líneas; despierta: círculos rojos */}
        {state === 'sleeping' ? (
          <>
            <path
              d="M 275 205 Q 282 211 290 205"
              stroke="#1B2730"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 310 205 Q 318 211 325 205"
              stroke="#1B2730"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Pestañas leves */}
            <path d="M 278 200 L 280 198" stroke="#1B2730" strokeWidth="1" />
            <path d="M 285 199 L 286 197" stroke="#1B2730" strokeWidth="1" />
            <path d="M 314 199 L 315 197" stroke="#1B2730" strokeWidth="1" />
            <path d="M 320 200 L 322 198" stroke="#1B2730" strokeWidth="1" />
          </>
        ) : (
          <>
            {/* Ojos enfadados, rojos brillantes */}
            <ellipse cx="282" cy="205" rx="7" ry="5" fill="#FF4438" />
            <ellipse cx="318" cy="205" rx="7" ry="5" fill="#FF4438" />
            <circle cx="282" cy="205" r="3" fill="#7A1F0A" />
            <circle cx="318" cy="205" r="3" fill="#7A1F0A" />
            {/* Brillo */}
            <circle cx="280" cy="203" r="1" fill="#FFE082" />
            <circle cx="316" cy="203" r="1" fill="#FFE082" />
            {/* Cejas enfadadas */}
            <path
              d="M 270 192 L 295 198"
              stroke="#1B2730"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 305 198 L 330 192"
              stroke="#1B2730"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Boca */}
        {state === 'sleeping' ? (
          <path
            d="M 290 235 Q 300 240 310 235"
            stroke="#7A1F0A"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 285 240 Q 300 232 315 240"
            stroke="#7A1F0A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* DORMIDA: Zzz flotantes */}
        {state === 'sleeping' && (
          <g className="mari-zzz">
            <text x="370" y="180" fill="#D4A85C" fontSize="22" fontFamily="serif" opacity="0.6">
              z
            </text>
            <text x="390" y="155" fill="#D4A85C" fontSize="28" fontFamily="serif" opacity="0.75">
              z
            </text>
            <text x="415" y="125" fill="#D4A85C" fontSize="36" fontFamily="serif" opacity="0.9">
              Z
            </text>
          </g>
        )}

        {/* DESPIERTA: brasas/fuego */}
        {state === 'awake' && (
          <g className="mari-embers">
            <circle cx="180" cy="240" r="4" fill="#FFB74D" opacity="0.85" />
            <circle cx="220" cy="180" r="3" fill="#FFD179" opacity="0.9" />
            <circle cx="380" cy="300" r="3.5" fill="#FFB74D" opacity="0.75" />
            <circle cx="440" cy="260" r="3" fill="#FFD179" opacity="0.85" />
            <circle cx="160" cy="320" r="3.5" fill="#FFD179" opacity="0.85" />
            <circle cx="450" cy="380" r="3" fill="#E27A35" opacity="0.7" />
            <circle cx="130" cy="400" r="2.5" fill="#FFB74D" opacity="0.8" />
            <circle cx="470" cy="450" r="3" fill="#FFD179" opacity="0.75" />
          </g>
        )}
      </svg>
    </div>
  )
}
