import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BattleSetup from '@/components/battle/BattleSetup'

type Params = { id: string }

export default async function BattlePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/saioa-hasi')
  }

  // Cargar ikasgela (RLS filtra)
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!classroom) {
    notFound()
  }

  // Contar alumnos
  const { count } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('classroom_id', id)

  return (
    <BattleSetup
      classroomId={classroom.id}
      classroomName={classroom.name}
      studentCount={count ?? 0}
    />
  )
}
