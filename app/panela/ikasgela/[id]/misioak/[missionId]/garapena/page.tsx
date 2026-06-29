import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMissionNodeProgressAction } from '@/lib/missions/node-progress'
import GarapenaView from './GarapenaView'
import type { MissionMapId } from '@/lib/missions/maps'

export const dynamic = 'force-dynamic'

export default async function GarapenaPage({
  params,
}: {
  params: Promise<{ id: string; missionId: string }>
}) {
  const { id: classroomId, missionId } = await params
  const supabase = await createClient()

  const { data: mission } = await supabase
    .from('missions')
    .select('id, name, description, background_id, classroom_id')
    .eq('id', missionId)
    .single()

  if (!mission || mission.classroom_id !== classroomId) {
    redirect(`/panela/ikasgela/${classroomId}/misioak`)
  }

  const nodes = await getMissionNodeProgressAction(missionId)

  return (
    <GarapenaView
      classroomId={classroomId}
      missionId={missionId}
      missionName={mission.name}
      missionDescription={mission.description ?? ''}
      backgroundId={mission.background_id as MissionMapId}
      nodes={nodes}
    />
  )
}
