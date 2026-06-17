import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UstekabekoaSetup from '@/components/tools/UstekabekoaSetup'

type Params = { id: string }

export default async function UstekabekoaKonfiguratuPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/saioa-hasi')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('id', id)
    .single()
  if (!classroom) notFound()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, description')
    .order('created_at', { ascending: true })

  return (
    <UstekabekoaSetup
      classroomId={classroom.id}
      classroomName={classroom.name}
      initialEvents={events ?? []}
    />
  )
}
