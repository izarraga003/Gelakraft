/**
 * Genera un username a partir del nombre completo del alumno.
 *
 * Estrategia:
 *  - "Ane" → "ane"
 *  - "Ane Etxebarria" → "ane.etxebarria"
 *  - "Ane María Etxebarria" → "ane.etxebarria" (primera palabra + última)
 *  - "María de los Ángeles García" → "maria.garcia" (sin tildes, sin "de los")
 *
 * Normaliza: minúsculas, sin tildes/diacríticos, sin caracteres especiales.
 */
export function generateUsername(fullName: string): string {
  const cleaned = fullName
    .normalize('NFD') // separar caracteres y diacríticos
    .replace(/[\u0300-\u036f]/g, '') // quitar diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // quitar todo lo que no sea letra/numero/espacio
    .trim()

  if (!cleaned) {
    return 'ikasle'
  }

  const words = cleaned.split(/\s+/).filter((w) => {
    // Filtrar preposiciones/artículos comunes
    return !['de', 'la', 'el', 'los', 'las', 'del', 'da', 'do', 'do'].includes(w)
  })

  if (words.length === 0) {
    return 'ikasle'
  }
  if (words.length === 1) {
    return words[0]
  }

  // Primera palabra (nombre) + última palabra (apellido principal)
  const firstName = words[0]
  const lastName = words[words.length - 1]
  return `${firstName}.${lastName}`
}

/**
 * Si el username ya está usado en la ikasgela, añade un número incremental.
 *
 * @param baseUsername  Username generado por generateUsername()
 * @param existingUsernames  Lista de usernames ya usados en la ikasgela
 */
export function uniqueUsername(
  baseUsername: string,
  existingUsernames: string[]
): string {
  if (!existingUsernames.includes(baseUsername)) {
    return baseUsername
  }

  let counter = 2
  while (existingUsernames.includes(`${baseUsername}${counter}`)) {
    counter++
  }
  return `${baseUsername}${counter}`
}
