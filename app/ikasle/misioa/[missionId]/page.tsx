import { notFound, redirect } from 'next/navigation'
import { getStudentSession } from '@/lib/students/session'
import { createServiceClient } from '@/lib/supabase/service'
import StudentMissionView from './StudentMissionView'

export const dynamic = 'force-dynamic'

export default async function StudentMissionPage({
  params,
}: {
  params: Promise<{ missionId: string }>
}) {
  const { missionId } = await params
  const session = await getStudentSession()
  if (!session) redirect('/ikasle/sartu')

  const supabase = createServiceClient()

  // Asegurar que el alumno tenga el nodo inicial disponible
  await supabase.rpc('ensure_start_node', {
    p_student_id: session.studentId,
    p_mission_id: missionId,
  })

  // Cargar todo el detalle
  const { data, error } = await supabase.rpc('get_student_mission_detail', {
    p_student_id: session.studentId,
    p_mission_id: missionId,
  })
  if (error || !data) notFound()

  return (
    <StudentMissionView
      studentId={session.studentId}
      initialData={data as unknown as never}
    />
  )
}
