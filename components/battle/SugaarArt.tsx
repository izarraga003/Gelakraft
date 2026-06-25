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
          {/* Glow rojo cálido para el calor de la boca */}
          <radialGradient id="overlay-mouth-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#C24617" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#C24617" stopOpacity="0" />
          </radialGradient>

          {/* Glow amarillo muy concentrado para reforzar los ojos */}
          <radialGradient id="overlay-eye-spot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFEB3B" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FF8B3A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF8B3A" stopOpacity="0" />
          </radialGradient>

          {/* Humo gris translúcido */}
          <radialGradient id="overlay-smoke" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(120, 80, 70, 0.5)" />
            <stop offset="100%" stopColor="rgba(40, 20, 18, 0)" />
          </radialGradient>

          {/* Blur fuerte para que los glows sean difusos */}
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>

        {/* ============== CALOR EN LA BOCA ==============
            En lugar de dibujar una llama con bordes (que parecía sticker),
            usamos un glow radial difuso con mix-blend-mode: screen para que
            se SUME al color ya existente de la boca abierta en la imagen.
            El interior oscuro de la boca + glow rojizo encima = sensación
            de calor brillante saliendo de dentro. */}
        <g className="sugaar-fire" style={{ mixBlendMode: 'screen' }}>
          {/* Glow principal centrado en la boca */}
          <ellipse
            cx="50"
            cy="51"
            rx="10"
            ry="13"
            fill="url(#overlay-mouth-glow)"
            filter="url(#soft-glow)"
          >
            <animate
              attributeName="rx"
              values="9;11.5;9"
              dur="1.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="ry"
              values="12;14;12"
              dur="1.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.75;1;0.75"
              dur="1.4s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Glow secundario más amplio y tenue (halo de calor) */}
          <ellipse
            cx="50"
            cy="52"
            rx="16"
            ry="20"
            fill="url(#overlay-mouth-glow)"
            opacity="0.35"
            filter="url(#soft-glow)"
          >
            <animate
              attributeName="opacity"
              values="0.25;0.5;0.25"
              dur="2.2s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* ============== GLOW OJOS ==============
            Pequeños puntos de luz muy concentrados con blend screen para
            que parezcan que los ojos brillan "desde dentro" en vez de
            tener una pegatina amarilla encima. */}
        <g className="sugaar-eyes" style={{ mixBlendMode: 'screen' }}>
          <circle cx="38" cy="31" r="1.6" fill="url(#overlay-eye-spot)" filter="url(#soft-glow)">
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="57" cy="31" r="1.6" fill="url(#overlay-eye-spot)" filter="url(#soft-glow)">
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="2.4s"
              begin="0.3s"
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
