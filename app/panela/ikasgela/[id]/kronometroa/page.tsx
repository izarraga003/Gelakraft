import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Kronometroa from '@/components/tools/Kronometroa'

type Params = { id: string }

export default async function KronometroaPage({
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

  return <Kronometroa classroomId={classroom.id} classroomName={classroom.name} />
}
