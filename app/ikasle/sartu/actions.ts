'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudentSession } from '@/lib/students/session'

export async function loginStudent(
  formData: FormData
): Promise<{ success: false; error: string } | never> {
  const username = ((formData.get('username') as string) ?? '').trim().toLowerCase()
  const password = (formData.get('password') as string) ?? ''

  if (!username || !password) {
    return { success: false, error: 'Sartu erabiltzailea eta pasahitza.' }
  }

  // Usamos el cliente de Supabase normal (con la anon key).
  // La función find_student_for_login es SECURITY DEFINER así que pasa por encima
  // del RLS para permitir buscar alumnos sin estar autenticado como profesor.
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('find_student_for_login', { p_username: username })
    .single<{
      id: string
      classroom_id: string
      full_name: string
      username: string
      password_hash: string
    }>()

  if (error || !data) {
    // No revelamos si el usuario existe o no
    return {
      success: false,
      error: 'Erabiltzailea edo pasahitza okerra dira.',
    }
  }

  const passwordMatches = await bcrypt.compare(password, data.password_hash)
  if (!passwordMatches) {
    return {
      success: false,
      error: 'Erabiltzailea edo pasahitza okerra dira.',
    }
  }

  // Crear sesión cifrada
  const session = await getStudentSession()
  session.studentId = data.id
  session.classroomId = data.classroom_id
  session.fullName = data.full_name
  session.username = data.username
  await session.save()

  redirect('/ikasle/panela')
}
