'use server'

import { getStudentSession } from '@/lib/students/session'
import { createServiceClient } from '@/lib/supabase/service'

export async function submitStudentNode(
  studentId: string,
  nodeId: string,
  submissionText: string
): Promise<{ success: true; status: string } | { success: false; error: string }> {
  const session = await getStudentSession()
  if (!session || session.studentId !== studentId) {
    return { success: false, error: 'Saioa hasi behar duzu.' }
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('submit_mission_node', {
    p_student_id: studentId,
    p_node_id: nodeId,
    p_submission_text: submissionText,
  })
  if (error) return { success: false, error: error.message }
  const result = data as { success: boolean; error?: string; status?: string }
  if (!result.success) return { success: false, error: result.error ?? 'Errorea.' }
  return { success: true, status: result.status ?? 'completed' }
}
