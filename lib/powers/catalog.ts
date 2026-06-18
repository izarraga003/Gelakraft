/**
 * Catálogo de poderes por clase de héroe.
 *
 * Cada poder tiene dos comportamientos:
 *
 *   - mode: 'auto'   → el efecto se aplica en BD al instante (curar, dar XP, dar mana).
 *   - mode: 'manual' → genera una eskaera (request) que el profesor debe aprobar.
 *                      Los efectos del mundo real (días extra, descansos) los aplica
 *                      el profesor fuera del sistema; cuando aprueba, descontamos mana.
 *
 * Para poderes 'auto', el campo `effect` describe qué pasa:
 *   - heal_self  / heal_member  / heal_team_except_self  (effectValue = corazones)
 *   - mana_self  / mana_member  / mana_team_except_self  (effectValue = mana)
 *   - xp_team_all                                        (effectValue = XP)
 *
 * Para poderes 'auto' que necesitan elegir destinatario (heal_member, mana_member),
 * `requiresTarget` es true; para los demás, false.
 */

import type { HeroClass } from '@/lib/students/hero-class'

export type AutoEffect =
  | 'heal_self'
  | 'heal_member'
  | 'heal_team_except_self'
  | 'mana_member'
  | 'mana_team_except_self'
  | 'xp_team_all'

export type PowerMode =
  | { mode: 'auto'; effect: AutoEffect; effectValue: number; requiresTarget: boolean }
  | { mode: 'manual' }

export type Power = {
  id: string
  name: string
  description: string
  levelRequired: number
  manaCost: number
  collaborative: boolean
  icon: string
} & PowerMode

export const POWERS_BY_CLASS: Record<HeroClass, Power[]> = {
  // ============================================================
  // SORGINA (Magia / Sabiduría)
  // ============================================================
  sorgina: [
    {
      id: 'sorgina-argi-uhina',
      name: 'Argi-uhina',
      description: 'Taldekide guztiek (zu izan ezik) +1 mana jasotzen dute.',
      levelRequired: 2,
      manaCost: 4,
      collaborative: true,
      icon: '✨',
      mode: 'auto',
      effect: 'mana_team_except_self',
      effectValue: 1,
      requiresTarget: false,
    },
    {
      id: 'sorgina-fede-jauzia',
      name: 'Fede-jauzia',
      description: 'Ariketa baterako 12 ordu osagarri lortzen dituzu.',
      levelRequired: 5,
      manaCost: 2,
      collaborative: false,
      icon: '🌌',
      mode: 'manual',
    },
    {
      id: 'sorgina-babesa',
      name: 'Babesa',
      description: 'Ezkutu bat lortzen duzu, hurrengo bihotz galera ekiditeko.',
      levelRequired: 9,
      manaCost: 1,
      collaborative: false,
      icon: '🛡️',
      mode: 'manual',
    },
    {
      id: 'sorgina-egun-bat-gehiago',
      name: 'Egun bat gehiago',
      description: 'Talde osoarentzat egun osagarri bat ariketa baterako.',
      levelRequired: 13,
      manaCost: 3,
      collaborative: true,
      icon: '🌙',
      mode: 'manual',
    },
    {
      id: 'sorgina-patu-maltzurra',
      name: 'Patu maltzurra',
      description: 'Taldekide batek ausazko opari bat eskuratzen du.',
      levelRequired: 17,
      manaCost: 2,
      collaborative: true,
      icon: '🎲',
      mode: 'manual',
    },
    {
      id: 'sorgina-ki-intuizioa',
      name: 'Kiren intuizioa',
      description: 'Taldekideek egun osagarri bat ariketa baterako.',
      levelRequired: 23,
      manaCost: 5,
      collaborative: true,
      icon: '👁️',
      mode: 'manual',
    },
    {
      id: 'sorgina-mana-eztanda',
      name: 'Mana-eztanda',
      description: 'Taldekide bati 5 mana ematen dizkiozu (gehienez).',
      levelRequired: 29,
      manaCost: 4,
      collaborative: true,
      icon: '💥',
      mode: 'auto',
      effect: 'mana_member',
      effectValue: 5,
      requiresTarget: true,
    },
    {
      id: 'sorgina-funtsezko-fusioa',
      name: 'Funtsezko fusioa',
      description: 'Talde osoari 100 XP gehigarri.',
      levelRequired: 40,
      manaCost: 6,
      collaborative: true,
      icon: '🔮',
      mode: 'auto',
      effect: 'xp_team_all',
      effectValue: 100,
      requiresTarget: false,
    },
  ],

  // ============================================================
  // LAMIA (Curación / Agua)
  // ============================================================
  lamia: [
    {
      id: 'lamia-sendaketa-1',
      name: 'Sendaketa 1',
      description: 'Taldekide batek +2 bihotz jasotzen ditu.',
      levelRequired: 2,
      manaCost: 1,
      collaborative: true,
      icon: '💧',
      mode: 'auto',
      effect: 'heal_member',
      effectValue: 2,
      requiresTarget: true,
    },
    {
      id: 'lamia-atseden',
      name: 'Atseden hartu',
      description: '10 minutuko atsedenaldia indarrak berreskuratzeko.',
      levelRequired: 5,
      manaCost: 2,
      collaborative: false,
      icon: '☁️',
      mode: 'manual',
    },
    {
      id: 'lamia-iraupen-espiritua',
      name: 'Iraupen espiritua',
      description:
        'Hurrengo bihotz galera batetik salbatzen zara, bihotz 1 mantenduz.',
      levelRequired: 9,
      manaCost: 3,
      collaborative: true,
      icon: '🌊',
      mode: 'manual',
    },
    {
      id: 'lamia-lasaitasuna',
      name: 'Lasaitasuna',
      description: '10 minutuko atsedenaldia talde osoarentzat.',
      levelRequired: 13,
      manaCost: 4,
      collaborative: true,
      icon: '🍃',
      mode: 'manual',
    },
    {
      id: 'lamia-sendaketa-2',
      name: 'Sendaketa 2',
      description: 'Taldekide batek +5 bihotz jasotzen ditu.',
      levelRequired: 17,
      manaCost: 2,
      collaborative: true,
      icon: '💙',
      mode: 'auto',
      effect: 'heal_member',
      effectValue: 5,
      requiresTarget: true,
    },
    {
      id: 'lamia-sendaketa-zirkulua',
      name: 'Sendaketa zirkulua',
      description: 'Taldekide guztiek (zu izan ezik) +3 bihotz.',
      levelRequired: 23,
      manaCost: 4,
      collaborative: true,
      icon: '🌀',
      mode: 'auto',
      effect: 'heal_team_except_self',
      effectValue: 3,
      requiresTarget: false,
    },
    {
      id: 'lamia-sendaketa-3',
      name: 'Sendaketa 3',
      description: 'Taldekide batek +9 bihotz jasotzen ditu.',
      levelRequired: 29,
      manaCost: 3,
      collaborative: true,
      icon: '💎',
      mode: 'auto',
      effect: 'heal_member',
      effectValue: 9,
      requiresTarget: true,
    },
    {
      id: 'lamia-arimen-aliantza',
      name: 'Arimen aliantza',
      description: '20 minutuko atsedenaldia talde osoari.',
      levelRequired: 40,
      manaCost: 6,
      collaborative: true,
      icon: '🌟',
      mode: 'manual',
    },
  ],

  // ============================================================
  // JENTILA (Fuerza / Protección)
  // ============================================================
  jentila: [
    {
      id: 'jentila-babesa-1',
      name: 'Babesa 1',
      description: 'Norberari edo taldekide bati 2 ezkutu, bihotz galera bakoitzeko bat.',
      levelRequired: 2,
      manaCost: 1,
      collaborative: true,
      icon: '🛡️',
      mode: 'manual',
    },
    {
      id: 'jentila-bizitsu',
      name: 'Bizitsu',
      description: '12 ordu osagarri ariketa baterako.',
      levelRequired: 5,
      manaCost: 2,
      collaborative: false,
      icon: '⏳',
      mode: 'manual',
    },
    {
      id: 'jentila-osakidetza',
      name: 'Osakidetza',
      description: 'Zeure buruari 3 bihotz berreskuratzen dizkiozu.',
      levelRequired: 9,
      manaCost: 1,
      collaborative: false,
      icon: '❤️',
      mode: 'auto',
      effect: 'heal_self',
      effectValue: 3,
      requiresTarget: false,
    },
    {
      id: 'jentila-egun-bat',
      name: 'Egun bat gehiago!',
      description: 'Egun osagarri bat lan baterako entregatzeko.',
      levelRequired: 13,
      manaCost: 3,
      collaborative: false,
      icon: '📅',
      mode: 'manual',
    },
    {
      id: 'jentila-babesa-2',
      name: 'Babesa 2',
      description: 'Norberari edo taldekide bati 4 ezkutu.',
      levelRequired: 17,
      manaCost: 2,
      collaborative: true,
      icon: '🛡️',
      mode: 'manual',
    },
    {
      id: 'jentila-kamuflajea',
      name: 'Kamuflajea',
      description: 'Taldekide guztiek egun osagarri bat ariketa baterako.',
      levelRequired: 23,
      manaCost: 5,
      collaborative: true,
      icon: '🌲',
      mode: 'manual',
    },
    {
      id: 'jentila-denak-babestu',
      name: 'Denak babestu',
      description: 'Talde guztiari (zu izan ezik) 2 ezkutu.',
      levelRequired: 29,
      manaCost: 3,
      collaborative: true,
      icon: '🏰',
      mode: 'manual',
    },
    {
      id: 'jentila-naturarekin',
      name: 'Naturarekin bat',
      description: 'Talde guztiari laguntza handia ariketa edo erronka baterako.',
      levelRequired: 40,
      manaCost: 6,
      collaborative: true,
      icon: '⛰️',
      mode: 'manual',
    },
  ],
}

export function getPowersForClass(heroClass: HeroClass): Power[] {
  return POWERS_BY_CLASS[heroClass] ?? []
}

export function findPowerById(id: string): Power | null {
  for (const heroClass of Object.keys(POWERS_BY_CLASS) as HeroClass[]) {
    const found = POWERS_BY_CLASS[heroClass].find((p) => p.id === id)
    if (found) return found
  }
  return null
}
