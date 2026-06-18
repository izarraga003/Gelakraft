import { createClient } from '@/lib/supabase/server'
import type { HeroClass } from './hero-class'

// ============================================================
// TIPOS
// ============================================================

export type StudentDashboardData = {
  student: {
    id: string
    classroom_id: string
    full_name: string
    username: string
    avatar: string
    hero_class: HeroClass
    xp: number
    hearts: number
    max_hearts: number
    mana: number
    max_mana: number
    created_at: string
    updated_at: string
  }
  classroom: {
    id: string
    name: string
    stage: string
    created_at: string
  }
  ranking: {
    id: string
    full_name: string
    avatar: string
    hero_class: HeroClass
    xp: number
    hearts: number
    max_hearts: number
  }[]
  position: number
  activities: {
    id: string
    activity_type: 'battle' | 'silence' | 'event' | 'reward'
    outcome: 'victory' | 'defeat' | 'success' | 'failure' | 'neutral'
    xp_delta: number
    hearts_delta: number
    metadata: Record<string, unknown>
    created_at: string
  }[]
}

// ============================================================
// DATA FETCHING
// ============================================================

/**
 * Carga todo el dashboard del alumno mediante la función SQL
 * SECURITY DEFINER get_student_dashboard.
 *
 * Devuelve null si el student no existe.
 */
export async function loadStudentDashboard(
  studentId: string
): Promise<StudentDashboardData | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_student_dashboard', {
    p_student_id: studentId,
  })

  if (error) {
    console.error('loadStudentDashboard error:', error)
    return null
  }
  if (!data) return null

  return data as StudentDashboardData
}
