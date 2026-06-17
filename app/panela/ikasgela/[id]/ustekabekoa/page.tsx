import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Ustekabekoa from '@/components/tools/Ustekabekoa'

type Params = { id: string }

export default async function UstekabekoaPage({
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

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, username')
    .eq('classroom_id', id)
    .order('full_name', { ascending: true })

  return (
    <Ustekabekoa
      classroomId={classroom.id}
      classroomName={classroom.name}
      events={events ?? []}
      students={students ?? []}
    />
  )
}
