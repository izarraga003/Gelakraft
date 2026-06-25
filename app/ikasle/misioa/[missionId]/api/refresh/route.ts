import { NextResponse } from 'next/server'
import { getStudentSession } from '@/lib/students/session'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ missionId: string }> }
) {
  const { missionId } = await params
  const session = await getStudentSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  }
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('get_student_mission_detail', {
    p_student_id: session.studentId,
    p_mission_id: missionId,
  })
  if (error || !data) {
    return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data })
}
