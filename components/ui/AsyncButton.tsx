'use client'

import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import Spinner from './Spinner'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  /** onClick async — el botón muestra spinner mientras la promesa esté pendiente */
  onClick?: () => void | Promise<void>
  children?: ReactNode
  /** Si está true, muestra spinner aunque la promesa interna no esté pendiente */
  loading?: boolean
}

/**
 * Botón que muestra spinner mientras su onClick async esté ejecutándose.
 * El estado loading interno se gestiona automáticamente; opcionalmente se
 * puede forzar desde fuera con la prop `loading`.
 */
export default function AsyncButton({
  onClick,
  children,
  loading: externalLoading,
  disabled,
  ...rest
}: Props) {
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = externalLoading || internalLoading

  async function handleClick() {
    if (!onClick) return
    setInternalLoading(true)
    try {
      await onClick()
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      onClick={handleClick}
    >
      {isLoading ? (
        <span className="async-button-loading">
          <Spinner />
        </span>
      ) : (
        children
      )}
    </button>
  )
}
