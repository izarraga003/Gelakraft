import type { MissionMapId } from './maps'

export type Mission = {
  id: string
  classroom_id: string
  name: string
  description: string
  background_id: MissionMapId
  is_active: boolean
  final_xp_reward: number
  final_hearts_reward: number
  final_mana_reward: number
  created_at: string
  updated_at: string
}

export type NodeContentType = 'text' | 'pdf' | 'image' | 'youtube' | 'link'
export type ValidationType = 'auto' | 'manual'

export type MissionNode = {
  id: string
  mission_id: string
  title: string
  description: string
  position_x: number
  position_y: number
  content_type: NodeContentType
  content_url: string
  content_text: string
  validation_type: ValidationType
  xp_reward: number
  hearts_delta: number
  mana_reward: number
  hearts_penalty: number
  is_start: boolean
}

export type EdgeCondition = 'always' | 'success' | 'failure'

export type MissionEdge = {
  id: string
  mission_id: string
  from_node_id: string
  to_node_id: string
  condition: EdgeCondition
}

export type ProgressStatus = 'available' | 'pending_review' | 'completed' | 'failed'

export type MissionProgress = {
  id: string
  student_id: string
  mission_id: string
  node_id: string
  status: ProgressStatus
  submission_text: string
  submitted_at: string | null
  reviewed_at: string | null
}
