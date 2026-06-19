'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { POWERS_BY_CLASS, type Power } from './catalog'
import type { HeroClass } from '@/lib/students/hero-class'

export type PowerOverride = {
  classroom_id: string
  power_id: string
  mode: 'auto' | 'manual' | null
  mana_cost: number | null
}

export type EffectivePower = Power & {
  effectiveMode: 'auto' | 'manual'
  effectiveManaCost: number
  isOverridden: boolean
}

async function assertOwnership(classroomId: string): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'Saioa hasi behar duzu.'

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('teacher_id')
    .eq('id', classroomId)
    .single()
  if (!classroom || classroom.teacher_id !== user.id) {
    return 'Ikasgela hori ez da zurea.'
  }
  return null
}

export async function listOverrides(
  classroomId: string
): Promise<Record<string, PowerOverride>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('power_overrides')
    .select('classroom_id, power_id, mode, mana_cost')
    .eq('classroom_id', classroomId)
  const map: Record<string, PowerOverride> = {}
  for (const r of (data ?? []) as PowerOverride[]) {
    map[r.power_id] = r
  }
  return map
}

/**
 * Devuelve los poderes de una clase con los overrides aplicados.
 */
export async function getEffectivePowers(
  classroomId: string,
  heroClass: HeroClass
): Promise<EffectivePower[]> {
  const overrides = await listOverrides(classroomId)
  const powers = POWERS_BY_CLASS[heroClass] ?? []
  return powers.map((p) => {
    const o = overrides[p.id]
    return {
      ...p,
      effectiveMode: (o?.mode ?? p.mode) as 'auto' | 'manual',
      effectiveManaCost: o?.mana_cost ?? p.manaCost,
      isOverridden: !!o && (o.mode !== null || o.mana_cost !== null),
    }
  })
}

/**
 * Versión para el contexto del alumno (iron-session). Usa una RPC
 * SECURITY DEFINER para bypassar RLS, ya que el alumno no tiene auth.uid().
 */
export async function getEffectivePowersForStudent(
  classroomId: string,
  heroClass: HeroClass
): Promise<EffectivePower[]> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('list_overrides_for_classroom', {
    p_classroom_id: classroomId,
  })
  const arr = (data ?? []) as {
    power_id: string
    mode: 'auto' | 'manual' | null
    mana_cost: number | null
  }[]
  const map: Record<string, { mode: 'auto' | 'manual' | null; mana_cost: number | null }> = {}
  for (const o of arr) map[o.power_id] = { mode: o.mode, mana_cost: o.mana_cost }

  const powers = POWERS_BY_CLASS[heroClass] ?? []
  return powers.map((p) => {
    const o = map[p.id]
    return {
      ...p,
      effectiveMode: (o?.mode ?? p.mode) as 'auto' | 'manual',
      effectiveManaCost: o?.mana_cost ?? p.manaCost,
      isOverridden: !!o && (o.mode !== null || o.mana_cost !== null),
    }
  })
}

export async function setOverride(input: {
  classroomId: string
  powerId: string
  mode: 'auto' | 'manual' | null
  manaCost: number | null
}): Promise<{ success: boolean; error?: string }> {
  const err = await assertOwnership(input.classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()

  // Si ambos vienen a null, borrar el override
  if (input.mode === null && input.manaCost === null) {
    const { error } = await supabase
      .from('power_overrides')
      .delete()
      .eq('classroom_id', input.classroomId)
      .eq('power_id', input.powerId)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase.from('power_overrides').upsert(
      {
        classroom_id: input.classroomId,
        power_id: input.powerId,
        mode: input.mode,
        mana_cost: input.manaCost,
      },
      { onConflict: 'classroom_id,power_id' }
    )
    if (error) return { success: false, error: error.message }
  }

  revalidatePath(`/panela/ikasgela/${input.classroomId}/konfiguratu/botereak`)
  return { success: true }
}
