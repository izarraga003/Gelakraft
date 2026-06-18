/**
 * Sistema de avatares por capas (ampliado v2).
 *
 * Cada avatar es una combinación de opciones de 9 capas distintas:
 *   bgColor, skinTone, hairStyle, hairColor, eyes, mouth, outfit, accessory, pet.
 *
 * `pet` es la mascota — relacionada con animales vascos.
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
  pet: string | null
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
      { id: 'galaxia', label: 'Galaxia', unlockLevel: 10 },
      { id: 'arrosaila', label: 'Arrosa lainoa', unlockLevel: 4 },
      { id: 'jadea', label: 'Jadea', unlockLevel: 6 },
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
      { id: 'olive', label: 'Olibondoa', unlockLevel: 1 },
      { id: 'green', label: 'Berde magikoa', unlockLevel: 8 },
      { id: 'blue', label: 'Urdin lamia', unlockLevel: 10 },
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
      { id: 'bald', label: 'Burumotza', unlockLevel: 1 },
      // Extravagantes
      { id: 'mohawk', label: 'Mohikana', unlockLevel: 3 },
      { id: 'twintails', label: 'Bi txirikorda', unlockLevel: 2 },
      { id: 'afro', label: 'Afroa', unlockLevel: 3 },
      { id: 'spiky', label: 'Punka', unlockLevel: 4 },
      { id: 'topknot', label: 'Samurai motoa', unlockLevel: 5 },
      { id: 'dreads', label: 'Errastak', unlockLevel: 5 },
      { id: 'braids', label: 'Txirikorda luzeak', unlockLevel: 3 },
      { id: 'double_bun', label: 'Bi motots', unlockLevel: 4 },
      { id: 'fire_mohawk', label: 'Su-mohikana', unlockLevel: 8 },
      { id: 'flame', label: 'Sugar adatsa', unlockLevel: 9 },
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
      { id: 'pink', label: 'Arrosa', unlockLevel: 3 },
      { id: 'blue', label: 'Urdina', unlockLevel: 3 },
      { id: 'green', label: 'Berdea', unlockLevel: 4 },
      { id: 'silver', label: 'Zilarra', unlockLevel: 5 },
      { id: 'purple', label: 'Morea', unlockLevel: 6 },
      { id: 'magic', label: 'Magikoa', unlockLevel: 7 },
      { id: 'fire', label: 'Sugarra', unlockLevel: 9 },
    ],
  },
  {
    key: 'eyes',
    label: 'Begiak',
    options: [
      { id: 'default', label: 'Normalak', unlockLevel: 1 },
      { id: 'wide', label: 'Zabalak', unlockLevel: 1 },
      { id: 'cheerful', label: 'Alaiak', unlockLevel: 1 },
      { id: 'wink', label: 'Keinua', unlockLevel: 2 },
      { id: 'serious', label: 'Serioak', unlockLevel: 3 },
      { id: 'star', label: 'Izar begiak', unlockLevel: 5 },
      { id: 'heart', label: 'Bihotz begiak', unlockLevel: 6 },
      { id: 'glow', label: 'Distiratsuak', unlockLevel: 7 },
      { id: 'fire', label: 'Sugar begiak', unlockLevel: 9 },
    ],
  },
  {
    key: 'mouth',
    label: 'Ahoa',
    options: [
      { id: 'smile', label: 'Irribarrea', unlockLevel: 1 },
      { id: 'neutral', label: 'Neutroa', unlockLevel: 1 },
      { id: 'open', label: 'Zabaldua', unlockLevel: 1 },
      { id: 'smirk', label: 'Irri maltzurra', unlockLevel: 2 },
      { id: 'tongue', label: 'Mihia', unlockLevel: 2 },
      { id: 'fangs', label: 'Letaginak', unlockLevel: 5 },
      { id: 'mustache', label: 'Bibotea', unlockLevel: 4 },
    ],
  },
  {
    key: 'outfit',
    label: 'Jantzia',
    options: [
      { id: 'tunic', label: 'Tunika', unlockLevel: 1 },
      { id: 'vest', label: 'Txalekoa', unlockLevel: 1 },
      { id: 'robe', label: 'Soineko luzea', unlockLevel: 1 },
      { id: 'hoodie', label: 'Kapuxa-jertsea', unlockLevel: 2 },
      { id: 'sorgina', label: 'Sorgina jantzia', unlockLevel: 3 },
      { id: 'jentila', label: 'Jentila jantzia', unlockLevel: 3 },
      { id: 'lamia', label: 'Lamia jantzia', unlockLevel: 3 },
      { id: 'lightning', label: 'Tximista kamiseta', unlockLevel: 3 },
      { id: 'kimono', label: 'Kimonoa', unlockLevel: 4 },
      { id: 'armor', label: 'Burdinazko jantzia', unlockLevel: 6 },
      { id: 'gold_armor', label: 'Urrezko armadura', unlockLevel: 9 },
      { id: 'cape', label: 'Kapa heroia', unlockLevel: 8 },
      { id: 'wizard', label: 'Aztiaren soinekoa', unlockLevel: 7 },
    ],
  },
  {
    key: 'accessory',
    label: 'Osagarria',
    optional: true,
    options: [
      { id: 'none', label: 'Bat ere ez', unlockLevel: 1 },
      { id: 'flower', label: 'Lorea', unlockLevel: 1 },
      { id: 'glasses', label: 'Betaurrekoak', unlockLevel: 1 },
      { id: 'sunglasses', label: 'Eguzki betaurrekoak', unlockLevel: 3 },
      { id: 'hat', label: 'Kapela', unlockLevel: 2 },
      { id: 'hood', label: 'Kapuxa', unlockLevel: 3 },
      { id: 'headphones', label: 'Entzungailuak', unlockLevel: 3 },
      { id: 'bandana', label: 'Buruzapia', unlockLevel: 4 },
      { id: 'wand', label: 'Makila', unlockLevel: 5 },
      { id: 'crown', label: 'Koroa', unlockLevel: 7 },
      { id: 'horns', label: 'Adarrak', unlockLevel: 8 },
      { id: 'halo', label: 'Aureola', unlockLevel: 10 },
    ],
  },
  {
    key: 'pet',
    label: 'Maskota',
    optional: true,
    options: [
      { id: 'none', label: 'Bat ere ez', unlockLevel: 1 },
      { id: 'tximeleta', label: 'Tximeleta', unlockLevel: 1 },
      { id: 'triku', label: 'Triku', unlockLevel: 2 },
      { id: 'azeria', label: 'Azeria', unlockLevel: 3 },
      { id: 'hontza', label: 'Hontza', unlockLevel: 4 },
      { id: 'ahuntza', label: 'Ahuntza', unlockLevel: 5 },
      { id: 'otsoa', label: 'Otsoa', unlockLevel: 6 },
      { id: 'arranoa', label: 'Arranoa', unlockLevel: 7 },
      { id: 'pottoka', label: 'Pottoka', unlockLevel: 8 },
      { id: 'hartza', label: 'Hartza', unlockLevel: 10 },
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
  pet: null,
}

export function defaultAvatarConfig(): AvatarConfig {
  return { ...DEFAULT_CONFIG }
}

export function randomAvatarConfig(): AvatarConfig {
  function pick(category: keyof AvatarConfig): string {
    const cat = AVATAR_CATEGORIES.find((c) => c.key === category)
    if (!cat) return (DEFAULT_CONFIG[category] as string) ?? ''
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
    pet: null,
  }
}

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

export function sanitizeAvatarConfig(
  raw: Partial<AvatarConfig> | null | undefined,
  level: number = 99
): AvatarConfig {
  const result: AvatarConfig = { ...DEFAULT_CONFIG }
  for (const cat of AVATAR_CATEGORIES) {
    const incoming = raw?.[cat.key] as string | null | undefined
    if (cat.optional) {
      if (
        incoming &&
        cat.options.some((o) => o.id === incoming && o.unlockLevel <= level)
      ) {
        ;(result as Record<string, string | null>)[cat.key] =
          incoming === 'none' ? null : incoming
      } else {
        ;(result as Record<string, string | null>)[cat.key] = null
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
