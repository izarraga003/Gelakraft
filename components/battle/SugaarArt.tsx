import Image from 'next/image'

/**
 * Sugaar: ilustración base con capa de efectos SVG animados encima.
 *
 * La imagen (sugaar-boss.png) aporta toda la calidad de la ilustración.
 * El SVG overlay añade el movimiento que la imagen no puede tener:
 *   - Llamarada que sale de la boca (~50%, 50% en el cuadro)
 *   - Glow en los ojos (~38%, 31% y ~57%, 31%)
 *   - Brasas flotantes
 *   - Humo ondulante
 *
 * Las clases CSS (sugaar-hit, sugaar-crit, sugaar-attack, sugaar-defeated)
 * afectan al contenedor entero (imagen + overlay) para las animaciones de
 * combate.
 */

type SugaarArtProps = {
  animation: 'idle' | 'hit' | 'crit' | 'miss' | 'attack' | 'defeated'
}

export default function SugaarArt({ animation }: SugaarArtProps) {
  return (
    <div className={`sugaar-art sugaar-${animation}`} aria-hidden="true">
      <Image
        src="/sugaar-boss.png"
        alt=""
        fill
        priority
        sizes="(max-width: 700px) 95vw, 540px"
        className="sugaar-image"
      />

      {/*
        Overlay SVG con animaciones.
        ViewBox 100x100 + preserveAspectRatio="none" → las coordenadas son
        porcentajes del contenedor, así que se alinean con la imagen sin
        importar el tamaño físico.
      */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="sugaar-overlay"
      >
        <defs>
          {/* Fuego: gradiente radial cálido */}
          <radialGradient id="overlay-fire" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#FFFDE7" />
            <stop offset="15%" stopColor="#FFEB3B" />
            <stop offset="40%" stopColor="#FF8B3A" />
            <stop offset="75%" stopColor="#C24617" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8C1F0A" stopOpacity="0" />
          </radialGradient>

          {/* Glow ojo */}
          <radialGradient id="overlay-eye-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(255, 215, 64, 0.9)" />
            <stop offset="40%" stopColor="rgba(255, 138, 60, 0.45)" />
            <stop offset="100%" stopColor="rgba(255, 138, 60, 0)" />
          </radialGradient>

          {/* Humo gris translúcido */}
          <radialGradient id="overlay-smoke" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(120, 80, 70, 0.5)" />
            <stop offset="100%" stopColor="rgba(40, 20, 18, 0)" />
          </radialGradient>

          {/* Filtros glow */}
          <filter id="overlay-fire-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ============== GLOW OJOS ============== */}
        <g className="sugaar-eyes">
          {/* Ojo izquierdo */}
          <ellipse cx="38" cy="31" rx="4" ry="2.5" fill="url(#overlay-eye-glow)">
            <animate
              attributeName="opacity"
              values="0.5;0.95;0.5"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </ellipse>
          {/* Ojo derecho */}
          <ellipse cx="57" cy="31" rx="4" ry="2.5" fill="url(#overlay-eye-glow)">
            <animate
              attributeName="opacity"
              values="0.5;0.95;0.5"
              dur="2.4s"
              begin="0.2s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* ============== LLAMARADA SALIENDO DE LA BOCA ============== */}
        <g className="sugaar-fire" filter="url(#overlay-fire-glow)">
          {/* Forma principal del fuego: sale del centro de la boca (50, 50)
              hacia abajo y hacia el observador */}
          <path
            d="M 44 47
               Q 41 55, 39 64
               Q 38 72, 42 76
               Q 44 70, 47 67
               Q 46 75, 49 80
               Q 51 76, 51 71
               Q 53 79, 56 78
               Q 56 72, 54 67
               Q 58 73, 61 70
               Q 60 64, 57 60
               Q 62 58, 60 52
               Q 56 49, 50 48
               Z"
            fill="url(#overlay-fire)"
            opacity="0.85"
          >
            <animate
              attributeName="d"
              values="
                M 44 47 Q 41 55, 39 64 Q 38 72, 42 76 Q 44 70, 47 67 Q 46 75, 49 80 Q 51 76, 51 71 Q 53 79, 56 78 Q 56 72, 54 67 Q 58 73, 61 70 Q 60 64, 57 60 Q 62 58, 60 52 Q 56 49, 50 48 Z;
                M 43 47 Q 39 56, 37 67 Q 36 76, 41 80 Q 44 72, 48 68 Q 47 78, 50 84 Q 52 79, 52 73 Q 55 82, 58 81 Q 58 73, 56 68 Q 60 75, 63 72 Q 62 65, 59 60 Q 64 58, 62 51 Q 57 48, 50 48 Z;
                M 44 47 Q 41 55, 39 64 Q 38 72, 42 76 Q 44 70, 47 67 Q 46 75, 49 80 Q 51 76, 51 71 Q 53 79, 56 78 Q 56 72, 54 67 Q 58 73, 61 70 Q 60 64, 57 60 Q 62 58, 60 52 Q 56 49, 50 48 Z
              "
              dur="0.6s"
              repeatCount="indefinite"
            />
          </path>

          {/* Núcleo brillante de la llama */}
          <ellipse cx="50" cy="56" rx="5" ry="3" fill="#FFFDE7" opacity="0.7">
            <animate
              attributeName="opacity"
              values="0.5;0.85;0.5"
              dur="0.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="ry"
              values="3;3.6;3"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Chispas que vuelan desde la boca */}
          <circle cx="44" cy="60" r="0.5" fill="#FFEB3B">
            <animate
              attributeName="cy"
              values="48;75;48"
              dur="1.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values="48;42;48"
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
          <circle cx="55" cy="65" r="0.45" fill="#FFB74D">
            <animate
              attributeName="cy"
              values="48;78;48"
              dur="1.7s"
              begin="0.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values="50;56;50"
              dur="1.7s"
              begin="0.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0;1"
              dur="1.7s"
              begin="0.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="52" cy="70" r="0.6" fill="#FF8B3A">
            <animate
              attributeName="cy"
              values="48;82;48"
              dur="1.2s"
              begin="0.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0;1"
              dur="1.2s"
              begin="0.6s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* ============== BRASAS FLOTANTES (desde el suelo hacia arriba) ============== */}
        <g className="sugaar-embers">
          <circle cx="15" cy="80" r="0.5" fill="#FF8B3A">
            <animate attributeName="cy" from="92" to="20" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.85;0.85;0" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="85" cy="70" r="0.4" fill="#FFD53D">
            <animate attributeName="cy" from="90" to="15" dur="6.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.9;0.9;0" dur="6.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="28" cy="88" r="0.35" fill="#FF6B35">
            <animate attributeName="cy" from="92" to="30" dur="7s" begin="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.9;0.9;0" dur="7s" begin="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="72" cy="85" r="0.45" fill="#FFEB3B">
            <animate attributeName="cy" from="92" to="20" dur="5.5s" begin="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.85;0.85;0" dur="5.5s" begin="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="48" cy="90" r="0.3" fill="#FF8B3A">
            <animate attributeName="cy" from="93" to="25" dur="8s" begin="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.7;0.7;0" dur="8s" begin="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="90" cy="80" r="0.4" fill="#FF6B35">
            <animate attributeName="cy" from="90" to="20" dur="6s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.8;0.8;0" dur="6s" begin="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="18" cy="70" r="0.35" fill="#FFD53D">
            <animate attributeName="cy" from="88" to="10" dur="9s" begin="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.7;0.7;0" dur="9s" begin="4s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ============== HUMO ONDULANTE EN LA BASE ============== */}
        <g className="sugaar-smoke">
          <ellipse cx="25" cy="92" rx="14" ry="3" fill="url(#overlay-smoke)">
            <animate
              attributeName="cx"
              values="25;30;25"
              dur="6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.3;0.6"
              dur="6s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="75" cy="90" rx="16" ry="3.5" fill="url(#overlay-smoke)">
            <animate
              attributeName="cx"
              values="75;70;75"
              dur="7s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.25;0.5"
              dur="7s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
      </svg>
    </div>
  )
}
