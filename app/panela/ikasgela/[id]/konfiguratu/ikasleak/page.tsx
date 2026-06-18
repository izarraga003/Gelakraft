import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import IkasleakTable from './IkasleakTable'

type Params = { id: string }

export default async function IkasleakPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('id', id)
    .single()
  if (!classroom) notFound()

  const { data: students } = await supabase
    .from('students')
    .select(
      'id, full_name, username, password_plain, hero_class, xp, hearts, max_hearts, mana, max_mana'
    )
    .eq('classroom_id', id)
    .order('full_name', { ascending: true })

  return (
    <section className="konfiguratu-section">
      <header className="konfiguratu-section-header">
        <h2 className="konfiguratu-section-title">Ikasleak</h2>
        <p className="konfiguratu-section-hint">
          Hemendik ikasleen izenak, klasea, statusa eta pasahitzak kudeatu
          ditzakezu.
        </p>
      </header>

      <IkasleakTable
        classroomId={id}
        students={students ?? []}
      />
    </section>
  )
}
