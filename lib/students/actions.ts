'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateUsername, uniqueUsername } from './generate-username'
import { generatePassword } from './generate-password'
import { randomHeroClass } from './hero-class'
import { randomAvatarConfig } from './avatar'

const BCRYPT_ROUNDS = 10

/**
 * Crea uno o varios alumnos en una ikasgela.
 * Acepta una lista de nombres (uno por línea o separados por comas).
 *
 * Para cada nombre:
 *  1. Genera username automáticamente (resolviendo duplicados con sufijo numérico)
 *  2. Genera contraseña memorable
 *  3. Guarda hash bcrypt + texto plano
 *
 * Devuelve la lista de alumnos creados (incluyendo password en plano).
 */
export async function createStudents(
  classroomId: string,
  namesRaw: string
): Promise<
  | { success: true; created: { fullName: string; username: string; passwordPlain: string }[] }
  | { success: false; error: string }
> {
  const supabase = await createClient()

  // Verificar que el profesor está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Saioa hasi behar duzu.' }
  }

  // Verificar que el profesor es dueño de la ikasgela
  const { data: classroom, error: classroomError } = await supabase
    .from('classrooms')
    .select('id, teacher_id')
    .eq('id', classroomId)
    .single()

  if (classroomError || !classroom || classroom.teacher_id !== user.id) {
    return { success: false, error: 'Ikasgela hori ez da zurea.' }
  }

  // Parsear nombres: una línea por alumno, ignorar líneas vacías
  const names = namesRaw
    .split(/\r?\n|,/) // saltos de línea o comas
    .map((n) => n.trim())
    .filter((n) => n.length > 0)

  if (names.length === 0) {
    return { success: false, error: 'Idatzi gutxienez ikasle baten izena.' }
  }
  if (names.length > 50) {
    return { success: false, error: 'Aldi berean 50 ikasle gehienez sor daitezke.' }
  }

  // Cargar usernames existentes EN TODA LA BASE DE DATOS (no solo en esta
  // ikasgela). Antes solo se chequeaba el aula actual, lo que permitía
  // colisiones entre aulas (p.ej. dos "Maite García" en dos clases distintas
  // generaban ambas "maite.garcia"). Eso rompe el login porque
  // find_student_for_login no filtra por aula.
  //
  // Usamos una RPC SECURITY DEFINER porque RLS limita el SELECT directo a las
  // aulas propias del profesor.
  const { data: existingStudents } = await supabase.rpc('list_all_usernames')
  const usedUsernames = (
    (existingStudents ?? []) as { username: string }[]
  ).map((s) => s.username)

  // Generar y preparar inserts
  const created: { fullName: string; username: string; passwordPlain: string }[] = []
  const inserts: {
    classroom_id: string
    full_name: string
    username: string
    password_hash: string
    password_plain: string
    hero_class: string
    avatar_config: object
  }[] = []

  for (const fullName of names) {
    const baseUsername = generateUsername(fullName)
    const username = uniqueUsername(baseUsername, usedUsernames)
    usedUsernames.push(username) // marcar como usado para el siguiente del batch

    const passwordPlain = generatePassword()
    const passwordHash = await bcrypt.hash(passwordPlain, BCRYPT_ROUNDS)

    inserts.push({
      classroom_id: classroomId,
      full_name: fullName,
      username,
      password_hash: passwordHash,
      password_plain: passwordPlain,
      hero_class: randomHeroClass(),
      avatar_config: randomAvatarConfig(),
    })
    created.push({ fullName, username, passwordPlain })
  }

  // Insert masivo con reintento si hubo una race condition (otro profesor
  // creó un alumno con el mismo username entre nuestro chequeo y el insert).
  let { error: insertError } = await supabase.from('students').insert(inserts)

  if (insertError && insertError.code === '23505') {
    // unique_violation: refrescar lista global y regenerar usernames
    const { data: refreshed } = await supabase.rpc('list_all_usernames')
    const refreshedUsernames = (
      (refreshed ?? []) as { username: string }[]
    ).map((s) => s.username)

    // Regenerar usernames para todos los del batch
    const recomputed: string[] = []
    const localUsed = [...refreshedUsernames]
    for (const ins of inserts) {
      const base = generateUsername(ins.full_name)
      const fresh = uniqueUsername(base, localUsed)
      localUsed.push(fresh)
      recomputed.push(fresh)
    }
    inserts.forEach((ins, i) => {
      ins.username = recomputed[i]
    })
    created.forEach((c, i) => {
      c.username = recomputed[i]
    })

    const retry = await supabase.from('students').insert(inserts)
    insertError = retry.error
  }

  if (insertError) {
    return {
      success: false,
      error: `Ikasleak gordetzean errorea: ${insertError.message}`,
    }
  }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  return { success: true, created }
}

/**
 * Regenera la contraseña de un alumno.
 */
export async function regeneratePassword(
  studentId: string
): Promise<
  | { success: true; newPassword: string }
  | { success: false; error: string }
> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Saioa hasi behar duzu.' }
  }

  const newPassword = generatePassword()
  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

  // Por RLS, solo se actualizará si el profesor es dueño de la ikasgela.
  const { data, error } = await supabase
    .from('students')
    .update({
      password_hash: newHash,
      password_plain: newPassword,
      updated_at: new Date().toISOString(),
    })
    .eq('id', studentId)
    .select('classroom_id')
    .single()

  if (error || !data) {
    return { success: false, error: 'Ezin izan da pasahitza eguneratu.' }
  }

  revalidatePath(`/panela/ikasgela/${data.classroom_id}`)
  return { success: true, newPassword }
}

/**
 * Borra un alumno. Por RLS solo el profesor dueño puede.
 */
export async function deleteStudent(
  studentId: string,
  classroomId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Saioa hasi behar duzu.' }
  }

  const { error } = await supabase.from('students').delete().eq('id', studentId)

  if (error) {
    return { success: false, error: 'Ezin izan da ikaslea ezabatu.' }
  }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  return { success: true }
}

/**
 * Aplica una recompensa o penalización a TODOS los alumnos de una ikasgela.
 *
 * Si se pasa `activity`, también registra una entrada en el historial.
 * Genérica: vale para cualquier herramienta (isiltasun-erronka, ustekabeko, etc.).
 */
export async function applyRewardToClassroom(
  classroomId: string,
  xpDelta: number,
  heartsDelta: number,
  activity?: {
    type: 'battle' | 'silence' | 'event' | 'reward'
    outcome: 'victory' | 'defeat' | 'success' | 'failure' | 'neutral'
    metadata?: Record<string, unknown>
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Saioa hasi behar duzu.' }
  }

  // Verificar ownership
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, teacher_id')
    .eq('id', classroomId)
    .single()

  if (!classroom || classroom.teacher_id !== user.id) {
    return { success: false, error: 'Ikasgela hori ez da zurea.' }
  }

  if (activity) {
    // Aplicar + registrar en historial (operación atómica)
    const { error } = await supabase.rpc('record_activity', {
      p_classroom_id: classroomId,
      p_activity_type: activity.type,
      p_outcome: activity.outcome,
      p_xp_delta: xpDelta,
      p_hearts_delta: heartsDelta,
      p_metadata: activity.metadata ?? {},
    })
    if (error) return { success: false, error: error.message }
  } else {
    // Solo aplicar stats sin historial
    const { error } = await supabase.rpc('apply_battle_result', {
      p_classroom_id: classroomId,
      p_xp_delta: xpDelta,
      p_hearts_delta: heartsDelta,
    })
    if (error) return { success: false, error: error.message }
  }

  revalidatePath(`/panela/ikasgela/${classroomId}`)
  return { success: true }
}


/**
 * Actualiza el nombre completo de un alumno (no toca username).
 * Verifica que el aula del alumno pertenezca al profesor autenticado.
 */
export async function updateStudentName(
  studentId: string,
  newName: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Saioa hasi behar duzu.' }

  const trimmed = newName.trim()
  if (!trimmed) {
    return { success: false, error: 'Izenak ezin du hutsik egon.' }
  }
  if (trimmed.length > 80) {
    return { success: false, error: 'Izena luzeegia da (gehienez 80 karaktere).' }
  }

  // Verificar ownership vía join
  const { data: student } = await supabase
    .from('students')
    .select('classroom_id, classrooms!inner(teacher_id)')
    .eq('id', studentId)
    .single()
  if (!student) return { success: false, error: 'Ikaslea ez da aurkitu.' }

  const classroomData = student.classrooms as unknown as
    | { teacher_id: string }
    | { teacher_id: string }[]
  const teacherId = Array.isArray(classroomData)
    ? classroomData[0]?.teacher_id
    : classroomData?.teacher_id
  if (teacherId !== user.id) {
    return { success: false, error: 'Ez duzu baimenik ikasle honetan.' }
  }

  const { error } = await supabase
    .from('students')
    .update({ full_name: trimmed })
    .eq('id', studentId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/panela/ikasgela/${student.classroom_id}`)
  return { success: true }
}
