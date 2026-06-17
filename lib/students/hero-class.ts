export type HeroClass = 'sorgina' | 'lamia' | 'jentila'

export const HERO_CLASSES: HeroClass[] = ['sorgina', 'lamia', 'jentila']

export const HERO_CLASS_LABELS: Record<HeroClass, string> = {
  sorgina: 'Sorgina',
  lamia: 'Lamia',
  jentila: 'Jentila',
}

export const HERO_CLASS_DESCRIPTIONS: Record<HeroClass, string> = {
  sorgina: 'Magia · Jakinduria',
  lamia: 'Laguntza · Bihurrikeria',
  jentila: 'Indarra · Eraikuntza',
}

/** Asigna una clase aleatoria. */
export function randomHeroClass(): HeroClass {
  return HERO_CLASSES[Math.floor(Math.random() * HERO_CLASSES.length)]
}
