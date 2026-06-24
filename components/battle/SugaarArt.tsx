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

        {/* ============== FONDO: tormenta sobre Anboto ============== */}
        {/* Gradiente del cielo: oscuro arriba, rojizo en el horizonte */}
        <defs>
          <linearGradient id="storm-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0A0608" />
            <stop offset="55%" stopColor="#1A0A0C" />
            <stop offset="85%" stopColor="#3A1208" />
            <stop offset="100%" stopColor="#5A1207" />
          </linearGradient>
          <linearGradient id="mountain-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1F0A0C" />
            <stop offset="100%" stopColor="#0A0405" />
          </linearGradient>
        </defs>
        <rect width="600" height="600" fill="url(#storm-sky)" />

        {/* Capas de nubes oscuras moviéndose */}
        <g opacity="0.85">
          <ellipse cx="120" cy="60" rx="180" ry="35" fill="#1F0A0C" />
          <ellipse cx="450" cy="90" rx="220" ry="40" fill="#1F0A0C" />
          <ellipse cx="280" cy="140" rx="260" ry="40" fill="#150708" />
          <ellipse cx="500" cy="190" rx="180" ry="30" fill="#150708" opacity="0.7" />
          <ellipse cx="80" cy="220" rx="140" ry="25" fill="#150708" opacity="0.6" />
        </g>

        {/* Relámpagos rojos cruzando el cielo */}
        <g className="sugaar-lightning" opacity="0">
          <path
            d="M 380 0 L 360 80 L 400 100 L 370 180 L 410 200 L 380 280"
            stroke="#FFB089"
            strokeWidth="2.5"
            fill="none"
            opacity="0.95"
          />
          <path
            d="M 380 0 L 360 80 L 400 100 L 370 180 L 410 200 L 380 280"
            stroke="rgba(255, 107, 53, 0.4)"
            strokeWidth="8"
            fill="none"
          />
          <animate
            attributeName="opacity"
            values="0;0;1;0;0;0;0;0.7;0;0;0"
            keyTimes="0;0.4;0.42;0.44;0.55;0.7;0.75;0.77;0.8;0.95;1"
            dur="7s"
            repeatCount="indefinite"
          />
        </g>
        <g className="sugaar-lightning-2" opacity="0">
          <path
            d="M 120 20 L 130 70 L 100 90 L 140 150 L 110 220"
            stroke="#FFB089"
            strokeWidth="2"
            fill="none"
            opacity="0.95"
          />
          <path
            d="M 120 20 L 130 70 L 100 90 L 140 150 L 110 220"
            stroke="rgba(255, 107, 53, 0.4)"
            strokeWidth="6"
            fill="none"
          />
          <animate
            attributeName="opacity"
            values="0;0;0;0.85;0;0;0;0"
            keyTimes="0;0.2;0.85;0.87;0.89;0.91;0.95;1"
            dur="9s"
            repeatCount="indefinite"
          />
        </g>

        {/* Silueta de Anboto al fondo (cordillera vasca) */}
        <path
          d="M 0 380
             L 70 320 L 130 350 L 200 290 L 260 330 L 320 270 L 380 310
             L 440 250 L 510 300 L 560 280 L 600 320 L 600 410 L 0 410 Z"
          fill="url(#mountain-grad)"
          opacity="0.7"
        />
        {/* Pico principal de Anboto, en primer plano */}
        <path
          d="M 90 460
             L 200 280 L 290 380 L 370 200 L 460 360 L 550 320 L 600 400
             L 600 540 L 0 540 L 0 460 Z"
          fill="#0A0405"
        />
        {/* Bordes iluminados por la luz roja del horizonte */}
        <path
          d="M 200 280 L 370 200"
          stroke="rgba(255, 107, 53, 0.35)"
          strokeWidth="2"
          fill="none"
        />

        {/* Aura roja general detrás de Sugaar */}
        <circle cx="300" cy="380" r="320" fill="url(#sugaar-aura)" />

        {/* Suelo volcánico con grietas brillantes */}
        <path
          d="M 0 540 Q 150 510 300 525 Q 450 510 600 540 L 600 600 L 0 600 Z"
          fill="#0F0405"
        />
        <path
          d="M 0 565 Q 100 545 220 558 Q 350 545 480 562 Q 580 558 600 580 L 600 600 L 0 600 Z"
          fill="#060305"
        />
        {/* Grietas con lava asomando */}
        <path
          d="M 80 575 Q 200 568 350 578 Q 480 572 560 583"
          stroke="rgba(255, 107, 53, 0.5)"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M 140 588 Q 250 583 400 589"
          stroke="rgba(255, 138, 60, 0.4)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 30 595 Q 90 590 170 594"
          stroke="rgba(255, 107, 53, 0.3)"
          strokeWidth="1.5"
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

        {/* ============== CABEZA (serpiente real: chata, alargada) ============== */}
        <g className="sugaar-head">
          {/* Conexión cuello-cabeza (suave, sin separación marcada como en mamíferos) */}
          <path
            d="M 350 195
               C 355 180, 370 170, 395 168"
            fill="none"
            stroke="url(#snake-body)"
            strokeWidth="58"
            strokeLinecap="round"
          />

          {/* CRÁNEO + MANDÍBULA SUPERIOR (perfil chato y largo).
              Anchura 160px, altura solo 45px → ratio 3.5:1 (forma de torpedo
              típica de cabeza de serpiente, no la forma cuadrada de perro). */}
          <path
            d="M 395 152
               C 425 144, 470 140, 510 144
               C 535 148, 552 158, 556 172
               L 553 184
               L 540 196
               L 478 200
               L 395 198
               Z"
            fill="url(#snake-body)"
            stroke="#1F0604"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Escamas de la cabeza */}
          <path
            d="M 395 152
               C 425 144, 470 140, 510 144
               C 535 148, 552 158, 556 172
               L 553 184
               L 540 196
               L 478 200
               L 395 198
               Z"
            fill="url(#scales)"
            opacity="0.65"
          />

          {/* Escudo cefálico superior (placa grande del cráneo, típica de serpientes) */}
          <path
            d="M 410 152
               C 440 146, 480 144, 510 148
               C 525 152, 538 158, 540 168
               L 510 172
               L 460 172
               L 420 168
               Z"
            fill="rgba(168, 32, 10, 0.45)"
            stroke="rgba(10, 2, 2, 0.4)"
            strokeWidth="1"
          />

          {/* Escama supraocular (encima del ojo, sustituye la "ceja" de mamífero) */}
          <path
            d="M 458 152
               L 498 150
               L 495 162
               L 463 163
               Z"
            fill="#1F0604"
            stroke="#3A0808"
            strokeWidth="0.8"
          />

          {/* OJO arriba de la cabeza (no en el centro lateral como un perro) */}
          <g className="sugaar-eyes" filter="url(#eye-glow)">
            <ellipse cx="478" cy="166" rx="11" ry="8" fill="#1F0604" />
            <ellipse cx="478" cy="166" rx="9" ry="6.5" fill="url(#sugaar-eye)" />
            {/* Pupila vertical — clave para que parezca serpiente */}
            <ellipse cx="478" cy="166" rx="1.8" ry="5.5" fill="#0A0202" />
            <circle cx="481" cy="163" r="1.2" fill="#FFFDE7" />
            {/* Párpado para parpadeo */}
            <ellipse cx="478" cy="166" rx="11" ry="8" fill="#1F0604">
              <animate
                attributeName="ry"
                values="0;0;0;0;8;0;0"
                keyTimes="0;0.92;0.94;0.96;0.97;0.99;1"
                dur="5s"
                repeatCount="indefinite"
              />
            </ellipse>
          </g>

          {/* Fosas nasales: dos pequeñas en la punta del hocico (no abajo como antes) */}
          <ellipse cx="543" cy="170" rx="2" ry="3.2" fill="#0A0202" />
          <ellipse cx="548" cy="178" rx="1.5" ry="2.5" fill="#0A0202" />

          {/* Pequeñas escamas tipo cresta (sustituyen a los cuernos enormes que parecían de demonio) */}
          <polygon points="420,148 425,138 430,148" fill="#3A0808" />
          <polygon points="442,144 447,134 452,144" fill="#3A0808" />
          <polygon points="465,142 470,131 475,142" fill="#3A0808" />
          <polygon points="488,142 493,132 498,142" fill="#3A0808" />

          {/* MANDÍBULA INFERIOR DESENCAJADA (abierta muy ampliamente,
              característica de serpiente que se prepara para atacar) */}
          <path
            d="M 470 198
               C 472 230, 488 262, 518 282
               L 530 283
               C 528 273, 522 258, 515 244
               C 503 222, 487 207, 470 198
               Z"
            fill="#3A0808"
            stroke="#1F0604"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Highlight superior de la mandíbula inferior */}
          <path
            d="M 472 200
               C 478 220, 490 245, 510 268"
            stroke="rgba(168, 32, 10, 0.5)"
            strokeWidth="2"
            fill="none"
          />

          {/* Interior boca (negro profundo, MUY abierta) */}
          <path
            d="M 470 198
               L 540 196
               L 538 210
               C 525 220, 510 225, 495 222
               C 485 218, 478 210, 470 198
               Z"
            fill="#0A0202"
          />

          {/* Colmillos superiores (2 grandes, como una víbora venenosa real, no 4) */}
          <polygon points="488,198 491,238 494,198" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />
          <polygon points="518,198 521,234 524,198" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />

          {/* Colmillos inferiores (más pequeños, también 2) */}
          <polygon points="500,255 503,232 506,255" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />
          <polygon points="520,272 522,248 525,272" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />

          {/* Lengua bífida saliendo entre los colmillos hacia abajo */}
          <g className="sugaar-tongue">
            <path
              d="M 505 218
                 L 510 250
                 L 502 270
                 L 505 280
                 L 512 275
                 L 514 258
                 L 519 278
                 L 524 270
                 L 521 250
                 L 518 218
                 Z"
              fill="#C24617"
            />
          </g>
        </g>

        {/* ============== LLAMARADA SALIENDO DE LA BOCA ============== */}
        <g className="sugaar-fire" filter="url(#fire-glow)">
          {/* Sale de la boca abierta (centro ~510, 230) hacia abajo-derecha */}
          <path
            d="M 510 220
               Q 550 240, 580 260
               Q 610 280, 615 320
               Q 590 330, 580 360
               Q 560 340, 540 360
               Q 530 330, 510 340
               Q 500 310, 485 320
               Q 475 290, 490 270
               Q 495 245, 510 220 Z"
            fill="url(#sugaar-fire)"
          >
            <animate
              attributeName="d"
              values="
                M 510 220 Q 550 240, 580 260 Q 610 280, 615 320 Q 590 330, 580 360 Q 560 340, 540 360 Q 530 330, 510 340 Q 500 310, 485 320 Q 475 290, 490 270 Q 495 245, 510 220 Z;
                M 508 218 Q 555 245, 588 270 Q 620 295, 625 330 Q 595 340, 585 372 Q 562 348, 540 370 Q 528 338, 508 348 Q 498 315, 482 325 Q 472 290, 488 268 Q 493 245, 508 218 Z;
                M 510 220 Q 550 240, 580 260 Q 610 280, 615 320 Q 590 330, 580 360 Q 560 340, 540 360 Q 530 330, 510 340 Q 500 310, 485 320 Q 475 290, 490 270 Q 495 245, 510 220 Z
              "
              dur="0.8s"
              repeatCount="indefinite"
            />
          </path>
          {/* Centro brillante */}
          <ellipse cx="540" cy="295" rx="22" ry="16" fill="#FFFDE7" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.92;0.6" dur="0.6s" repeatCount="indefinite" />
          </ellipse>
          {/* Chispas que vuelan */}
          <circle cx="600" cy="280" r="2.5" fill="#FFEB3B">
            <animate attributeName="cx" values="600;625;600" dur="1.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="1.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="590" cy="350" r="2" fill="#FFB74D">
            <animate attributeName="cy" values="350;380;350" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="555" cy="360" r="2.2" fill="#FF6B35">
            <animate attributeName="cy" values="360;395;360" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.1;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  )
}
