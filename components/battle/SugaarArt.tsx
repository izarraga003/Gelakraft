/**
 * Ilustración de Sugaar para la pantalla de batalla.
 *
 * Composición:
 *  - Fondo de cueva con luna creciente
 *  - Sugaar: serpiente de fuego enroscada
 *  - Partículas de brasas alrededor
 *
 * Estados (animation prop):
 *  - 'idle'     → respiración suave
 *  - 'hit'      → sacudida horizontal
 *  - 'crit'     → flash dorado + sacudida fuerte
 *  - 'miss'     → la serpiente se desliza (esquiva)
 *  - 'attack'   → flash rojo en bordes, Sugaar se agita
 *  - 'defeated' → opacidad baja, caído
 */

type SugaarArtProps = {
  animation: 'idle' | 'hit' | 'crit' | 'miss' | 'attack' | 'defeated'
}

export default function SugaarArt({ animation }: SugaarArtProps) {
  return (
    <div className={`sugaar-art sugaar-${animation}`} aria-hidden="true">
      <svg
        viewBox="0 0 600 600"
        xmlns="http://www.w3.org/2000/svg"
        className="sugaar-svg"
      >
        <defs>
          {/* Gradiente de fuego del cuerpo */}
          <linearGradient id="sugaar-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB74D" />
            <stop offset="30%" stopColor="#E27A35" />
            <stop offset="65%" stopColor="#C24617" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </linearGradient>

          <radialGradient id="sugaar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 167, 38, 0.55)" />
            <stop offset="60%" stopColor="rgba(226, 122, 53, 0.15)" />
            <stop offset="100%" stopColor="rgba(194, 70, 23, 0)" />
          </radialGradient>

          <radialGradient id="moon-grad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#EFE5D0" />
            <stop offset="80%" stopColor="#D4A85C" />
            <stop offset="100%" stopColor="#B68A3E" />
          </radialGradient>

          <filter id="fire-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>

          <filter id="strong-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Fondo: bruma de la cueva */}
        <ellipse cx="300" cy="300" rx="280" ry="240" fill="url(#sugaar-glow)" />

        {/* Luna creciente atrás */}
        <g className="sugaar-moon">
          <circle cx="465" cy="125" r="55" fill="url(#moon-grad)" opacity="0.85" />
          <circle cx="485" cy="115" r="50" fill="#1B2730" />
        </g>

        {/* Estrellas */}
        <g opacity="0.6">
          <circle cx="110" cy="95" r="1.4" fill="#D4A85C" />
          <circle cx="180" cy="140" r="1" fill="#D4A85C" />
          <circle cx="540" cy="220" r="1.2" fill="#D4A85C" />
          <circle cx="80" cy="180" r="0.8" fill="#D4A85C" />
          <circle cx="220" cy="60" r="1" fill="#D4A85C" />
          <circle cx="380" cy="80" r="1.2" fill="#D4A85C" />
        </g>

        {/* Sugaar: serpiente enroscada de fuego */}
        <g className="sugaar-body" filter="url(#strong-glow)">
          {/* Cuerpo principal en S grande */}
          <path
            d="M 150 480
               C 100 420, 100 380, 180 360
               C 260 340, 320 360, 360 320
               C 400 280, 380 220, 320 200
               C 260 180, 200 220, 240 270
               C 280 320, 380 320, 420 290
               C 460 260, 470 200, 440 170
               C 410 140, 360 130, 330 160"
            stroke="url(#sugaar-body)"
            strokeWidth="44"
            strokeLinecap="round"
            fill="none"
          />

          {/* Capa interior más brillante para efecto de fuego */}
          <path
            d="M 150 480
               C 100 420, 100 380, 180 360
               C 260 340, 320 360, 360 320
               C 400 280, 380 220, 320 200
               C 260 180, 200 220, 240 270
               C 280 320, 380 320, 420 290
               C 460 260, 470 200, 440 170
               C 410 140, 360 130, 330 160"
            stroke="#FFD179"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
            filter="url(#fire-blur)"
          />

          {/* Cabeza de la serpiente */}
          <g className="sugaar-head">
            <ellipse
              cx="330"
              cy="160"
              rx="32"
              ry="22"
              fill="url(#sugaar-body)"
              transform="rotate(-25 330 160)"
            />
            {/* Ojo */}
            <ellipse cx="340" cy="152" rx="6" ry="9" fill="#FFE082" />
            <ellipse cx="341" cy="154" rx="2.5" ry="6" fill="#1B2730" />
            {/* Cuernos pequeños */}
            <path
              d="M 318 142 Q 312 128 320 122"
              stroke="#7A1F0A"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 332 138 Q 332 122 342 118"
              stroke="#7A1F0A"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Cola: lengua de fuego */}
          <path
            d="M 150 480 Q 130 510 100 520 Q 130 515 145 495"
            fill="#E27A35"
            opacity="0.8"
          />
        </g>

        {/* Brasas flotantes */}
        <g className="sugaar-embers">
          <circle cx="180" cy="240" r="3" fill="#FFB74D" opacity="0.8" />
          <circle cx="220" cy="180" r="2" fill="#FFD179" opacity="0.9" />
          <circle cx="380" cy="380" r="2.5" fill="#FFB74D" opacity="0.7" />
          <circle cx="440" cy="350" r="2" fill="#FFD179" opacity="0.85" />
          <circle cx="270" cy="130" r="1.5" fill="#FFE082" opacity="0.8" />
          <circle cx="400" cy="450" r="2" fill="#E27A35" opacity="0.7" />
          <circle cx="160" cy="320" r="2.5" fill="#FFD179" opacity="0.8" />
          <circle cx="320" cy="430" r="1.5" fill="#FFB74D" opacity="0.9" />
        </g>

        {/* Suelo / base */}
        <ellipse cx="300" cy="540" rx="200" ry="22" fill="#000" opacity="0.5" />
      </svg>
    </div>
  )
}
