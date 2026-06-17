import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Hautatzailea from '@/components/tools/Hautatzailea'

type Params = { id: string }

export default async function HautatzaileaPage({
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

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, username')
    .eq('classroom_id', id)
    .order('full_name', { ascending: true })

  return (
    <Hautatzailea
      classroomId={classroom.id}
      classroomName={classroom.name}
      students={students ?? []}
    />
  )
}
