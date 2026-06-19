/**
 * Balance y mecánica de la batalla contra Sugaar.
 * Todas las constantes en un único archivo para tuning rápido.
 */

// ============================================================
// CONFIGURACIÓN BASE
// ============================================================

/** Dificultad por defecto en la pantalla de setup (1-10) */
export const DEFAULT_DIFFICULTY = 5

/** Número de preguntas por defecto */
export const DEFAULT_QUESTION_COUNT = 10
export const MIN_QUESTION_COUNT = 5
export const MAX_QUESTION_COUNT = 30

/** HP base de Sugaar y de la clase (modulado por dificultad) */
const BASE_SUGAAR_HP = 100
const BASE_CLASS_HP = 100

/** Daño base de un golpe normal a Sugaar (rango) */
const NORMAL_HIT_MIN = 18
const NORMAL_HIT_MAX = 26

/** Daño de Sugaar a la clase cuando los alumnos fallan (rango) */
const ENEMY_ATTACK_MIN = 24
const ENEMY_ATTACK_MAX = 30

/** Multiplicador de daño crítico */
const CRIT_MULTIPLIER = 2

// ============================================================
// PROBABILIDADES (al responder CORRECTO)
// ============================================================
/**
 * Cuando el alumno acierta, hay tres posibilidades:
 *  - crítico: daño doble
 *  - golpe normal: daño base aleatorizado
 *  - fallo de golpe: Sugaar esquiva, 0 daño
 *
 * Estas probabilidades suman 1.
 */
export const HIT_CRIT_CHANCE = 0.1
export const HIT_MISS_CHANCE = 0.15
// 0.75 implícita: golpe normal

// ============================================================
// RECOMPENSAS
// ============================================================
const VICTORY_BASE_XP = 50
const VICTORY_XP_PER_QUESTION = 5
const VICTORY_PERFECT_BONUS = 20 // si la clase no recibió ningún ataque

const DEFAULT_HEARTS_LOSS = 1

export const MIN_HEARTS_LOSS = 0
export const MAX_HEARTS_LOSS = 5
export const DEFAULT_HEARTS_LOSS_INIT = DEFAULT_HEARTS_LOSS

// ============================================================
// FUNCIONES DERIVADAS
// ============================================================

/**
 * HP de Sugaar según dificultad.
 * Dificultad 1: Sugaar débil, fácil de matar
 * Dificultad 10: Sugaar fuerte
 */
export function computeSugaarHp(difficulty: number): number {
  // Lineal entre 70 (dif 1) y 150 (dif 10)
  const factor = 0.7 + ((difficulty - 1) / 9) * 0.8
  return Math.round(BASE_SUGAAR_HP * factor)
}

/**
 * HP de la clase según dificultad.
 * Dificultad 1: clase resistente
 * Dificultad 10: clase frágil
 */
export function computeClassHp(difficulty: number): number {
  // Lineal entre 130 (dif 1) y 70 (dif 10)
  const factor = 1.3 - ((difficulty - 1) / 9) * 0.6
  return Math.round(BASE_CLASS_HP * factor)
}

// ============================================================
// CÁLCULO DE DAÑO EN UN TURNO
// ============================================================

export type HitResult =
  | { kind: 'crit'; damage: number }
  | { kind: 'normal'; damage: number }
  | { kind: 'miss'; damage: 0 }

export type EnemyAttackResult = {
  damage: number
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * El alumno acierta la pregunta → resultado del golpe a Sugaar.
 */
export function rollPlayerHit(): HitResult {
  const r = Math.random()
  if (r < HIT_CRIT_CHANCE) {
    const baseDmg = randInt(NORMAL_HIT_MIN, NORMAL_HIT_MAX)
    return { kind: 'crit', damage: baseDmg * CRIT_MULTIPLIER }
  }
  if (r < HIT_CRIT_CHANCE + HIT_MISS_CHANCE) {
    return { kind: 'miss', damage: 0 }
  }
  return { kind: 'normal', damage: randInt(NORMAL_HIT_MIN, NORMAL_HIT_MAX) }
}

/**
 * El alumno falla la pregunta → Sugaar contraataca.
 */
export function rollEnemyAttack(): EnemyAttackResult {
  return { damage: randInt(ENEMY_ATTACK_MIN, ENEMY_ATTACK_MAX) }
}

// ============================================================
// RECOMPENSAS / PENALIZACIONES
// ============================================================

export type BattleOutcome = 'victory' | 'defeat' | 'tie'

export type BattleReward = {
  outcome: BattleOutcome
  xpDelta: number
  heartsDelta: number
  /** True si fue victoria sin recibir ningún ataque exitoso */
  perfect: boolean
}

export function computeBattleReward(args: {
  outcome: BattleOutcome
  questionCount: number
  classHpStart: number
  classHpEnd: number
  /** Cuántos corazones pierde cada alumno si la clase pierde (>=0). */
  heartsLossOnDefeat?: number
}): BattleReward {
  if (args.outcome === 'defeat') {
    const loss = Math.max(
      0,
      Math.min(MAX_HEARTS_LOSS, args.heartsLossOnDefeat ?? DEFAULT_HEARTS_LOSS)
    )
    return {
      outcome: 'defeat',
      xpDelta: 0,
      heartsDelta: -loss,
      perfect: false,
    }
  }
  if (args.outcome === 'tie') {
    return {
      outcome: 'tie',
      xpDelta: 0,
      heartsDelta: 0,
      perfect: false,
    }
  }

  const perfect = args.classHpEnd >= args.classHpStart
  let xp = VICTORY_BASE_XP + VICTORY_XP_PER_QUESTION * args.questionCount
  if (perfect) xp += VICTORY_PERFECT_BONUS

  return {
    outcome: 'victory',
    xpDelta: xp,
    heartsDelta: 0,
    perfect,
  }
}
