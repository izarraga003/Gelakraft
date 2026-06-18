'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  computeBattleReward,
  type BattleOutcome,
} from './balance'

export type ApplyBattleResultInput = {
  classroomId: string
  outcome: BattleOutcome
  questionCount: number
  classHpStart: number
  classHpEnd: number
}

export type ApplyBattleResultOutput =
  | {
      success: true
      reward: {
        outcome: BattleOutcome
        xpDelta: number
        heartsDelta: number
        perfect: boolean
      }
    }
  | { success: false; error: string }

/**
 * Aplica el resultado de la batalla a todos los alumnos de la ikasgela.
 *
 * Verifica que el profesor sea dueño de la ikasgela y luego llama a la
 * función SQL `apply_battle_result`, que actualiza atómicamente XP y vidas
 * de todos los alumnos.
 */
export async function applyBattleResult(
  input: ApplyBattleResultInput
): Promise<ApplyBattleResultOutput> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Saioa hasi behar duzu.' }
  }

  // Verificar que el profesor es dueño
  const { data: classroom, error: classroomError } = await supabase
    .from('classrooms')
    .select('id, teacher_id')
    .eq('id', input.classroomId)
    .single()

  if (classroomError || !classroom || classroom.teacher_id !== user.id) {
    return { success: false, error: 'Ikasgela hori ez da zurea.' }
  }

  // Calcular recompensa en servidor (NO confiar en cliente)
  const reward = computeBattleReward({
    outcome: input.outcome,
    questionCount: input.questionCount,
    classHpStart: input.classHpStart,
    classHpEnd: input.classHpEnd,
  })

  // Aplicar a todos los alumnos + registrar en historial en una operación atómica
  const { error: rpcError } = await supabase.rpc('record_activity', {
    p_classroom_id: input.classroomId,
    p_activity_type: 'battle',
    p_outcome: reward.outcome,
    p_xp_delta: reward.xpDelta,
    p_hearts_delta: reward.heartsDelta,
    p_metadata: {
      question_count: input.questionCount,
      perfect: reward.perfect,
      class_hp_start: input.classHpStart,
      class_hp_end: input.classHpEnd,
    },
  })

  if (rpcError) {
    return {
      success: false,
      error: `Errore bat gertatu da emaitza aplikatzean: ${rpcError.message}`,
    }
  }

  revalidatePath(`/panela/ikasgela/${input.classroomId}`)
  return { success: true, reward }
}
