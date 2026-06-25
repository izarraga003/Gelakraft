/**
 * Spinner inline para mostrar dentro de botones en estado loading.
 * Tamaño se adapta al fontSize del padre con `em`.
 */
export default function Spinner({
  size = '1em',
  className = '',
}: {
  size?: string
  className?: string
}) {
  return (
    <span
      className={`inline-spinner ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  )
}
