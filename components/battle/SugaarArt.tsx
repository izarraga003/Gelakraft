/**
 * Sugaar: serpiente de fuego enroscada e intimidante.
 *
 * SVG inline con animaciones SMIL/CSS para:
 *  - Respiración constante del cuerpo
 *  - Serpenteo sutil
 *  - Parpadeo de ojos cada 4s
 *  - Llamarada que oscila
 *  - Brasas flotando hacia arriba
 *  - Pupilas verticales que se contraen
 *  - Cola que se balancea
 *
 * Estados (prop animation, vía clases CSS):
 *  - 'idle'     → animaciones base
 *  - 'hit'      → sacudida horizontal
 *  - 'crit'     → flash dorado + sacudida fuerte
 *  - 'miss'     → la cabeza esquiva
 *  - 'attack'   → cabeza avanza + fuego intensifica
 *  - 'defeated' → opacidad + rotación + grayscale
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
          {/* Gradiente del cuerpo: rojo profundo a negro */}
          <linearGradient id="snake-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8C1F0A" />
            <stop offset="45%" stopColor="#5A1207" />
            <stop offset="100%" stopColor="#1F0604" />
          </linearGradient>

          {/* Highlight del lomo: brasa caliente */}
          <linearGradient id="snake-spine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFAB3A" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#C24617" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8C1F0A" stopOpacity="0" />
          </linearGradient>

          {/* Vientre: amarillento brillante */}
          <linearGradient id="snake-belly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD56B" />
            <stop offset="60%" stopColor="#E27A35" />
            <stop offset="100%" stopColor="#8C1F0A" />
          </linearGradient>

          {/* Fuego */}
          <radialGradient id="sugaar-fire" cx="20%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#FFF59D" />
            <stop offset="20%" stopColor="#FFEB3B" />
            <stop offset="50%" stopColor="#FF8B3A" />
            <stop offset="85%" stopColor="#C24617" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8C1F0A" stopOpacity="0" />
          </radialGradient>

          {/* Ojos brillantes */}
          <radialGradient id="sugaar-eye" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#FFFDE7" />
            <stop offset="30%" stopColor="#FFEB3B" />
            <stop offset="70%" stopColor="#FF8B3A" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </radialGradient>

          {/* Aura roja general */}
          <radialGradient id="sugaar-aura" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="rgba(255, 107, 53, 0.45)" />
            <stop offset="80%" stopColor="rgba(122, 31, 10, 0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Luna roja del fondo */}
          <radialGradient id="moon-blood" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF9476" />
            <stop offset="70%" stopColor="#B7421E" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </radialGradient>

          {/* Patrón de escamas: pequeños rombos */}
          <pattern
            id="scales"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 5 0 L 10 5 L 5 10 L 0 5 Z"
              fill="none"
              stroke="rgba(20, 5, 4, 0.55)"
              strokeWidth="0.6"
            />
            <path
              d="M 5 0.5 L 8.5 5 L 5 9 L 1.5 5 Z"
              fill="rgba(255, 138, 60, 0.08)"
            />
          </pattern>

          {/* Filtro glow para ojos */}
          <filter id="eye-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Filtro glow para fuego */}
          <filter id="fire-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Filtro glow rojo para el cuerpo cuando ataca */}
          <filter id="body-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
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
          <circle
            cx="490"
            cy="100"
            r="58"
            fill="url(#moon-blood)"
            opacity="0.85"
          />
          <circle
            cx="490"
            cy="100"
            r="78"
            fill="rgba(183, 66, 30, 0.12)"
          />
          {/* Cráteres sutiles */}
          <ellipse cx="475" cy="90" rx="6" ry="4" fill="#7A1F0A" opacity="0.5" />
          <ellipse cx="500" cy="115" rx="5" ry="3" fill="#7A1F0A" opacity="0.5" />
        </g>

        {/* Estrellas en el fondo */}
        <g opacity="0.6">
          <circle cx="60" cy="50" r="1.5" fill="#FFF" />
          <circle cx="180" cy="35" r="1" fill="#FFF" />
          <circle cx="350" cy="60" r="1.3" fill="#FFF" />
          <circle cx="430" cy="40" r="0.8" fill="#FFF" />
          <circle cx="555" cy="190" r="1.2" fill="#FFF" />
          <circle cx="250" cy="80" r="0.9" fill="#FFF" />
        </g>

        {/* Estalactitas oscuras superiores */}
        <path
          d="M 0 0 L 0 70 L 30 100 L 60 60 L 100 120 L 140 70 L 180 110 L 220 60 L 260 120 L 300 70 L 340 110 L 380 60 L 420 120 L 470 70 L 510 110 L 550 60 L 600 100 L 600 0 Z"
          fill="#0F0405"
        />

        {/* Aura roja general */}
        <circle cx="300" cy="340" r="320" fill="url(#sugaar-aura)" />

        {/* Suelo de cueva con grietas brillantes */}
        <path
          d="M 0 540 Q 150 510 300 525 Q 450 510 600 540 L 600 600 L 0 600 Z"
          fill="#0F0405"
        />
        <path
          d="M 0 560 Q 100 540 220 555 Q 350 540 480 560 Q 580 555 600 580 L 600 600 L 0 600 Z"
          fill="#060305"
        />
        {/* Grieta brillante */}
        <path
          d="M 80 570 Q 200 565 350 575 Q 480 568 560 580"
          stroke="rgba(255, 107, 53, 0.35)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 140 585 Q 250 580 400 587"
          stroke="rgba(255, 138, 60, 0.25)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* ============== BRASAS FLOTANTES (idle siempre activo) ============== */}
        <g className="sugaar-embers">
          <circle cx="80" cy="450" r="2.5" fill="#FF8B3A">
            <animate
              attributeName="cy"
              from="500"
              to="100"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.8;0.8;0"
              dur="5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="540" cy="380" r="2" fill="#FFD53D">
            <animate
              attributeName="cy"
              from="480"
              to="80"
              dur="6.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.9;0.9;0"
              dur="6.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="160" cy="520" r="1.8" fill="#FF6B35">
            <animate
              attributeName="cy"
              from="500"
              to="180"
              dur="7s"
              begin="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.9;0.9;0"
              dur="7s"
              begin="1s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="450" cy="510" r="2.2" fill="#FFEB3B">
            <animate
              attributeName="cy"
              from="510"
              to="120"
              dur="5.5s"
              begin="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.85;0.85;0"
              dur="5.5s"
              begin="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="280" cy="540" r="1.5" fill="#FF8B3A">
            <animate
              attributeName="cy"
              from="540"
              to="150"
              dur="8s"
              begin="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.7;0.7;0"
              dur="8s"
              begin="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="520" cy="480" r="1.7" fill="#FF6B35">
            <animate
              attributeName="cy"
              from="490"
              to="100"
              dur="6s"
              begin="0.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.8;0.8;0"
              dur="6s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="100" cy="380" r="1.8" fill="#FFD53D">
            <animate
              attributeName="cy"
              from="470"
              to="60"
              dur="9s"
              begin="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.7;0.7;0"
              dur="9s"
              begin="4s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* ============== CUERPO DE LA SERPIENTE ============== */}
        {/* Cuerpo enroscado: 3 curvas grandes en forma de S extendida */}
        <g className="sugaar-body" filter="url(#body-glow)">
          {/* Curva inferior izquierda (cola) — más fina */}
          <path
            d="M 30 540
               Q 60 480, 140 480
               Q 230 480, 280 420
               Q 330 360, 280 300
               Q 230 240, 320 200
               Q 410 160, 420 240
               Q 430 320, 500 320"
            fill="none"
            stroke="url(#snake-body)"
            strokeWidth="55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Highlight del lomo */}
          <path
            d="M 30 540
               Q 60 480, 140 480
               Q 230 480, 280 420
               Q 330 360, 280 300
               Q 230 240, 320 200
               Q 410 160, 420 240
               Q 430 320, 500 320"
            fill="none"
            stroke="url(#snake-spine)"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
          {/* Vientre amarillento (línea inferior más fina) */}
          <path
            d="M 30 540
               Q 60 480, 140 480
               Q 230 480, 280 420
               Q 330 360, 280 300
               Q 230 240, 320 200
               Q 410 160, 420 240
               Q 430 320, 500 320"
            fill="none"
            stroke="url(#snake-belly)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
            transform="translate(0, 8)"
          />
          {/* Patrón de escamas superpuesto */}
          <path
            d="M 30 540
               Q 60 480, 140 480
               Q 230 480, 280 420
               Q 330 360, 280 300
               Q 230 240, 320 200
               Q 410 160, 420 240
               Q 430 320, 500 320"
            fill="none"
            stroke="url(#scales)"
            strokeWidth="55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
          {/* Animación: respiración del cuerpo */}
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1; 1.015; 1"
            dur="3.5s"
            repeatCount="indefinite"
            additive="sum"
          />
        </g>

        {/* ============== CABEZA ============== */}
        <g className="sugaar-head">
          {/* Cuello que conecta con el cuerpo */}
          <path
            d="M 500 320
               Q 530 280, 510 230
               Q 490 175, 430 155"
            fill="none"
            stroke="url(#snake-body)"
            strokeWidth="48"
            strokeLinecap="round"
          />

          {/* Cráneo principal (triangular agresivo) */}
          <path
            d="M 420 130
               Q 380 100, 350 115
               Q 320 130, 320 175
               Q 320 220, 360 235
               L 430 240
               Q 480 230, 490 200
               Q 500 165, 470 140
               Z"
            fill="url(#snake-body)"
            stroke="#1F0604"
            strokeWidth="1.5"
          />

          {/* Mandíbula superior (que se extiende hacia las fauces) */}
          <path
            d="M 340 165
               L 270 155
               Q 250 165, 260 185
               L 320 195
               Z"
            fill="url(#snake-body)"
          />

          {/* Mandíbula inferior abierta */}
          <path
            d="M 340 205
               L 275 220
               Q 255 230, 270 250
               L 335 240
               Z"
            fill="#3A0808"
          />

          {/* Interior de la boca (negro profundo) */}
          <path
            d="M 285 175
               L 340 175
               L 340 230
               L 285 215
               Z"
            fill="#0A0202"
          />

          {/* Colmillos superiores */}
          <polygon points="297,178 300,210 293,178" fill="#FFFDE7" />
          <polygon points="312,176 315,212 308,176" fill="#FFFDE7" />
          {/* Colmillos inferiores */}
          <polygon points="295,225 298,200 305,200" fill="#FFFDE7" />
          <polygon points="318,222 321,200 328,200" fill="#FFFDE7" />

          {/* Lengua bífida saliendo */}
          <g className="sugaar-tongue">
            <path
              d="M 260 195
                 L 230 192
                 L 220 188
                 L 218 196
                 L 228 198
                 L 215 205
                 L 219 210
                 L 232 204
                 L 245 200
                 Z"
              fill="#C24617"
            />
          </g>

          {/* Cuernos curvados hacia atrás */}
          <g>
            <path
              d="M 360 100
                 Q 340 60, 305 50
                 Q 320 75, 355 110
                 Z"
              fill="#1F0604"
              stroke="#3A0808"
              strokeWidth="1.5"
            />
            <path
              d="M 420 105
                 Q 450 60, 490 55
                 Q 470 85, 430 115
                 Z"
              fill="#1F0604"
              stroke="#3A0808"
              strokeWidth="1.5"
            />
          </g>

          {/* Cresta de espinas */}
          <path
            d="M 360 110 L 372 95 L 384 110 L 396 92 L 408 110 L 420 95"
            fill="#3A0808"
            stroke="#1F0604"
            strokeWidth="1.5"
          />

          {/* OJOS — grandes y brillantes */}
          <g className="sugaar-eyes" filter="url(#eye-glow)">
            {/* Ojo izquierdo */}
            <ellipse
              cx="370"
              cy="155"
              rx="18"
              ry="14"
              fill="url(#sugaar-eye)"
            />
            {/* Ojo derecho */}
            <ellipse
              cx="430"
              cy="160"
              rx="18"
              ry="14"
              fill="url(#sugaar-eye)"
            />
            {/* Pupilas verticales tipo reptil */}
            <g className="sugaar-pupils">
              <ellipse cx="370" cy="155" rx="3.5" ry="12" fill="#0A0202" />
              <ellipse cx="430" cy="160" rx="3.5" ry="12" fill="#0A0202" />
            </g>
            {/* Highlights en pupilas */}
            <circle cx="373" cy="150" r="2" fill="#FFFDE7" />
            <circle cx="433" cy="155" r="2" fill="#FFFDE7" />
            {/* Parpadeo: párpado superior cae rápido */}
            <g className="sugaar-eyelids">
              <ellipse
                cx="370"
                cy="155"
                rx="18"
                ry="14"
                fill="#3A0808"
              >
                <animate
                  attributeName="ry"
                  values="0;0;0;0;14;0;0"
                  keyTimes="0;0.92;0.94;0.96;0.97;0.99;1"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <ellipse
                cx="430"
                cy="160"
                rx="18"
                ry="14"
                fill="#3A0808"
              >
                <animate
                  attributeName="ry"
                  values="0;0;0;0;14;0;0"
                  keyTimes="0;0.92;0.94;0.96;0.97;0.99;1"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </ellipse>
            </g>
          </g>

          {/* Cejas furiosas */}
          <path
            d="M 350 138 L 395 145 L 385 130 Q 365 128 350 138 Z"
            fill="#1F0604"
          />
          <path
            d="M 410 140 L 450 138 Q 440 128 420 130 Z"
            fill="#1F0604"
          />

          {/* Fosa nasal */}
          <ellipse cx="345" cy="180" rx="3" ry="5" fill="#0A0202" />
        </g>

        {/* ============== LLAMARADA SALIENDO DE LA BOCA ============== */}
        <g className="sugaar-fire" filter="url(#fire-glow)">
          <path
            d="M 230 195
               Q 150 185, 90 200
               Q 50 215, 30 200
               Q 70 230, 130 235
               Q 80 250, 50 270
               Q 110 265, 170 250
               Q 110 280, 80 300
               Q 150 290, 200 270
               Q 240 250, 270 220
               Q 260 210, 240 200
               Z"
            fill="url(#sugaar-fire)"
          >
            <animate
              attributeName="d"
              values="
                M 230 195 Q 150 185, 90 200 Q 50 215, 30 200 Q 70 230, 130 235 Q 80 250, 50 270 Q 110 265, 170 250 Q 110 280, 80 300 Q 150 290, 200 270 Q 240 250, 270 220 Q 260 210, 240 200 Z;
                M 230 200 Q 140 175, 70 195 Q 30 210, 10 195 Q 60 230, 120 240 Q 70 260, 30 285 Q 100 275, 165 255 Q 100 295, 60 315 Q 140 305, 195 280 Q 240 255, 275 220 Q 260 215, 240 205 Z;
                M 230 195 Q 150 185, 90 200 Q 50 215, 30 200 Q 70 230, 130 235 Q 80 250, 50 270 Q 110 265, 170 250 Q 110 280, 80 300 Q 150 290, 200 270 Q 240 250, 270 220 Q 260 210, 240 200 Z
              "
              dur="0.9s"
              repeatCount="indefinite"
            />
          </path>
          {/* Chispas individuales que vuelan */}
          <circle cx="60" cy="220" r="3" fill="#FFEB3B">
            <animate
              attributeName="cx"
              values="60;20;60"
              dur="1.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0;1"
              dur="1.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="100" cy="270" r="2.5" fill="#FFB74D">
            <animate
              attributeName="cy"
              values="270;240;270"
              dur="1.7s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.9;0.2;0.9"
              dur="1.7s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="40" cy="245" r="2" fill="#FF6B35">
            <animate
              attributeName="cx"
              values="40;15;40"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.1;1"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Centro brillante de la llama */}
          <ellipse cx="220" cy="210" rx="20" ry="14" fill="#FFFDE7" opacity="0.7">
            <animate
              attributeName="opacity"
              values="0.7;0.95;0.7"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
      </svg>
    </div>
  )
}
