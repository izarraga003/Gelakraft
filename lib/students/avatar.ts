/**
 * Sistema de avatares por capas.
 *
 * Cada avatar es una combinación de opciones de 7 capas distintas:
 *   bgColor, skinTone, hairStyle, hairColor, eyes, mouth, outfit, accessory.
 *
 * Cada opción tiene un nivel de desbloqueo (`unlockLevel`). Las opciones
 * con nivel mayor al del alumno aparecen bloqueadas con un candado.
 */

export type AvatarConfig = {
  bgColor: string
  skinTone: string
  hairStyle: string
  hairColor: string
  eyes: string
  mouth: string
  outfit: string
  accessory: string | null
}

export type AvatarOption = {
  id: string
  label: string
  unlockLevel: number
}

export type AvatarCategory = {
  key: keyof AvatarConfig
  label: string
  options: AvatarOption[]
  /** Si true, permite la opción "ninguno" (null) */
  optional?: boolean
}

// ============================================================
// CATÁLOGO COMPLETO
// ============================================================

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    key: 'bgColor',
    label: 'Atzealdea',
    options: [
      { id: 'urrea', label: 'Urre', unlockLevel: 1 },
      { id: 'sutea', label: 'Sutea', unlockLevel: 1 },
      { id: 'iluntze', label: 'Iluntzea', unlockLevel: 1 },
      { id: 'pago', label: 'Pago hostoa', unlockLevel: 1 },
      { id: 'lamia', label: 'Lamia ura', unlockLevel: 2 },
      { id: 'sorgina', label: 'Sorgina', unlockLevel: 3 },
      { id: 'ekaitza', label: 'Ekaitza', unlockLevel: 5 },
      { id: 'argia', label: 'Argia', unlockLevel: 8 },
    ],
  },
  {
    key: 'skinTone',
    label: 'Larruazala',
    options: [
      { id: 'light', label: 'Argia', unlockLevel: 1 },
      { id: 'medium', label: 'Ertaina', unlockLevel: 1 },
      { id: 'tan', label: 'Beltzarana', unlockLevel: 1 },
      { id: 'dark', label: 'Iluna', unlockLevel: 1 },
    ],
  },
  {
    key: 'hairStyle',
    label: 'Ile estiloa',
    options: [
      { id: 'short', label: 'Laburra', unlockLevel: 1 },
      { id: 'wavy', label: 'Uhindua', unlockLevel: 1 },
      { id: 'long', label: 'Luzea', unlockLevel: 1 },
      { id: 'bun', label: 'Mototsa', unlockLevel: 2 },
      { id: 'curly', label: 'Kizkurra', unlockLevel: 2 },
      { id: 'mohawk', label: 'Mohikana', unlockLevel: 4 },
      { id: 'bald', label: 'Burumotza', unlockLevel: 1 },
    ],
  },
  {
    key: 'hairColor',
    label: 'Ile kolorea',
    options: [
      { id: 'black', label: 'Beltza', unlockLevel: 1 },
      { id: 'brown', label: 'Marroia', unlockLevel: 1 },
      { id: 'blonde', label: 'Horia', unlockLevel: 1 },
      { id: 'red', label: 'Gorria', unlockLevel: 1 },
      { id: 'grey', label: 'Grisa', unlockLevel: 1 },
      { id: 'silver', label: 'Zilarra', unlockLevel: 5 },
      { id: 'magic', label: 'Magikoa', unlockLevel: 7 },
    ],
  },
  {
    key: 'eyes',
    label: 'Begiak',
    options: [
      { id: 'default', label: 'Normalak', unlockLevel: 1 },
      { id: 'wide', label: 'Zabalak', unlockLevel: 1 },
      { id: 'cheerful', label: 'Alaiak', unlockLevel: 1 },
      { id: 'serious', label: 'Serioak', unlockLevel: 3 },
      { id: 'glow', label: 'Distiratsuak', unlockLevel: 7 },
    ],
  },
  {
    key: 'mouth',
    label: 'Ahoa',
    options: [
      { id: 'smile', label: 'Irribarrea', unlockLevel: 1 },
      { id: 'neutral', label: 'Neutroa', unlockLevel: 1 },
      { id: 'open', label: 'Zabaldua', unlockLevel: 1 },
      { id: 'smirk', label: 'Irri maltzurra', unlockLevel: 4 },
    ],
  },
  {
    key: 'outfit',
    label: 'Jantzia',
    options: [
      { id: 'tunic', label: 'Tunika', unlockLevel: 1 },
      { id: 'vest', label: 'Txalekoa', unlockLevel: 1 },
      { id: 'robe', label: 'Soineko luzea', unlockLevel: 1 },
      { id: 'sorgina', label: 'Sorgina jantzia', unlockLevel: 3 },
      { id: 'jentila', label: 'Jentila jantzia', unlockLevel: 3 },
      { id: 'lamia', label: 'Lamia jantzia', unlockLevel: 3 },
      { id: 'armor', label: 'Burdinazko jantzia', unlockLevel: 6 },
      { id: 'cape', label: 'Kapa heroia', unlockLevel: 8 },
    ],
  },
  {
    key: 'accessory',
    label: 'Osagarria',
    optional: true,
    options: [
      { id: 'none', label: 'Bat ere ez', unlockLevel: 1 },
      { id: 'flower', label: 'Lorea', unlockLevel: 2 },
      { id: 'hat', label: 'Kapela', unlockLevel: 3 },
      { id: 'hood', label: 'Kapuxa', unlockLevel: 4 },
      { id: 'wand', label: 'Makila', unlockLevel: 5 },
      { id: 'crown', label: 'Koroa', unlockLevel: 7 },
      { id: 'horns', label: 'Adarrak', unlockLevel: 9 },
    ],
  },
]

// ============================================================
// HELPERS
// ============================================================

const DEFAULT_CONFIG: AvatarConfig = {
  bgColor: 'urrea',
  skinTone: 'medium',
  hairStyle: 'short',
  hairColor: 'brown',
  eyes: 'default',
  mouth: 'smile',
  outfit: 'tunic',
  accessory: null,
}

export function defaultAvatarConfig(): AvatarConfig {
  return { ...DEFAULT_CONFIG }
}

export function randomAvatarConfig(): AvatarConfig {
  function pick(category: keyof AvatarConfig): string {
    const cat = AVATAR_CATEGORIES.find((c) => c.key === category)
    if (!cat) return DEFAULT_CONFIG[category] ?? ''
    const unlocked = cat.options.filter((o) => o.unlockLevel === 1)
    return unlocked[Math.floor(Math.random() * unlocked.length)].id
  }

  return {
    bgColor: pick('bgColor'),
    skinTone: pick('skinTone'),
    hairStyle: pick('hairStyle'),
    hairColor: pick('hairColor'),
    eyes: pick('eyes'),
    mouth: pick('mouth'),
    outfit: pick('outfit'),
    accessory: null,
  }
}

/** Devuelve si una opción está desbloqueada para un nivel concreto */
export function isOptionUnlocked(
  category: keyof AvatarConfig,
  optionId: string,
  level: number
): boolean {
  const cat = AVATAR_CATEGORIES.find((c) => c.key === category)
  if (!cat) return true
  const opt = cat.options.find((o) => o.id === optionId)
  if (!opt) return true
  return opt.unlockLevel <= level
}

/**
 * Sanea un config para asegurarse de que todas las opciones existen
 * y están desbloqueadas. Si no, las reemplaza por las primeras válidas.
 */
export function sanitizeAvatarConfig(
  raw: Partial<AvatarConfig> | null | undefined,
  level: number = 99
): AvatarConfig {
  const result: AvatarConfig = { ...DEFAULT_CONFIG }
  for (const cat of AVATAR_CATEGORIES) {
    const incoming = raw?.[cat.key] as string | null | undefined
    if (cat.key === 'accessory') {
      if (
        incoming &&
        cat.options.some((o) => o.id === incoming && o.unlockLevel <= level)
      ) {
        result.accessory = incoming === 'none' ? null : incoming
      } else {
        result.accessory = null
      }
      continue
    }
    if (
      incoming &&
      cat.options.some((o) => o.id === incoming && o.unlockLevel <= level)
    ) {
      ;(result as Record<string, string | null>)[cat.key] = incoming
    } else {
      const fallback = cat.options.find((o) => o.unlockLevel === 1)
      ;(result as Record<string, string | null>)[cat.key] = fallback?.id ?? ''
    }
  }
  return result
}
