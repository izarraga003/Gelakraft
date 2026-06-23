/**
 * Sugaar: retrato frontal de la serpiente de fuego.
 *
 * Composición tipo boss-portrait (mirada al frente para que intimide al
 * espectador):
 *   - Cabeza grande centrada, ocupando 60% del viewBox
 *   - Cuerpo enroscado detrás formando rosetones simétricos
 *   - Mandíbula abierta con colmillos y fuego saliendo hacia el frente
 *   - Ojos grandes amarillos con pupila vertical, perfectamente simétricos
 *   - Cuernos curvados hacia atrás, simétricos
 *   - Fondo de cueva con luna roja arriba, brasas flotantes
 *
 * Animaciones:
 *   - idle: respiración, parpadeo, llama oscila, brasas suben
 *   - hit/crit/miss/attack/defeated vía clases CSS
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
          {/* Gradiente principal del cuerpo: rojo oscuro a negro */}
          <radialGradient id="snake-body" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#A8200A" />
            <stop offset="50%" stopColor="#5A1207" />
            <stop offset="100%" stopColor="#1F0604" />
          </radialGradient>

          {/* Lateral del rostro: más oscuro */}
          <linearGradient id="snake-side" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1F0604" />
            <stop offset="30%" stopColor="#5A1207" />
            <stop offset="70%" stopColor="#5A1207" />
            <stop offset="100%" stopColor="#1F0604" />
          </linearGradient>

          {/* Highlight central del rostro: brasa caliente */}
          <linearGradient id="snake-center" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF8B3A" />
            <stop offset="40%" stopColor="#C24617" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </linearGradient>

          {/* Fuego */}
          <radialGradient id="sugaar-fire" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#FFFDE7" />
            <stop offset="20%" stopColor="#FFEB3B" />
            <stop offset="50%" stopColor="#FF8B3A" />
            <stop offset="85%" stopColor="#C24617" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8C1F0A" stopOpacity="0" />
          </radialGradient>

          {/* Ojos brillantes */}
          <radialGradient id="sugaar-eye" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FFFDE7" />
            <stop offset="30%" stopColor="#FFEB3B" />
            <stop offset="70%" stopColor="#FF8B3A" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </radialGradient>

          {/* Interior boca */}
          <radialGradient id="mouth-inside" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#5A1207" />
            <stop offset="60%" stopColor="#2A0805" />
            <stop offset="100%" stopColor="#0A0202" />
          </radialGradient>

          {/* Aura roja general */}
          <radialGradient id="sugaar-aura" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(255, 107, 53, 0.4)" />
            <stop offset="80%" stopColor="rgba(122, 31, 10, 0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Luna roja del fondo */}
          <radialGradient id="moon-blood" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF9476" />
            <stop offset="70%" stopColor="#B7421E" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </radialGradient>

          {/* Patrón de escamas */}
          <pattern
            id="scales"
            x="0"
            y="0"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 7 1 L 13 7 L 7 13 L 1 7 Z"
              fill="none"
              stroke="rgba(10, 2, 2, 0.4)"
              strokeWidth="0.7"
            />
          </pattern>

          {/* Filtros glow */}
          <filter id="eye-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="fire-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ============== FONDO ============== */}
        <rect width="600" height="600" fill="#0A0608" />

        {/* Luna sangrienta arriba derecha */}
        <g>
          <circle cx="495" cy="95" r="52" fill="url(#moon-blood)" opacity="0.85" />
          <circle cx="495" cy="95" r="72" fill="rgba(183, 66, 30, 0.12)" />
          <ellipse cx="482" cy="86" rx="5" ry="3" fill="#7A1F0A" opacity="0.5" />
          <ellipse cx="505" cy="108" rx="4" ry="3" fill="#7A1F0A" opacity="0.5" />
        </g>

        {/* Estrellas */}
        <g opacity="0.55">
          <circle cx="60" cy="50" r="1.5" fill="#FFF" />
          <circle cx="180" cy="35" r="1" fill="#FFF" />
          <circle cx="350" cy="55" r="1.3" fill="#FFF" />
          <circle cx="430" cy="38" r="0.8" fill="#FFF" />
          <circle cx="555" cy="180" r="1.2" fill="#FFF" />
          <circle cx="250" cy="78" r="0.9" fill="#FFF" />
          <circle cx="100" cy="160" r="1" fill="#FFF" />
        </g>

        {/* Estalactitas oscuras superiores */}
        <path
          d="M 0 0 L 0 60 L 35 95 L 70 55 L 110 110 L 150 65 L 195 100 L 235 55 L 280 110 L 320 65 L 365 100 L 405 55 L 450 100 L 495 60 L 540 95 L 580 55 L 600 80 L 600 0 Z"
          fill="#0F0405"
        />

        {/* Aura roja general */}
        <circle cx="300" cy="320" r="320" fill="url(#sugaar-aura)" />

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
          <circle cx="100" cy="380" r="1.8" fill="#FFD53D">
            <animate attributeName="cy" from="470" to="60" dur="9s" begin="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.7;0.7;0" dur="9s" begin="4s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ============== ROSETONES DEL CUERPO (detrás de la cabeza) ============== */}
        <g className="sugaar-body-coils" opacity="0.95">
          {/* Espiral izquierda */}
          <path
            d="M 150 480
               Q 80 440, 90 360
               Q 100 280, 170 260
               Q 240 250, 260 320"
            stroke="url(#snake-body)"
            strokeWidth="58"
            strokeLinecap="round"
            fill="none"
          />
          {/* Escamas izquierda */}
          <path
            d="M 150 480
               Q 80 440, 90 360
               Q 100 280, 170 260
               Q 240 250, 260 320"
            stroke="url(#scales)"
            strokeWidth="58"
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
          />

          {/* Espiral derecha (espejo) */}
          <path
            d="M 450 480
               Q 520 440, 510 360
               Q 500 280, 430 260
               Q 360 250, 340 320"
            stroke="url(#snake-body)"
            strokeWidth="58"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 450 480
               Q 520 440, 510 360
               Q 500 280, 430 260
               Q 360 250, 340 320"
            stroke="url(#scales)"
            strokeWidth="58"
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
          />

          {/* Cuello central que conecta hacia abajo con los rosetones */}
          <path
            d="M 250 460
               Q 250 380, 290 350
               L 310 350
               Q 350 380, 350 460"
            fill="url(#snake-body)"
          />
          <path
            d="M 250 460
               Q 250 380, 290 350
               L 310 350
               Q 350 380, 350 460"
            fill="url(#scales)"
            opacity="0.55"
          />
        </g>

        {/* ============== CABEZA FRONTAL ============== */}
        <g className="sugaar-head">
          {/* Forma craneal: hexagonal/triangular vista de frente, simétrica */}
          {/* Mejillas / lados de la cabeza */}
          <path
            d="M 300 130
               L 220 175
               L 195 250
               L 215 330
               L 270 380
               L 330 380
               L 385 330
               L 405 250
               L 380 175
               Z"
            fill="url(#snake-side)"
            stroke="#1F0604"
            strokeWidth="2"
          />

          {/* Hueso central frontal (más claro) */}
          <path
            d="M 300 145
               L 250 195
               L 240 280
               L 260 350
               L 340 350
               L 360 280
               L 350 195
               Z"
            fill="url(#snake-center)"
            opacity="0.85"
          />

          {/* Patrón de escamas superpuesto */}
          <path
            d="M 300 130
               L 220 175
               L 195 250
               L 215 330
               L 270 380
               L 330 380
               L 385 330
               L 405 250
               L 380 175
               Z"
            fill="url(#scales)"
            opacity="0.7"
          />

          {/* CUERNOS curvados hacia atrás (simétricos) */}
          <path
            d="M 230 165
               Q 175 110, 130 80
               Q 165 120, 200 165
               Q 215 175, 225 175
               Z"
            fill="#1F0604"
            stroke="#3A0808"
            strokeWidth="1.5"
          />
          <path
            d="M 370 165
               Q 425 110, 470 80
               Q 435 120, 400 165
               Q 385 175, 375 175
               Z"
            fill="#1F0604"
            stroke="#3A0808"
            strokeWidth="1.5"
          />

          {/* Cresta de espinas central (entre cuernos) */}
          <polygon points="285,135 295,100 305,135" fill="#3A0808" stroke="#1F0604" strokeWidth="1" />
          <polygon points="300,140 310,105 320,140" fill="#3A0808" stroke="#1F0604" strokeWidth="1" />
          <polygon points="280,150 290,120 295,150" fill="#3A0808" stroke="#1F0604" strokeWidth="1" />
          <polygon points="313,150 315,120 325,150" fill="#3A0808" stroke="#1F0604" strokeWidth="1" />

          {/* Línea central frontal de la cara */}
          <path
            d="M 300 175 L 300 320"
            stroke="rgba(10, 2, 2, 0.45)"
            strokeWidth="1.5"
          />

          {/* Cejas furiosas (en V) sobre los ojos */}
          <path
            d="M 215 215
               L 280 230
               L 290 215
               Q 250 200, 215 215 Z"
            fill="#1F0604"
          />
          <path
            d="M 385 215
               L 320 230
               L 310 215
               Q 350 200, 385 215 Z"
            fill="#1F0604"
          />

          {/* OJOS simétricos, grandes, amarillos */}
          <g className="sugaar-eyes" filter="url(#eye-glow)">
            {/* Sockets oscuros */}
            <ellipse cx="245" cy="250" rx="28" ry="20" fill="#1F0604" />
            <ellipse cx="355" cy="250" rx="28" ry="20" fill="#1F0604" />
            {/* Iris brillante */}
            <ellipse cx="245" cy="250" rx="22" ry="16" fill="url(#sugaar-eye)" />
            <ellipse cx="355" cy="250" rx="22" ry="16" fill="url(#sugaar-eye)" />
            {/* Pupilas verticales tipo reptil */}
            <g className="sugaar-pupils">
              <ellipse cx="245" cy="250" rx="4" ry="14" fill="#0A0202" />
              <ellipse cx="355" cy="250" rx="4" ry="14" fill="#0A0202" />
            </g>
            {/* Highlight blanco brillante (descentrado) */}
            <circle cx="250" cy="243" r="2.5" fill="#FFFDE7" />
            <circle cx="360" cy="243" r="2.5" fill="#FFFDE7" />
            {/* Párpado para parpadeo */}
            <g className="sugaar-eyelids">
              <ellipse cx="245" cy="250" rx="28" ry="20" fill="#1F0604">
                <animate
                  attributeName="ry"
                  values="0;0;0;0;20;0;0"
                  keyTimes="0;0.92;0.94;0.96;0.97;0.99;1"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <ellipse cx="355" cy="250" rx="28" ry="20" fill="#1F0604">
                <animate
                  attributeName="ry"
                  values="0;0;0;0;20;0;0"
                  keyTimes="0;0.92;0.94;0.96;0.97;0.99;1"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </ellipse>
            </g>
          </g>

          {/* Fosas nasales (dos rendijas verticales bajo los ojos) */}
          <ellipse cx="285" cy="295" rx="3" ry="6" fill="#0A0202" />
          <ellipse cx="315" cy="295" rx="3" ry="6" fill="#0A0202" />

          {/* BOCA ABIERTA simétrica con fauces */}
          {/* Mandíbula superior (de la cara hacia abajo) */}
          <path
            d="M 240 330
               L 360 330
               L 360 345
               L 240 345
               Z"
            fill="#1F0604"
          />
          {/* Interior boca */}
          <path
            d="M 250 345
               Q 250 410, 300 430
               Q 350 410, 350 345
               Z"
            fill="url(#mouth-inside)"
          />
          {/* Mandíbula inferior */}
          <path
            d="M 250 345
               Q 250 415, 300 435
               Q 350 415, 350 345
               L 358 350
               Q 358 425, 300 445
               Q 242 425, 242 350
               Z"
            fill="#3A0808"
            stroke="#1F0604"
            strokeWidth="1.5"
          />

          {/* Colmillos superiores (4 grandes simétricos) */}
          <polygon points="265,345 270,400 273,345" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />
          <polygon points="285,345 290,410 293,345" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />
          <polygon points="307,345 310,410 313,345" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />
          <polygon points="327,345 330,400 333,345" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />

          {/* Dientes inferiores apuntando hacia arriba */}
          <polygon points="270,440 275,410 280,440" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />
          <polygon points="290,447 295,415 300,447" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />
          <polygon points="305,447 310,415 315,447" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />
          <polygon points="325,440 330,410 335,440" fill="#FFFDE7" stroke="#C0B080" strokeWidth="0.5" />

          {/* Lengua bífida saliendo */}
          <g className="sugaar-tongue">
            <path
              d="M 290 430
                 L 285 460
                 L 280 475
                 L 290 470
                 L 295 460
                 L 300 475
                 L 305 460
                 L 310 470
                 L 320 475
                 L 315 460
                 L 310 430
                 Z"
              fill="#C24617"
            />
          </g>
        </g>

        {/* ============== LLAMARADA HACIA EL FRENTE ============== */}
        <g className="sugaar-fire" filter="url(#fire-glow)">
          <path
            d="M 240 410
               Q 220 470, 200 510
               Q 195 535, 230 540
               Q 230 510, 260 490
               Q 250 530, 240 555
               Q 270 555, 290 530
               Q 290 555, 305 575
               Q 320 555, 320 525
               Q 340 555, 365 555
               Q 360 530, 350 500
               Q 380 510, 400 540
               Q 405 510, 380 475
               Q 410 480, 415 460
               Q 395 440, 360 420
               L 240 410 Z"
            fill="url(#sugaar-fire)"
          >
            <animate
              attributeName="d"
              values="
                M 240 410 Q 220 470, 200 510 Q 195 535, 230 540 Q 230 510, 260 490 Q 250 530, 240 555 Q 270 555, 290 530 Q 290 555, 305 575 Q 320 555, 320 525 Q 340 555, 365 555 Q 360 530, 350 500 Q 380 510, 400 540 Q 405 510, 380 475 Q 410 480, 415 460 Q 395 440, 360 420 L 240 410 Z;
                M 240 410 Q 210 480, 190 520 Q 180 545, 220 550 Q 225 515, 255 495 Q 240 540, 230 570 Q 265 570, 285 540 Q 285 565, 305 585 Q 325 565, 325 535 Q 345 565, 375 565 Q 365 540, 355 505 Q 385 515, 410 555 Q 415 520, 385 480 Q 420 485, 425 465 Q 400 440, 360 418 L 240 410 Z;
                M 240 410 Q 220 470, 200 510 Q 195 535, 230 540 Q 230 510, 260 490 Q 250 530, 240 555 Q 270 555, 290 530 Q 290 555, 305 575 Q 320 555, 320 525 Q 340 555, 365 555 Q 360 530, 350 500 Q 380 510, 400 540 Q 405 510, 380 475 Q 410 480, 415 460 Q 395 440, 360 420 L 240 410 Z
              "
              dur="0.8s"
              repeatCount="indefinite"
            />
          </path>
          {/* Centro brillante de la llama */}
          <ellipse cx="300" cy="460" rx="35" ry="22" fill="#FFFDE7" opacity="0.65">
            <animate
              attributeName="opacity"
              values="0.65;0.95;0.65"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </ellipse>
          {/* Chispas que vuelan hacia abajo */}
          <circle cx="220" cy="555" r="3" fill="#FFEB3B">
            <animate attributeName="cy" values="540;590;540" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="380" cy="555" r="2.5" fill="#FFB74D">
            <animate attributeName="cy" values="540;585;540" dur="1.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="300" cy="585" r="2.5" fill="#FF6B35">
            <animate attributeName="cy" values="570;595;570" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.1;1" dur="1.2s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  )
}
