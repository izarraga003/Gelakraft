import { MoonIcon } from './icons'

type LogoProps = {
  /** Tamaño del icono de la luna */
  size?: number
  /** Tamaño del wordmark (px) */
  textSize?: number
  /** Si se debe mostrar el subtítulo (solo lo usamos en piezas grandes, no en navegación) */
  withSubtitle?: boolean
}

/**
 * Logo de GELAKRAFT: luna creciente + wordmark.
 * Se usa en la barra superior y en el footer.
 */
export default function Logo({ size = 32, textSize = 22, withSubtitle = false }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <MoonIcon size={size} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--font-fraunces-stack)',
            fontWeight: 600,
            fontSize: textSize,
            letterSpacing: 2,
            color: 'var(--argi)',
            lineHeight: 1,
          }}
        >
          GELAKRAFT
        </span>
        {withSubtitle && (
          <span
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'var(--urrea-light)',
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            Gamifikazioa euskaraz
          </span>
        )}
      </div>
    </div>
  )
}
