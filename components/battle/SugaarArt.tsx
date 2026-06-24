/**
 * Sugaar: serpiente de fuego erguida en pose de ataque.
 *
 * Composición lateral 3/4:
 *   - Cuerpo enroscado MASIVO ocupando la base (60% del area visible)
 *   - Cuello largo que sube serpenteando en S
 *   - Cabeza pequeña y proporcionada arriba a la derecha
 *   - Boca abierta escupiendo fuego hacia la derecha
 *   - Cresta dorsal a lo largo de todo el cuello
 *
 * Proporciones controladas para evitar "cabeza de burro": la cabeza ocupa
 * solo ~15% del ancho del viewBox y ~15% del alto.
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
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradiente cuerpo: rojo oscuro a casi negro */}
          <linearGradient id="snake-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A8200A" />
            <stop offset="50%" stopColor="#5A1207" />
            <stop offset="100%" stopColor="#1F0604" />
          </linearGradient>

          {/* Highlight superior del cuerpo (brasa) */}
          <linearGradient id="snake-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 171, 58, 0.6)" />
            <stop offset="100%" stopColor="rgba(255, 171, 58, 0)" />
          </linearGradient>

          {/* Vientre amarillento */}
          <linearGradient id="snake-belly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 213, 107, 0)" />
            <stop offset="60%" stopColor="rgba(255, 138, 60, 0.2)" />
            <stop offset="100%" stopColor="rgba(255, 213, 107, 0.4)" />
          </linearGradient>

          {/* Fuego */}
          <radialGradient id="sugaar-fire" cx="20%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#FFFDE7" />
            <stop offset="20%" stopColor="#FFEB3B" />
            <stop offset="50%" stopColor="#FF8B3A" />
            <stop offset="85%" stopColor="#C24617" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8C1F0A" stopOpacity="0" />
          </radialGradient>

          {/* Ojos */}
          <radialGradient id="sugaar-eye" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FFFDE7" />
            <stop offset="30%" stopColor="#FFEB3B" />
            <stop offset="70%" stopColor="#FF8B3A" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </radialGradient>

          {/* Luna roja */}
          <radialGradient id="moon-blood" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF9476" />
            <stop offset="70%" stopColor="#B7421E" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </radialGradient>

          {/* Aura general */}
          <radialGradient id="sugaar-aura" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(255, 107, 53, 0.4)" />
            <stop offset="80%" stopColor="rgba(122, 31, 10, 0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Patrón de escamas pequeño */}
          <pattern
            id="scales"
            x="0"
            y="0"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 6 1 L 11 6 L 6 11 L 1 6 Z"
              fill="none"
              stroke="rgba(10, 2, 2, 0.45)"
              strokeWidth="0.6"
            />
          </pattern>

          {/* Filtros glow */}
          <filter id="eye-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="fire-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ============== FONDO ============== */}
        <rect width="600" height="600" fill="#0A0608" />

        {/* Luna sangrienta */}
        <g>
          <circle cx="105" cy="95" r="48" fill="url(#moon-blood)" opacity="0.85" />
          <circle cx="105" cy="95" r="68" fill="rgba(183, 66, 30, 0.12)" />
          <ellipse cx="92" cy="86" rx="5" ry="3" fill="#7A1F0A" opacity="0.5" />
          <ellipse cx="115" cy="108" rx="4" ry="3" fill="#7A1F0A" opacity="0.5" />
        </g>

        {/* Estrellas */}
        <g opacity="0.55">
          <circle cx="220" cy="50" r="1.4" fill="#FFF" />
          <circle cx="280" cy="35" r="1" fill="#FFF" />
          <circle cx="350" cy="60" r="1.3" fill="#FFF" />
          <circle cx="430" cy="38" r="0.8" fill="#FFF" />
          <circle cx="555" cy="80" r="1.2" fill="#FFF" />
          <circle cx="510" cy="40" r="0.9" fill="#FFF" />
          <circle cx="180" cy="170" r="1" fill="#FFF" />
        </g>

        {/* Estalactitas */}
        <path
          d="M 0 0 L 0 50 L 35 95 L 70 50 L 110 110 L 150 60 L 195 100 L 235 55 L 280 110 L 320 65 L 365 100 L 405 55 L 450 100 L 495 60 L 540 95 L 580 55 L 600 80 L 600 0 Z"
          fill="#0F0405"
        />

        {/* Aura roja general detrás de Sugaar */}
        <circle cx="300" cy="380" r="320" fill="url(#sugaar-aura)" />

        {/* Suelo de cueva con grietas brillantes */}
        <path
          d="M 0 540 Q 150 510 300 525 Q 450 510 600 540 L 600 600 L 0 600 Z"
          fill="#0F0405"
        />
        <path
          d="M 0 565 Q 100 545 220 558 Q 350 545 480 562 Q 580 558 600 580 L 600 600 L 0 600 Z"
          fill="#060305"
        />
        <path
          d="M 80 575 Q 200 568 350 578 Q 480 572 560 583"
          stroke="rgba(255, 107, 53, 0.3)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 140 588 Q 250 583 400 589"
          stroke="rgba(255, 138, 60, 0.2)"
          strokeWidth="1.3"
          fill="none"
        />

        {/* ============== BRASAS FLOTANTES ============== */}
        <g className="sugaar-embers">
          <circle cx="80" cy="450" r="2.5" fill="#FF8B3A">
            <animate attributeName="cy" from="500" to="100" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.85;0.85;0" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="540" cy="380" r="2" fill="#FFD53D">
            <animate attributeName="cy" from="480" to="80" dur="6.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.9;0.9;0" dur="6.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="160" cy="520" r="1.8" fill="#FF6B35">
            <animate attributeName="cy" from="500" to="180" dur="7s" begin="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.9;0.9;0" dur="7s" begin="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="450" cy="510" r="2.2" fill="#FFEB3B">
            <animate attributeName="cy" from="510" to="120" dur="5.5s" begin="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.85;0.85;0" dur="5.5s" begin="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="280" cy="540" r="1.5" fill="#FF8B3A">
            <animate attributeName="cy" from="540" to="150" dur="8s" begin="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.7;0.7;0" dur="8s" begin="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="520" cy="480" r="1.7" fill="#FF6B35">
            <animate attributeName="cy" from="490" to="100" dur="6s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.8;0.8;0" dur="6s" begin="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="200" cy="380" r="1.8" fill="#FFD53D">
            <animate attributeName="cy" from="470" to="60" dur="9s" begin="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.7;0.7;0" dur="9s" begin="4s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ============== CUERPO ENROSCADO (la masa principal) ============== */}
        <g className="sugaar-body">
          {/* Forma del cuerpo enroscado, todo un único path serpenteando.
              Es lo más visible y dominante de la composición. */}

          {/* Vuelta más externa / atrás (más oscura) */}
          <path
            d="M 70 520
               C 60 460, 120 430, 200 440
               C 300 450, 400 460, 480 440
               C 550 425, 560 380, 510 360
               C 460 345, 380 360, 320 350
               C 260 340, 230 310, 250 270
               C 270 230, 320 210, 360 200"
            fill="none"
            stroke="url(#snake-body)"
            strokeWidth="62"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Highlight superior (brasa caliente sobre el cuerpo) */}
          <path
            d="M 70 520
               C 60 460, 120 430, 200 440
               C 300 450, 400 460, 480 440
               C 550 425, 560 380, 510 360
               C 460 345, 380 360, 320 350
               C 260 340, 230 310, 250 270
               C 270 230, 320 210, 360 200"
            fill="none"
            stroke="url(#snake-highlight)"
            strokeWidth="34"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, -8)"
          />

          {/* Vientre amarillento (sombra inferior brillante) */}
          <path
            d="M 70 520
               C 60 460, 120 430, 200 440
               C 300 450, 400 460, 480 440
               C 550 425, 560 380, 510 360
               C 460 345, 380 360, 320 350
               C 260 340, 230 310, 250 270
               C 270 230, 320 210, 360 200"
            fill="none"
            stroke="url(#snake-belly)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 14)"
            opacity="0.7"
          />

          {/* Patrón de escamas */}
          <path
            d="M 70 520
               C 60 460, 120 430, 200 440
               C 300 450, 400 460, 480 440
               C 550 425, 560 380, 510 360
               C 460 345, 380 360, 320 350
               C 260 340, 230 310, 250 270
               C 270 230, 320 210, 360 200"
            fill="none"
            stroke="url(#scales)"
            strokeWidth="62"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* Cresta dorsal: pequeñas espinas a lo largo del cuello */}
          <g>
            <polygon points="320,205 325,185 330,205" fill="#3A0808" />
            <polygon points="305,225 310,205 315,225" fill="#3A0808" />
            <polygon points="280,255 285,235 290,255" fill="#3A0808" />
            <polygon points="265,285 270,265 275,285" fill="#3A0808" />
            <polygon points="265,320 270,300 275,320" fill="#3A0808" />
            <polygon points="285,335 290,315 295,335" fill="#3A0808" />
          </g>
        </g>

        {/* ============== CABEZA (pequeña, proporcionada) ============== */}
        <g className="sugaar-head">
          {/* Conexión cuello-cabeza */}
          <path
            d="M 350 195
               C 360 175, 380 165, 400 165
               L 430 170"
            fill="none"
            stroke="url(#snake-body)"
            strokeWidth="55"
            strokeLinecap="round"
          />

          {/* Forma craneal lateral: triangular alargada apuntando a la derecha */}
          <path
            d="M 395 145
               L 470 130
               Q 515 135, 525 165
               Q 520 195, 480 200
               L 400 200
               Q 380 195, 380 170
               Z"
            fill="url(#snake-body)"
            stroke="#1F0604"
            strokeWidth="1.5"
          />

          {/* Patrón de escamas en la cabeza */}
          <path
            d="M 395 145
               L 470 130
               Q 515 135, 525 165
               Q 520 195, 480 200
               L 400 200
               Q 380 195, 380 170
               Z"
            fill="url(#scales)"
            opacity="0.7"
          />

          {/* Cuernos cortos hacia atrás (proporcionados) */}
          <path
            d="M 420 135
               Q 410 110, 395 100
               Q 405 120, 415 138
               Z"
            fill="#1F0604"
            stroke="#3A0808"
            strokeWidth="1"
          />
          <path
            d="M 450 128
               Q 445 100, 435 88
               Q 440 115, 445 132
               Z"
            fill="#1F0604"
            stroke="#3A0808"
            strokeWidth="1"
          />

          {/* Ceja furiosa sobre el ojo */}
          <path
            d="M 430 152
               L 470 148
               Q 475 158, 465 162
               Q 445 160, 430 158
               Z"
            fill="#1F0604"
          />

          {/* OJO único visible (lateral) — pequeño pero brillante */}
          <g className="sugaar-eyes" filter="url(#eye-glow)">
            <ellipse cx="455" cy="168" rx="13" ry="10" fill="#1F0604" />
            <ellipse cx="455" cy="168" rx="10" ry="8" fill="url(#sugaar-eye)" />
            {/* Pupila vertical */}
            <ellipse cx="455" cy="168" rx="2" ry="7" fill="#0A0202" />
            {/* Highlight */}
            <circle cx="458" cy="164" r="1.5" fill="#FFFDE7" />
            {/* Párpado para parpadeo */}
            <ellipse cx="455" cy="168" rx="13" ry="10" fill="#1F0604">
              <animate
                attributeName="ry"
                values="0;0;0;0;10;0;0"
                keyTimes="0;0.92;0.94;0.96;0.97;0.99;1"
                dur="5s"
                repeatCount="indefinite"
              />
            </ellipse>
          </g>

          {/* Fosa nasal */}
          <ellipse cx="510" cy="175" rx="2.5" ry="4" fill="#0A0202" />

          {/* MANDÍBULA INFERIOR ABIERTA (apuntando abajo-derecha) */}
          <path
            d="M 490 200
               Q 530 210, 555 235
               Q 558 255, 540 260
               Q 500 255, 475 230
               Z"
            fill="#3A0808"
            stroke="#1F0604"
            strokeWidth="1.5"
          />

          {/* Interior boca (oscuro) */}
          <path
            d="M 485 200
               Q 520 215, 545 240
               Q 525 230, 495 225
               Q 480 215, 475 205
               Z"
            fill="#0A0202"
          />

          {/* Colmillos superiores */}
          <polygon points="495,200 498,222 502,200" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />
          <polygon points="513,200 516,228 520,200" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />
          {/* Colmillos inferiores */}
          <polygon points="510,242 513,225 518,242" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />
          <polygon points="530,250 532,232 537,250" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />

          {/* Lengua bífida saliendo horizontal */}
          <g className="sugaar-tongue">
            <path
              d="M 540 240
                 L 580 245
                 L 600 240
                 L 605 248
                 L 590 253
                 L 605 260
                 L 600 268
                 L 585 262
                 L 565 258
                 L 545 252
                 Z"
              fill="#C24617"
            />
          </g>
        </g>

        {/* ============== LLAMARADA SALIENDO DE LA BOCA ============== */}
        <g className="sugaar-fire" filter="url(#fire-glow)">
          <path
            d="M 540 235
               Q 580 220, 580 200
               Q 580 240, 600 250
               Q 570 260, 580 285
               Q 555 270, 555 290
               Q 540 270, 520 275
               Q 535 250, 520 240
               Z"
            fill="url(#sugaar-fire)"
            transform="translate(0, 0)"
          >
            <animate
              attributeName="d"
              values="
                M 540 235 Q 580 220, 580 200 Q 580 240, 600 250 Q 570 260, 580 285 Q 555 270, 555 290 Q 540 270, 520 275 Q 535 250, 520 240 Z;
                M 540 240 Q 588 218, 590 195 Q 588 245, 605 255 Q 575 265, 590 290 Q 558 278, 558 298 Q 542 275, 518 280 Q 538 248, 522 240 Z;
                M 540 235 Q 580 220, 580 200 Q 580 240, 600 250 Q 570 260, 580 285 Q 555 270, 555 290 Q 540 270, 520 275 Q 535 250, 520 240 Z
              "
              dur="0.8s"
              repeatCount="indefinite"
            />
          </path>
          {/* Centro brillante */}
          <ellipse cx="555" cy="245" rx="14" ry="10" fill="#FFFDE7" opacity="0.65">
            <animate attributeName="opacity" values="0.65;0.95;0.65" dur="0.6s" repeatCount="indefinite" />
          </ellipse>
          {/* Chispas individuales */}
          <circle cx="585" cy="220" r="2.5" fill="#FFEB3B">
            <animate attributeName="cy" values="220;195;220" dur="1.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="1.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="595" cy="270" r="2" fill="#FFB74D">
            <animate attributeName="cx" values="595;620;595" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  )
}
