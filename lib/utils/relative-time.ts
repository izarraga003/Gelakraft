/**
 * Devuelve una representación corta y relativa de una fecha en euskera.
 *
 * Ejemplos:
 *   "Orain", "Duela 5 min", "Duela ordubete", "Atzo", "Duela 3 egun",
 *   "Duela aste 1", "Duela 2 hilabete", "Duela urtebete"
 */
export function relativeTimeEu(iso: string): string {
  const date = new Date(iso)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 30) return 'Orain'
  if (diffMin < 1) return `Duela ${diffSec} seg`
  if (diffMin < 60) return `Duela ${diffMin} min`
  if (diffHour < 2) return 'Duela ordubete'
  if (diffHour < 24) return `Duela ${diffHour} ordu`
  if (diffDay < 2) return 'Atzo'
  if (diffDay < 7) return `Duela ${diffDay} egun`
  if (diffWeek < 2) return 'Duela aste 1'
  if (diffWeek < 5) return `Duela ${diffWeek} aste`
  if (diffMonth < 2) return 'Duela hilabete 1'
  if (diffMonth < 12) return `Duela ${diffMonth} hilabete`
  if (diffYear < 2) return 'Duela urtebete'
  return `Duela ${diffYear} urte`
}
