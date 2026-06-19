import Image from 'next/image'

/**
 * Sugaar: dragón de fuego mostrado mediante la ilustración generada por IA.
 *
 * Las animaciones se aplican mediante CSS sobre el contenedor (.sugaar-art)
 * según la prop `animation`:
 *  - 'idle'     → respiración suave (escala + ligero glow)
 *  - 'hit'      → sacudida horizontal
 *  - 'crit'     → flash dorado + sacudida fuerte
 *  - 'miss'     → la imagen se desliza (esquiva)
 *  - 'attack'   → flash rojo en bordes
 *  - 'defeated' → opacidad baja + escala de grises
 */

type SugaarArtProps = {
  animation: 'idle' | 'hit' | 'crit' | 'miss' | 'attack' | 'defeated'
}

export default function SugaarArt({ animation }: SugaarArtProps) {
  return (
    <div className={`sugaar-art sugaar-${animation}`} aria-hidden="true">
      <div className="sugaar-image-frame">
        <Image
          src="/sugaar-boss.png"
          alt="Sugaar, the fire dragon"
          width={600}
          height={600}
          priority
          className="sugaar-image"
          sizes="(max-width: 700px) 320px, 600px"
        />
        <div className="sugaar-image-vignette" aria-hidden="true" />
      </div>
    </div>
  )
}
