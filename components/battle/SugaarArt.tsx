/**
 * Sugaar: dragón de fuego en pose intimidante.
 *
 * Composición SVG (600×600):
 *  - Fondo de cueva oscura con luna roja
 *  - Alas extendidas tras el cuerpo
 *  - Cuerpo masivo + cuello grueso
 *  - Cabeza con cuernos enormes y fauces abiertas
 *  - Llamas escupiendo de la boca
 *  - Ojos amarillos brillantes
 *  - Cola con punta afilada
 *  - Brasas/partículas flotando
 *
 * Estados (animation prop):
 *  - 'idle'     → respiración suave
 *  - 'hit'      → sacudida horizontal
 *  - 'crit'     → flash dorado + sacudida fuerte
 *  - 'miss'     → la cabeza se desliza (esquiva)
 *  - 'attack'   → ojos+fuego intensos, sacudida hacia adelante
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
          {/* Gradiente del cuerpo: rojo oscuro con destellos de fuego */}
          <linearGradient id="dragon-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7A1F0A" />
            <stop offset="40%" stopColor="#4A0F05" />
            <stop offset="80%" stopColor="#2A0805" />
            <stop offset="100%" stopColor="#1A0303" />
          </linearGradient>

          {/* Escamas: highlight rojo */}
          <linearGradient id="dragon-scales" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#C24617" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </linearGradient>

          {/* Vientre: más claro */}
          <linearGradient id="dragon-belly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E27A35" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </linearGradient>

          {/* Alas: membrana semi-transparente roja */}
          <linearGradient id="dragon-wing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A0F05" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2A0805" stopOpacity="0.85" />
          </linearGradient>

          {/* Fuego de la boca */}
          <radialGradient id="dragon-fire" cx="0%" cy="50%" r="100%">
            <stop offset="0%" stopColor="#FFEB3B" />
            <stop offset="30%" stopColor="#FFB74D" />
            <stop offset="60%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#C24617" stopOpacity="0" />
          </radialGradient>

          {/* Ojos brillantes */}
          <radialGradient id="dragon-eye" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF59D" />
            <stop offset="50%" stopColor="#FFD600" />
            <stop offset="100%" stopColor="#FF6F00" />
          </radialGradient>

          {/* Resplandor exterior alrededor */}
          <radialGradient id="dragon-aura" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(255, 107, 53, 0.45)" />
            <stop offset="100%" stopColor="rgba(122, 31, 10, 0)" />
          </radialGradient>

          {/* Luna roja del fondo */}
          <radialGradient id="moon-blood" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF8B6A" />
            <stop offset="70%" stopColor="#B7421E" />
            <stop offset="100%" stopColor="#7A1F0A" />
          </radialGradient>

          {/* Filtro de glow para ojos */}
          <filter id="eye-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow más amplio para el fuego */}
          <filter id="fire-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ============== FONDO ============== */}
        <rect width="600" height="600" fill="#0A0608" />

        {/* Luna sangrienta */}
        <circle cx="120" cy="120" r="48" fill="url(#moon-blood)" opacity="0.85" />
        <circle cx="120" cy="120" r="60" fill="rgba(183, 66, 30, 0.15)" />

        {/* Pequeñas estrellas */}
        <circle cx="80" cy="50" r="1.5" fill="#FFF" opacity="0.6" />
        <circle cx="380" cy="40" r="1" fill="#FFF" opacity="0.5" />
        <circle cx="500" cy="80" r="1.5" fill="#FFF" opacity="0.7" />
        <circle cx="560" cy="160" r="1" fill="#FFF" opacity="0.4" />
        <circle cx="220" cy="60" r="1" fill="#FFF" opacity="0.5" />

        {/* Aura roja general */}
        <circle cx="300" cy="320" r="280" fill="url(#dragon-aura)" />

        {/* Estalactitas / rocas oscuras arriba */}
        <path d="M 0 0 L 0 60 L 30 90 L 60 50 L 100 110 L 140 60 L 180 100 L 220 50 L 260 110 L 300 60 L 340 100 L 380 50 L 420 110 L 460 60 L 500 100 L 540 50 L 600 90 L 600 0 Z" fill="#1A0608" />

        {/* Suelo de cueva */}
        <path d="M 0 540 Q 150 510 300 520 Q 450 510 600 540 L 600 600 L 0 600 Z" fill="#1A0608" />
        <path d="M 0 560 Q 100 540 200 555 Q 350 540 500 560 Q 600 555 600 580 L 600 600 L 0 600 Z" fill="#0A0608" />

        {/* ============== ALAS DETRÁS ============== */}
        {/* Ala izquierda extendida */}
        <g className="dragon-wing-left">
          <path
            d="M 220 230
               Q 110 180, 60 250
               Q 50 290, 90 320
               Q 130 280, 180 290
               Q 160 320, 130 350
               Q 180 320, 210 300
               Z"
            fill="url(#dragon-wing)"
            stroke="#1A0303"
            strokeWidth="2"
          />
          {/* Costillas del ala */}
          <path d="M 220 230 Q 150 230 90 295" fill="none" stroke="#3A0808" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 220 240 Q 170 260 140 310" fill="none" stroke="#3A0808" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Ala derecha extendida */}
        <g className="dragon-wing-right">
          <path
            d="M 380 230
               Q 490 180, 540 250
               Q 550 290, 510 320
               Q 470 280, 420 290
               Q 440 320, 470 350
               Q 420 320, 390 300
               Z"
            fill="url(#dragon-wing)"
            stroke="#1A0303"
            strokeWidth="2"
          />
          <path d="M 380 230 Q 450 230 510 295" fill="none" stroke="#3A0808" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 380 240 Q 430 260 460 310" fill="none" stroke="#3A0808" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* ============== CUERPO ============== */}
        <g className="dragon-body">
          {/* Cuerpo principal: torso masivo */}
          <ellipse cx="300" cy="380" rx="120" ry="95" fill="url(#dragon-body)" />

          {/* Vientre con escamas */}
          <ellipse cx="300" cy="420" rx="80" ry="55" fill="url(#dragon-belly)" />
          <path d="M 240 410 Q 300 430 360 410 M 245 430 Q 300 450 355 430 M 255 450 Q 300 465 345 450" stroke="#7A1F0A" strokeWidth="1.5" fill="none" />

          {/* Cola */}
          <path
            d="M 400 400
               Q 480 420, 530 450
               Q 555 470, 570 480
               L 580 470
               L 555 440
               Z"
            fill="url(#dragon-body)"
          />
          {/* Punta de cola en pico */}
          <path
            d="M 555 440 L 595 425 L 580 470 L 555 460 Z"
            fill="#3A0808"
          />

          {/* Patas delanteras */}
          <path d="M 230 440 Q 215 470 220 500 L 255 510 L 255 490 L 250 470 Z" fill="url(#dragon-body)" />
          <path d="M 370 440 Q 385 470 380 500 L 345 510 L 345 490 L 350 470 Z" fill="url(#dragon-body)" />
          {/* Garras */}
          <path d="M 217 510 L 213 520 L 222 515 Z M 226 510 L 224 522 L 232 515 Z M 235 510 L 237 522 L 244 515 Z" fill="#1A0303" />
          <path d="M 383 510 L 387 520 L 378 515 Z M 374 510 L 376 522 L 368 515 Z M 365 510 L 363 522 L 356 515 Z" fill="#1A0303" />

          {/* Picos / espinas dorsales */}
          <path d="M 210 320 L 220 300 L 230 320 Z" fill="#3A0808" />
          <path d="M 235 305 L 245 280 L 255 305 Z" fill="#3A0808" />
          <path d="M 260 295 L 270 268 L 280 295 Z" fill="#3A0808" />
          <path d="M 285 290 L 295 260 L 305 290 Z" fill="#3A0808" />
          <path d="M 310 295 L 320 268 L 330 295 Z" fill="#3A0808" />
          <path d="M 335 305 L 345 280 L 355 305 Z" fill="#3A0808" />
          <path d="M 360 320 L 370 300 L 380 320 Z" fill="#3A0808" />

          {/* Detalles de escamas en el lomo */}
          <path d="M 230 360 Q 240 370 230 380 M 250 355 Q 260 365 250 375 M 270 350 Q 280 360 270 370 M 290 348 Q 300 358 290 368 M 310 348 Q 320 358 310 368 M 330 350 Q 340 360 330 370 M 350 355 Q 360 365 350 375 M 370 360 Q 380 370 370 380" stroke="#3A0808" strokeWidth="1.5" fill="none" />
        </g>

        {/* ============== CUELLO ============== */}
        <g className="dragon-neck">
          <path
            d="M 280 310
               Q 250 240, 230 180
               Q 240 150, 280 145
               L 360 150
               Q 380 180, 360 250
               Q 340 290, 320 310
               Z"
            fill="url(#dragon-body)"
          />
          {/* Detalles del cuello */}
          <path d="M 245 200 Q 270 220 295 235" stroke="#3A0808" strokeWidth="1.5" fill="none" />
          <path d="M 250 230 Q 280 245 310 260" stroke="#3A0808" strokeWidth="1.5" fill="none" />
        </g>

        {/* ============== CABEZA ============== */}
        <g className="dragon-head">
          {/* Cráneo masivo */}
          <path
            d="M 200 150
               Q 180 110, 220 80
               Q 270 60, 320 75
               L 380 100
               Q 410 130, 400 170
               Q 380 195, 340 200
               L 290 195
               Q 220 195, 200 170
               Z"
            fill="url(#dragon-body)"
          />

          {/* Mandíbula superior (sale por la derecha hacia las fauces) */}
          <path
            d="M 380 130
               L 470 120
               Q 490 130, 485 155
               L 460 165
               L 380 160
               Z"
            fill="url(#dragon-scales)"
          />

          {/* Mandíbula inferior abierta */}
          <path
            d="M 380 175
               L 460 195
               Q 480 205, 475 225
               L 440 230
               L 380 210
               Z"
            fill="url(#dragon-body)"
          />

          {/* Interior boca (negro/rojo profundo) */}
          <path
            d="M 410 160
               L 465 158
               L 470 195
               L 425 210
               Z"
            fill="#1A0303"
          />

          {/* Dientes superiores */}
          <polygon points="420,170 422,184 416,170" fill="#FFFDE7" />
          <polygon points="430,168 432,186 425,168" fill="#FFFDE7" />
          <polygon points="442,167 444,188 436,167" fill="#FFFDE7" />
          <polygon points="455,166 457,186 449,166" fill="#FFFDE7" />
          {/* Dientes inferiores */}
          <polygon points="420,195 418,180 425,180" fill="#FFFDE7" />
          <polygon points="435,200 433,184 440,184" fill="#FFFDE7" />
          <polygon points="450,202 448,186 455,186" fill="#FFFDE7" />

          {/* CUERNOS ENORMES */}
          <path
            d="M 235 100
               Q 220 50, 200 30
               Q 215 40, 235 60
               Q 245 80, 250 100
               Z"
            fill="#1A0303"
            stroke="#3A0808"
            strokeWidth="1.5"
          />
          <path
            d="M 300 90
               Q 295 40, 285 15
               Q 305 30, 315 60
               Q 318 80, 320 100
               Z"
            fill="#1A0303"
            stroke="#3A0808"
            strokeWidth="1.5"
          />
          <path
            d="M 360 100
               Q 380 60, 400 40
               Q 390 65, 380 90
               Q 375 100, 370 110
               Z"
            fill="#1A0303"
            stroke="#3A0808"
            strokeWidth="1.5"
          />

          {/* OJOS amarillos brillantes */}
          <g filter="url(#eye-glow)">
            <ellipse cx="265" cy="135" rx="14" ry="11" fill="url(#dragon-eye)" />
            <ellipse cx="345" cy="135" rx="14" ry="11" fill="url(#dragon-eye)" />
            {/* Pupilas verticales */}
            <ellipse cx="265" cy="135" rx="3" ry="9" fill="#1A0303" />
            <ellipse cx="345" cy="135" rx="3" ry="9" fill="#1A0303" />
            {/* Highlight */}
            <circle cx="268" cy="131" r="2" fill="#FFFDE7" />
            <circle cx="348" cy="131" r="2" fill="#FFFDE7" />
          </g>

          {/* Cejas furiosas */}
          <path d="M 240 115 L 285 122 L 280 110 Q 260 105 240 115 Z" fill="#1A0303" />
          <path d="M 325 122 L 370 115 Q 350 105 330 110 Z" fill="#1A0303" />

          {/* Fosas nasales humeantes */}
          <ellipse cx="400" cy="140" rx="4" ry="6" fill="#1A0303" />
          <ellipse cx="395" cy="155" rx="4" ry="5" fill="#1A0303" />
        </g>

        {/* ============== LLAMARADA SALIENDO DE LA BOCA ============== */}
        <g className="dragon-fire" filter="url(#fire-glow)">
          <path
            d="M 470 180
               Q 540 160, 580 175
               Q 595 180, 590 195
               Q 565 200, 540 195
               Q 560 210, 590 215
               Q 595 220, 585 225
               Q 555 225, 530 215
               Q 545 230, 575 240
               Q 580 245, 565 250
               Q 530 245, 500 230
               Q 490 215, 470 200
               Z"
            fill="url(#dragon-fire)"
          />
          {/* Chispas individuales */}
          <circle cx="595" cy="190" r="3" fill="#FFEB3B" opacity="0.9" />
          <circle cx="585" cy="210" r="2.5" fill="#FFB74D" opacity="0.85" />
          <circle cx="570" cy="245" r="2" fill="#FF6B35" opacity="0.8" />
          <circle cx="555" cy="180" r="2" fill="#FFEB3B" opacity="0.9" />
        </g>

        {/* ============== BRASAS FLOTANTES ============== */}
        <g className="dragon-embers">
          <circle cx="100" cy="200" r="2.5" fill="#FF6B35" opacity="0.6" />
          <circle cx="150" cy="270" r="1.8" fill="#FFB74D" opacity="0.65" />
          <circle cx="500" cy="350" r="2" fill="#FF6B35" opacity="0.55" />
          <circle cx="460" cy="420" r="1.5" fill="#FFEB3B" opacity="0.7" />
          <circle cx="80" cy="380" r="2" fill="#FFB74D" opacity="0.55" />
          <circle cx="540" cy="280" r="1.5" fill="#FF6B35" opacity="0.6" />
          <circle cx="180" cy="450" r="2" fill="#FFEB3B" opacity="0.5" />
        </g>
      </svg>
    </div>
  )
}
