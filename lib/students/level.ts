/**
 * Sistema de niveles del alumno.
 * Curva creciente: cada nivel cuesta más XP que el anterior.
 *
 * Fórmula: level = floor(sqrt(xp / 50)) + 1
 *  - 0 XP → Maila 1
 *  - 50 XP → Maila 2
 *  - 200 XP → Maila 3
 *  - 450 XP → Maila 4
 *  - 800 XP → Maila 5
 *  - 1250 XP → Maila 6
 *  - 1800 XP → Maila 7
 *  - 2450 XP → Maila 8
 *  - 3200 XP → Maila 9
 *  - 4050 XP → Maila 10
 */

const XP_PER_LEVEL_BASE = 50

export function xpToLevel(xp: number): number {
  if (xp < 0) return 1
  return Math.floor(Math.sqrt(xp / XP_PER_LEVEL_BASE)) + 1
}

/** XP requerido para alcanzar un nivel concreto */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return XP_PER_LEVEL_BASE * Math.pow(level - 1, 2)
}

export type LevelProgress = {
  level: number
  /** XP acumulado dentro del nivel actual */
  currentXp: number
  /** XP necesario para subir al siguiente nivel */
  neededXp: number
  /** % completado del nivel actual (0-100) */
  pct: number
  /** Nombre poético del nivel */
  title: string
}

const LEVEL_TITLES = [
  'Hasi berria', // 1
  'Ikaslea',     // 2
  'Ikaslea',     // 3
  'Heroia',      // 4
  'Heroia',      // 5
  'Maisua',      // 6
  'Maisua',      // 7
  'Jakintsua',   // 8
  'Jakintsua',   // 9
  'Anbotoko ahaidea', // 10+
]

export function levelProgress(xp: number): LevelProgress {
  const level = xpToLevel(xp)
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const currentXp = xp - currentLevelXp
  const neededXp = nextLevelXp - currentLevelXp
  const pct = neededXp > 0 ? Math.min(100, (currentXp / neededXp) * 100) : 0
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
  return { level, currentXp, neededXp, pct, title }
}
