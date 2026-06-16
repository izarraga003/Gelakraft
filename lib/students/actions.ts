'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateUsername, uniqueUsername } from './generate-username'
import { generatePassword } from './generate-password'

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

  // Cargar usernames existentes en esta ikasgela
  const { data: existingStudents } = await supabase
    .from('students')
    .select('username')
    .eq('classroom_id', classroomId)

  const usedUsernames = (existingStudents ?? []).map((s) => s.username)

  // Generar y preparar inserts
  const created: { fullName: string; username: string; passwordPlain: string }[] = []
  const inserts: {
    classroom_id: string
    full_name: string
    username: string
    password_hash: string
    password_plain: string
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
    })
    created.push({ fullName, username, passwordPlain })
  }

  // Insert masivo
  const { error: insertError } = await supabase.from('students').insert(inserts)

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
