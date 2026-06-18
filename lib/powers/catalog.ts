/**
 * Catálogo de poderes por clase de héroe.
 * Inspirado en el sistema de Classmana (Guardián / Sanador / Mago)
 * y adaptado a Sorgina / Lamia / Jentila.
 *
 * Cada poder tiene:
 *  - id: identificador único estable (no cambiar nunca, se referencia desde BD)
 *  - name: nombre legible en euskera
 *  - description: qué hace
 *  - levelRequired: nivel mínimo del alumno para desbloquearlo
 *  - manaCost: cuántos puntos de mana cuesta usarlo
 *  - collaborative: si afecta a miembros del equipo (true) o solo al alumno (false)
 */

import type { HeroClass } from '@/lib/students/hero-class'

export type Power = {
  id: string
  name: string
  description: string
  levelRequired: number
  manaCost: number
  collaborative: boolean
  icon: string
}

export const POWERS_BY_CLASS: Record<HeroClass, Power[]> = {
  // ============================================================
  // SORGINA (Magia / Sabiduría) ≈ Mago
  // ============================================================
  sorgina: [
    {
      id: 'sorgina-argi-uhina',
      name: 'Argi-uhina',
      description: 'Taldeko kide guztiek (zu izan ezik) mana 1 jasoko dute.',
      levelRequired: 2,
      manaCost: 4,
      collaborative: true,
      icon: '✨',
    },
    {
      id: 'sorgina-fede-jauzia',
      name: 'Fede-jauzia',
      description: 'Ariketa baterako 12 ordu osagarri lortuko dituzu.',
      levelRequired: 5,
      manaCost: 2,
      collaborative: false,
      icon: '🌌',
    },
    {
      id: 'sorgina-babesa',
      name: 'Babesa',
      description: 'Ezkutu bat lortuko duzu, hurrengo bihotz galera ekiditeko.',
      levelRequired: 9,
      manaCost: 1,
      collaborative: false,
      icon: '🛡️',
    },
    {
      id: 'sorgina-egun-bat-gehiago',
      name: 'Egun bat gehiago',
      description: 'Talde osoarentzat egun osagarri bat ariketa baterako.',
      levelRequired: 13,
      manaCost: 3,
      collaborative: true,
      icon: '🌙',
    },
    {
      id: 'sorgina-patu-maltzurra',
      name: 'Patu maltzurra',
      description: 'Taldekide bati ausazko opari bat egokituko zaio.',
      levelRequired: 17,
      manaCost: 2,
      collaborative: true,
      icon: '🎲',
    },
    {
      id: 'sorgina-ki-intuizioa',
      name: 'Kiren intuizioa',
      description: 'Taldekideek egun osagarri bat ariketa baterako.',
      levelRequired: 23,
      manaCost: 5,
      collaborative: true,
      icon: '👁️',
    },
    {
      id: 'sorgina-mana-eztanda',
      name: 'Mana-eztanda',
      description: 'Taldekide bati mana guztia berreskuratuko zaio.',
      levelRequired: 29,
      manaCost: 4,
      collaborative: true,
      icon: '💥',
    },
    {
      id: 'sorgina-funtsezko-fusioa',
      name: 'Funtsezko fusioa',
      description: 'XP gehigarria talde osoarentzat.',
      levelRequired: 40,
      manaCost: 6,
      collaborative: true,
      icon: '🔮',
    },
  ],

  // ============================================================
  // LAMIA (Curación / Agua) ≈ Sanador
  // ============================================================
  lamia: [
    {
      id: 'lamia-sendaketa-1',
      name: 'Sendaketa 1',
      description: 'Taldekide batek +2 bihotz jasoko ditu.',
      levelRequired: 2,
      manaCost: 1,
      collaborative: true,
      icon: '💧',
    },
    {
      id: 'lamia-atseden',
      name: 'Atseden hartu',
      description: '10 minutuko atsedenaldia indarrak berreskuratzeko.',
      levelRequired: 5,
      manaCost: 2,
      collaborative: false,
      icon: '☁️',
    },
    {
      id: 'lamia-iraupen-espiritua',
      name: 'Iraupen espiritua',
      description: 'Hurrengo bihotz galera batetik salbatuko zara, bihotz 1 mantenduz.',
      levelRequired: 9,
      manaCost: 3,
      collaborative: true,
      icon: '🌊',
    },
    {
      id: 'lamia-lasaitasuna',
      name: 'Lasaitasuna',
      description: '10 minutuko atsedenaldia talde osoarentzat.',
      levelRequired: 13,
      manaCost: 4,
      collaborative: true,
      icon: '🍃',
    },
    {
      id: 'lamia-sendaketa-2',
      name: 'Sendaketa 2',
      description: 'Taldekide batek +5 bihotz jasoko ditu.',
      levelRequired: 17,
      manaCost: 2,
      collaborative: true,
      icon: '💙',
    },
    {
      id: 'lamia-sendaketa-zirkulua',
      name: 'Sendaketa zirkulua',
      description: 'Taldekide guztiek (zu izan ezik) +3 bihotz.',
      levelRequired: 23,
      manaCost: 4,
      collaborative: true,
      icon: '🌀',
    },
    {
      id: 'lamia-sendaketa-3',
      name: 'Sendaketa 3',
      description: 'Taldekide batek +9 bihotz jasoko ditu.',
      levelRequired: 29,
      manaCost: 3,
      collaborative: true,
      icon: '💎',
    },
    {
      id: 'lamia-arimen-aliantza',
      name: 'Arimen aliantza',
      description: '20 minutuko atsedenaldia talde osoari.',
      levelRequired: 40,
      manaCost: 6,
      collaborative: true,
      icon: '🌟',
    },
  ],

  // ============================================================
  // JENTILA (Fuerza / Protección) ≈ Guardián
  // ============================================================
  jentila: [
    {
      id: 'jentila-babesa-1',
      name: 'Babesa 1',
      description: 'Norberari edo taldekide bati 2 ezkutu emango dizkio, bihotz galera bakoitzeko bat.',
      levelRequired: 2,
      manaCost: 1,
      collaborative: true,
      icon: '🛡️',
    },
    {
      id: 'jentila-bizitsu',
      name: 'Bizitsu',
      description: '12 ordu osagarri ariketa baterako.',
      levelRequired: 5,
      manaCost: 2,
      collaborative: false,
      icon: '⏳',
    },
    {
      id: 'jentila-osakidetza',
      name: 'Osakidetza',
      description: 'Bihotz 1 gehigarri eta 1 gehigarri 5 mailatik behin (gehienez 5 bihotz osagarri).',
      levelRequired: 9,
      manaCost: 1,
      collaborative: false,
      icon: '❤️',
    },
    {
      id: 'jentila-egun-bat',
      name: 'Egun bat gehiago!',
      description: 'Egun osagarri bat lan baterako entregatzeko.',
      levelRequired: 13,
      manaCost: 3,
      collaborative: false,
      icon: '📅',
    },
    {
      id: 'jentila-babesa-2',
      name: 'Babesa 2',
      description: 'Norberari edo taldekide bati 4 ezkutu emango dizkio.',
      levelRequired: 17,
      manaCost: 2,
      collaborative: true,
      icon: '🛡️',
    },
    {
      id: 'jentila-kamuflajea',
      name: 'Kamuflajea',
      description: 'Taldekide guztiek egun osagarri bat lortuko dute ariketa baterako.',
      levelRequired: 23,
      manaCost: 5,
      collaborative: true,
      icon: '🌲',
    },
    {
      id: 'jentila-denak-babestu',
      name: 'Denak babestu',
      description: 'Talde guztiari (zu izan ezik) 2 ezkutu, bihotz galerak ekiditeko.',
      levelRequired: 29,
      manaCost: 3,
      collaborative: true,
      icon: '🏰',
    },
    {
      id: 'jentila-naturarekin',
      name: 'Naturarekin bat',
      description: 'Talde guztiari laguntza handia ariketa edo erronka baterako.',
      levelRequired: 40,
      manaCost: 6,
      collaborative: true,
      icon: '⛰️',
    },
  ],
}

/**
 * Devuelve todos los poderes de una clase, ordenados por nivel.
 */
export function getPowersForClass(heroClass: HeroClass): Power[] {
  return POWERS_BY_CLASS[heroClass] ?? []
}

/**
 * Busca un poder por id en todo el catálogo.
 */
export function findPowerById(id: string): Power | null {
  for (const heroClass of Object.keys(POWERS_BY_CLASS) as HeroClass[]) {
    const found = POWERS_BY_CLASS[heroClass].find((p) => p.id === id)
    if (found) return found
  }
  return null
}
