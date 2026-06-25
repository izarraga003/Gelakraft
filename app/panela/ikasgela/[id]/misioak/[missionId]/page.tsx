import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMissionWithGraph } from '@/lib/missions/actions'
import MissionEditor from './MissionEditor'

export const dynamic = 'force-dynamic'

export default async function MisioEditorPage({
  params,
}: {
  params: Promise<{ id: string; missionId: string }>
}) {
  const { id: classroomId, missionId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/saioa-hasi')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name, teacher_id')
    .eq('id', classroomId)
    .single()
  if (!classroom || classroom.teacher_id !== user.id) notFound()

  const { mission, nodes, edges } = await getMissionWithGraph(missionId)
  if (!mission || mission.classroom_id !== classroomId) notFound()

  return (
    <MissionEditor
      classroomId={classroomId}
      classroomName={classroom.name}
      initialMission={mission}
      initialNodes={nodes}
      initialEdges={edges}
    />
  )
}
