/**
 * Catálogo de avatares disponibles para los alumnos.
 * Agrupados en 3 categorías de 10 cada una.
 */

export type AvatarCategory = {
  key: string
  label: string
  emojis: string[]
}

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    key: 'bestiarioa',
    label: 'Bestiarioa',
    emojis: ['🐉', '🦊', '🐺', '🦅', '🦉', '🐴', '🐱', '🐰', '🦋', '🐝'],
  },
  {
    key: 'natura',
    label: 'Natura',
    emojis: ['🌙', '⭐', '🔥', '⚡', '🌊', '🍃', '🌳', '🌺', '🍄', '⛰️'],
  },
  {
    key: 'mistikoa',
    label: 'Mistikoa',
    emojis: ['💎', '🔮', '⚔️', '🛡️', '🪄', '📜', '🗝️', '🏰', '⚱️', '🌀'],
  },
]

export const ALL_AVATARS: string[] = AVATAR_CATEGORIES.flatMap((c) => c.emojis)

export function randomAvatar(): string {
  return ALL_AVATARS[Math.floor(Math.random() * ALL_AVATARS.length)]
}

export function isValidAvatar(avatar: string): boolean {
  return ALL_AVATARS.includes(avatar)
}
