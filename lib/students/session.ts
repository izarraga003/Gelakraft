import { getIronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

/**
 * Datos guardados en la cookie de sesión del alumno.
 * Mantenerlo mínimo — todo esto va cifrado en la cookie.
 */
export type StudentSession = {
  studentId: string
  classroomId: string
  fullName: string
  username: string
}

const SESSION_OPTIONS: SessionOptions = {
  password: process.env.STUDENT_SESSION_SECRET ?? '',
  cookieName: 'gelakraft-ikasle-saio',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 días
  },
}

/**
 * Devuelve la sesión actual del alumno. Si no hay sesión activa,
 * `session.studentId` etc. serán undefined.
 *
 * Para crear sesión:
 *   const session = await getStudentSession()
 *   session.studentId = "..."
 *   await session.save()
 *
 * Para cerrar sesión:
 *   const session = await getStudentSession()
 *   session.destroy()
 */
export async function getStudentSession() {
  if (!process.env.STUDENT_SESSION_SECRET) {
    throw new Error(
      'STUDENT_SESSION_SECRET ez dago konfiguratuta. Begiratu .env.local fitxategia.'
    )
  }
  const cookieStore = await cookies()
  return getIronSession<StudentSession>(cookieStore, SESSION_OPTIONS)
}

/**
 * Devuelve null si no hay sesión activa, o los datos del alumno si la hay.
 * Útil para Server Components.
 */
export async function getStudent(): Promise<StudentSession | null> {
  const session = await getStudentSession()
  if (!session.studentId) {
    return null
  }
  return {
    studentId: session.studentId,
    classroomId: session.classroomId,
    fullName: session.fullName,
    username: session.username,
  }
}
