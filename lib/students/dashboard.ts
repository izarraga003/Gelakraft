import { createClient } from '@/lib/supabase/server'
import type { HeroClass } from './hero-class'
import type { AvatarConfig } from './avatar'

export type StudentDashboardData = {
  student: {
    id: string
    classroom_id: string
    full_name: string
    username: string
    avatar: string
    avatar_config: AvatarConfig
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
    avatar_config: AvatarConfig
    hero_class: HeroClass
    xp: number
    hearts: number
    max_hearts: number
  }[]
  position: number
  team: {
    id: string
    name: string
    position: number
    members: {
      id: string
      full_name: string
      hero_class: HeroClass
      avatar_config: AvatarConfig
      xp: number
    }[]
  } | null
  power_usages: {
    id: string
    power_id: string
    mana_cost: number
    used_at: string
  }[]
  pending_requests: {
    id: string
    power_id: string
    power_name: string
    mana_cost: number
    status: 'pending' | 'approved' | 'denied'
    created_at: string
    resolved_at: string | null
  }[]
  activities: {
    id: string
    activity_type: 'battle' | 'silence' | 'event' | 'reward' | 'adjustment' | 'power_used'
    outcome: 'victory' | 'defeat' | 'success' | 'failure' | 'neutral'
    xp_delta: number
    hearts_delta: number
    metadata: Record<string, unknown>
    created_at: string
    is_personal: boolean
    affected_count: number | null
  }[]
}

/**
 * Carga el dashboard del alumno via función RPC SECURITY DEFINER.
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
