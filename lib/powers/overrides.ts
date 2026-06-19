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
  name: string | null
  description: string | null
  level_required: number | null
  icon: string | null
}

export type EffectivePower = Power & {
  effectiveMode: 'auto' | 'manual'
  effectiveManaCost: number
  effectiveName: string
  effectiveDescription: string
  effectiveLevelRequired: number
  effectiveIcon: string
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

function applyOverride(
  p: Power,
  o: Partial<PowerOverride> | undefined
): EffectivePower {
  return {
    ...p,
    effectiveMode: (o?.mode ?? p.mode) as 'auto' | 'manual',
    effectiveManaCost: o?.mana_cost ?? p.manaCost,
    effectiveName: o?.name ?? p.name,
    effectiveDescription: o?.description ?? p.description,
    effectiveLevelRequired: o?.level_required ?? p.levelRequired,
    effectiveIcon: o?.icon ?? p.icon,
    isOverridden: !!o && (
      o.mode != null || o.mana_cost != null ||
      o.name != null || o.description != null ||
      o.level_required != null || o.icon != null
    ),
  }
}

export async function listOverrides(
  classroomId: string
): Promise<Record<string, PowerOverride>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('power_overrides')
    .select('classroom_id, power_id, mode, mana_cost, name, description, level_required, icon')
    .eq('classroom_id', classroomId)
  const map: Record<string, PowerOverride> = {}
  for (const r of (data ?? []) as PowerOverride[]) {
    map[r.power_id] = r
  }
  return map
}

/**
 * Devuelve los poderes de una clase con los overrides aplicados (profesor).
 */
export async function getEffectivePowers(
  classroomId: string,
  heroClass: HeroClass
): Promise<EffectivePower[]> {
  const overrides = await listOverrides(classroomId)
  const powers = POWERS_BY_CLASS[heroClass] ?? []
  return powers.map((p) => applyOverride(p, overrides[p.id]))
}

/**
 * Versión SECURITY DEFINER para el alumno (iron-session, sin auth.uid).
 */
export async function getEffectivePowersForStudent(
  classroomId: string,
  heroClass: HeroClass
): Promise<EffectivePower[]> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('list_overrides_for_classroom', {
    p_classroom_id: classroomId,
  })
  const arr = (data ?? []) as PowerOverride[]
  const map: Record<string, PowerOverride> = {}
  for (const o of arr) map[o.power_id] = o
  const powers = POWERS_BY_CLASS[heroClass] ?? []
  return powers.map((p) => applyOverride(p, map[p.id]))
}

/**
 * Upsert/borrar override. Solo los campos NO-null se sobrescriben.
 * Si todos vienen null → borra el override entero.
 */
export async function setOverride(input: {
  classroomId: string
  powerId: string
  mode?: 'auto' | 'manual' | null
  manaCost?: number | null
  name?: string | null
  description?: string | null
  levelRequired?: number | null
  icon?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const err = await assertOwnership(input.classroomId)
  if (err) return { success: false, error: err }

  const supabase = await createClient()

  const allNull =
    (input.mode === null || input.mode === undefined) &&
    (input.manaCost === null || input.manaCost === undefined) &&
    (input.name === null || input.name === undefined) &&
    (input.description === null || input.description === undefined) &&
    (input.levelRequired === null || input.levelRequired === undefined) &&
    (input.icon === null || input.icon === undefined)

  if (allNull) {
    const { error } = await supabase
      .from('power_overrides')
      .delete()
      .eq('classroom_id', input.classroomId)
      .eq('power_id', input.powerId)
    if (error) return { success: false, error: error.message }
  } else {
    const row: Record<string, unknown> = {
      classroom_id: input.classroomId,
      power_id: input.powerId,
    }
    if (input.mode !== undefined) row.mode = input.mode
    if (input.manaCost !== undefined) row.mana_cost = input.manaCost
    if (input.name !== undefined) row.name = input.name
    if (input.description !== undefined) row.description = input.description
    if (input.levelRequired !== undefined) row.level_required = input.levelRequired
    if (input.icon !== undefined) row.icon = input.icon

    const { error } = await supabase
      .from('power_overrides')
      .upsert(row, { onConflict: 'classroom_id,power_id' })
    if (error) return { success: false, error: error.message }
  }

  revalidatePath(`/panela/ikasgela/${input.classroomId}/konfiguratu/botereak`)
  revalidatePath(`/panela/ikasgela/${input.classroomId}`)
  return { success: true }
}

/**
 * Restablece un poder al catálogo por defecto (borra el override).
 */
export async function resetOverride(input: {
  classroomId: string
  powerId: string
}): Promise<{ success: boolean; error?: string }> {
  const err = await assertOwnership(input.classroomId)
  if (err) return { success: false, error: err }
  const supabase = await createClient()
  const { error } = await supabase
    .from('power_overrides')
    .delete()
    .eq('classroom_id', input.classroomId)
    .eq('power_id', input.powerId)
  if (error) return { success: false, error: error.message }
  revalidatePath(`/panela/ikasgela/${input.classroomId}/konfiguratu/botereak`)
  revalidatePath(`/panela/ikasgela/${input.classroomId}`)
  return { success: true }
}
