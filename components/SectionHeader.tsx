import type { ReactNode } from 'react'

type SectionHeaderProps = {
  eyebrow: string
  /** Puede incluir JSX (con <span className="accent">, <br/>, etc.) */
  title: ReactNode
  subtitle?: ReactNode
  /** Si la sección tiene fondo oscuro, usamos otra paleta para los textos */
  onDark?: boolean
}

/**
 * Cabecera reutilizable que aparece al inicio de cada sección:
 * - Eyebrow pequeño en mayúsculas
 * - Título grande en Fraunces
 * - Subtítulo opcional
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  onDark = false,
}: SectionHeaderProps) {
  return (
    <header className="section-header">
      <div className={`section-eyebrow${onDark ? ' on-dark' : ''}`}>{eyebrow}</div>
      <h2 className={onDark ? 'section-title-dark' : 'section-title'}>{title}</h2>
      {subtitle && (
        <p className={onDark ? 'section-sub-dark' : 'section-sub'}>{subtitle}</p>
      )}
    </header>
  )
}
